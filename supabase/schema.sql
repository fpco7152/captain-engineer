-- Med spa inventory: full database setup (mirrors the live Supabase project).
--
-- Logins are managed only here, in the Supabase SQL editor (the app cannot create them):
--   select add_login('jane.doe', 'a-strong-password', 'Jane Doe');            -- staff; must pick a new password at first sign-in
--   select add_login('jane.doe', 'a-strong-password', 'Jane Doe', 'owner', false);
--   select reset_password('jane.doe', 'a-new-password');
--   select remove_login('jane.doe');                                          -- blocks sign-in, keeps history
-- People sign in with the username; it is stored as <username>@inventory.local.

create extension if not exists pgcrypto with schema extensions;

-- Staff: only active users listed here can see or change inventory.
create table public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  role text not null default 'staff' check (role in ('owner', 'staff')),
  must_change_password boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()) and active);
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()) and role = 'owner' and active);
$$;

create policy "staff can read staff list" on public.staff
  for select to authenticated using ((select public.is_staff()));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  category text not null default 'neurotoxin'
    check (category in ('neurotoxin', 'filler', 'skincare', 'supplies', 'other')),
  brand text check (char_length(brand) <= 80),
  unit text not null default 'vials' check (char_length(unit) between 1 and 30),
  quantity numeric(12,2) not null default 0 check (quantity >= 0 and quantity < 1000000),
  par_level numeric(12,2) not null default 0 check (par_level >= 0 and par_level < 1000000),
  unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0 and unit_cost < 1000000),
  supplier text check (char_length(supplier) <= 120),
  lot_number text check (char_length(lot_number) <= 60),
  expiration_date date,
  notes text check (char_length(notes) <= 1000),
  barcode text check (char_length(barcode) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create unique index products_barcode_key on public.products (barcode) where barcode is not null;
alter table public.products enable row level security;

create policy "staff read products" on public.products
  for select to authenticated using ((select public.is_staff()));
create policy "staff add products" on public.products
  for insert to authenticated with check ((select public.is_staff()));
create policy "staff edit products" on public.products
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "staff delete products" on public.products
  for delete to authenticated using ((select public.is_staff()));

-- Stock history: written only by trigger, readable by staff.
create table public.stock_movements (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  change numeric(12,2) not null,
  quantity_after numeric(12,2) not null,
  reason text not null,
  note text check (char_length(note) <= 300),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index stock_movements_product_idx on public.stock_movements (product_id, created_at desc);
create index stock_movements_created_by_idx on public.stock_movements (created_by);
create index products_updated_by_idx on public.products (updated_by);
alter table public.stock_movements enable row level security;

create policy "staff read history" on public.stock_movements
  for select to authenticated using ((select public.is_staff()));

create or replace function public.products_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger products_touch before update on public.products
  for each row execute function public.products_touch();

create or replace function public.products_log_stock() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_change numeric;
  v_reason text := coalesce(nullif(current_setting('app.stock_reason', true), ''), 'edit');
  v_note text := nullif(current_setting('app.stock_note', true), '');
begin
  if tg_op = 'INSERT' then
    v_change := new.quantity;
    if v_change = 0 then return new; end if;
    v_reason := 'starting count';
  else
    v_change := new.quantity - old.quantity;
    if v_change = 0 then return new; end if;
  end if;
  insert into public.stock_movements (product_id, change, quantity_after, reason, note, created_by)
  values (new.id, v_change, new.quantity, v_reason, v_note, auth.uid());
  return new;
end;
$$;

create trigger products_log_stock after insert or update of quantity on public.products
  for each row execute function public.products_log_stock();

create or replace function public.adjust_stock(p_product_id uuid, p_change numeric, p_reason text, p_note text default null)
returns public.products
language plpgsql security invoker set search_path = '' as $$
declare
  v_row public.products;
begin
  if not public.is_staff() then
    raise exception 'Not allowed';
  end if;
  if p_change is null or p_change = 0 or abs(p_change) >= 1000000 then
    raise exception 'Enter an amount other than zero';
  end if;
  if p_reason not in ('used', 'received', 'wasted', 'expired', 'returned', 'count correction') then
    raise exception 'Unknown reason';
  end if;
  perform set_config('app.stock_reason', p_reason, true);
  perform set_config('app.stock_note', left(coalesce(p_note, ''), 300), true);

  begin
    update public.products set quantity = quantity + p_change
    where id = p_product_id
    returning * into v_row;
  exception
    when check_violation then
      raise exception 'Not enough in stock for that change';
  end;

  perform set_config('app.stock_reason', '', true);
  perform set_config('app.stock_note', '', true);

  if v_row.id is null then
    raise exception 'Product not found';
  end if;
  return v_row;
end;
$$;

-- Logins are created only by the owner from the app; any other sign-up is rejected.
create or replace function public.block_public_signups() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(current_setting('app.creating_login', true), '') <> '1' then
    raise exception 'Sign-ups are disabled. Create logins in the SQL editor: select add_login(''username'', ''password'', ''Full name'');';
  end if;
  return new;
end;
$$;
revoke execute on function public.block_public_signups() from public, anon, authenticated;

create trigger block_public_signups before insert on auth.users
  for each row execute function public.block_public_signups();

create or replace function public._create_login(p_email text, p_password text, p_name text, p_role text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := gen_random_uuid();
  v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address';
  end if;
  if char_length(p_password) < 10 then
    raise exception 'Password must be at least 10 characters';
  end if;
  if p_role not in ('owner', 'staff') then
    raise exception 'Unknown role';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Enter a name';
  end if;
  if exists (select 1 from auth.users where email = v_email) then
    raise exception 'That email already has a login';
  end if;

  perform set_config('app.creating_login', '1', true);
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', p_name), now(), now(),
    '', '', '', ''
  );
  perform set_config('app.creating_login', '', true);

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
    jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
    'email', now(), now(), now());

  insert into public.staff (user_id, display_name, role, must_change_password)
  values (v_id, left(trim(p_name), 60), p_role, true);

  return v_id;
end;
$$;

create or replace function public.mark_password_changed()
returns void
language sql security definer set search_path = '' as $$
  update public.staff set must_change_password = false where user_id = (select auth.uid());
$$;

revoke execute on function public._create_login(text, text, text, text) from public, anon, authenticated;
create or replace function public.login_email(p_username text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  v text := lower(trim(p_username));
begin
  if v !~ '^[a-z0-9][a-z0-9._-]{2,39}$' then
    raise exception 'Usernames must be 3-40 characters: letters, numbers, dots, dashes or underscores';
  end if;
  return v || '@inventory.local';
end;
$$;

create or replace function public.add_login(p_username text, p_password text, p_name text, p_role text default 'staff', p_must_change_password boolean default true)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  v_id := public._create_login(public.login_email(p_username), p_password, p_name, p_role);
  update public.staff set must_change_password = p_must_change_password where user_id = v_id;
  return 'Created login ' || lower(trim(p_username));
end;
$$;

create or replace function public.reset_password(p_username text, p_password text, p_must_change_password boolean default true)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if char_length(p_password) < 10 then
    raise exception 'Password must be at least 10 characters';
  end if;
  select id into v_id from auth.users where email = public.login_email(p_username);
  if v_id is null then
    raise exception 'No login named %', p_username;
  end if;
  update auth.users
    set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), banned_until = null, updated_at = now()
    where id = v_id;
  update public.staff set must_change_password = p_must_change_password, active = true where user_id = v_id;
  return 'Password reset for ' || lower(trim(p_username));
end;
$$;

create or replace function public.remove_login(p_username text)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where email = public.login_email(p_username);
  if v_id is null then
    raise exception 'No login named %', p_username;
  end if;
  update public.staff set active = false where user_id = v_id;
  update auth.users set banned_until = 'infinity' where id = v_id;
  return 'Removed login ' || lower(trim(p_username)) || ' (history is kept)';
end;
$$;

revoke execute on function public.login_email(text) from public, anon, authenticated;
revoke execute on function public.add_login(text, text, text, text, boolean) from public, anon, authenticated;
revoke execute on function public.reset_password(text, text, boolean) from public, anon, authenticated;
revoke execute on function public.remove_login(text) from public, anon, authenticated;
revoke execute on function public.mark_password_changed() from public, anon;
revoke execute on function public.adjust_stock(uuid, numeric, text, text) from public, anon;
revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.is_owner() from public, anon;
revoke execute on function public.products_log_stock() from public, anon, authenticated;
revoke execute on function public.products_touch() from public, anon, authenticated;
grant execute on function public.mark_password_changed() to authenticated;
grant execute on function public.adjust_stock(uuid, numeric, text, text) to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_owner() to authenticated;

revoke select, insert, update, delete, truncate, references, trigger
  on public.staff, public.products, public.stock_movements from anon;

alter publication supabase_realtime add table public.products, public.stock_movements;

insert into public.products (name, category, brand, unit, par_level) values
  ('Botox 100U vial', 'neurotoxin', 'Allergan', 'vials', 2),
  ('Dysport 300U vial', 'neurotoxin', 'Galderma', 'vials', 2),
  ('Jeuveau 100U vial', 'neurotoxin', 'Evolus', 'vials', 2),
  ('Juvéderm Voluma XC 1mL', 'filler', 'Allergan', 'syringes', 2),
  ('Juvéderm Ultra XC 1mL', 'filler', 'Allergan', 'syringes', 2),
  ('Restylane Lyft 1mL', 'filler', 'Galderma', 'syringes', 2);

-- ---------------------------------------------------------------------------
-- Lot & expiration tracking (see migrations lot_tracking_tables / lot_tracking_logic
-- / lots_after_fk_guard in the Supabase project for the full function bodies).
-- products.track_lots      : when true, stock changes only through lots.
-- product_lots             : one row per lot with its own expiration and count.
-- receive_stock(...)       : receive into a lot (lot + expiration required, not expired,
--                            a known lot must keep its expiration).
-- use_stock(lot, qty, why) : check out from a lot (used / wasted / expired);
--                            expired lots can't be checked out as used.
-- set_lot_count(lot, qty)  : count correction.
-- stock_movements.lot_id / lot_number record which lot each change touched.

-- ---------------------------------------------------------------------------
-- Activity log (migrations activity_log_stamps / activity_change_log).
-- staff.initials            : auto-filled from the name (e.g. "Ali Mohamadi" -> AM);
--                             change it in the staff table if needed.
-- stock_movements           : product_name + actor_initials stamped on insert; history
--                             is kept when a product is deleted (product_id set null).
-- change_log                : detail edits (name, cost, reorder level, barcode, lot fixes,
--                             products added/deleted) with before/after and initials.
-- activity (view)           : stock_movements + change_log in one feed for the app.

