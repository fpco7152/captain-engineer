-- Med spa inventory: full database setup (mirrors the live Supabase project).
-- Run in a fresh Supabase project's SQL editor, then create the first owner with:
--   select public._create_login('you@example.com', '<temporary password>', 'Your name', 'owner');

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
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
    raise exception 'Sign-ups are disabled';
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

create or replace function public.owner_add_staff(p_email text, p_password text, p_name text, p_role text default 'staff')
returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_owner() then
    raise exception 'Only the owner can add logins';
  end if;
  return public._create_login(p_email, p_password, p_name, p_role);
end;
$$;

create or replace function public.owner_remove_staff(p_user_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_owner() then
    raise exception 'Only the owner can remove logins';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'You cannot remove your own login';
  end if;
  update public.staff set active = false where user_id = p_user_id;
  update auth.users set banned_until = 'infinity' where id = p_user_id;
end;
$$;

create or replace function public.owner_reset_password(p_user_id uuid, p_password text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_owner() then
    raise exception 'Only the owner can reset passwords';
  end if;
  if char_length(p_password) < 10 then
    raise exception 'Password must be at least 10 characters';
  end if;
  if not exists (select 1 from public.staff where user_id = p_user_id and active) then
    raise exception 'Login not found';
  end if;
  update auth.users
    set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now()
    where id = p_user_id;
  update public.staff set must_change_password = (p_user_id <> auth.uid()) where user_id = p_user_id;
end;
$$;

create or replace function public.mark_password_changed()
returns void
language sql security definer set search_path = '' as $$
  update public.staff set must_change_password = false where user_id = (select auth.uid());
$$;

revoke execute on function public._create_login(text, text, text, text) from public, anon, authenticated;
revoke execute on function public.owner_add_staff(text, text, text, text) from public, anon;
revoke execute on function public.owner_remove_staff(uuid) from public, anon;
revoke execute on function public.owner_reset_password(uuid, text) from public, anon;
revoke execute on function public.mark_password_changed() from public, anon;
revoke execute on function public.adjust_stock(uuid, numeric, text, text) from public, anon;
revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.is_owner() from public, anon;
revoke execute on function public.products_log_stock() from public, anon, authenticated;
revoke execute on function public.products_touch() from public, anon, authenticated;
grant execute on function public.owner_add_staff(text, text, text, text) to authenticated;
grant execute on function public.owner_remove_staff(uuid) to authenticated;
grant execute on function public.owner_reset_password(uuid, text) to authenticated;
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
