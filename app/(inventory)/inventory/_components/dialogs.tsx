"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, KeyRound, Loader2, Trash2, UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import {
  CATEGORIES,
  type Category,
  type Movement,
  type Product,
  type Staff,
  fmtNum,
  friendlyError,
  normalizeProduct,
} from "./types"
import { FieldLabel } from "./fields"

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="-mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export const btn = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 active:scale-[.98] disabled:opacity-50",
  secondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[.98] disabled:opacity-50",
  danger:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[.98] disabled:opacity-50",
}

const input =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className={btn.secondary} onClick={onClose}>
            Cancel
          </button>
          <button
            className={btn.danger}
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await onConfirm()
                onClose()
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-slate-600">{message}</p>
    </Modal>
  )
}

const DEFAULT_UNIT: Record<Category, string> = {
  neurotoxin: "vials",
  filler: "syringes",
  skincare: "bottles",
  supplies: "boxes",
  other: "units",
}

export function AddProductDialog({
  open,
  onClose,
  onAdded,
  defaultCategory,
}: {
  open: boolean
  onClose: () => void
  onAdded: (p: Product) => void
  defaultCategory: Category
}) {
  const blank = () => ({
    name: "",
    category: defaultCategory,
    brand: "",
    unit: DEFAULT_UNIT[defaultCategory],
    quantity: "",
    par_level: "",
    unit_cost: "",
    lot_number: "",
    expiration_date: "",
    supplier: "",
  })
  const [f, setF] = useState(blank)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setF(blank())
      setError("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const num = (s: string) => (s.trim() === "" ? 0 : Number(s.replace(/[$,\s]/g, "")))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const values = { quantity: num(f.quantity), par_level: num(f.par_level), unit_cost: num(f.unit_cost) }
    if (!f.name.trim()) return setError("Give the product a name.")
    if (Object.values(values).some((v) => !Number.isFinite(v) || v < 0 || v >= 1_000_000))
      return setError("Quantities and cost must be numbers zero or more.")
    setBusy(true)
    const { data, error: err } = await supabase
      .from("products")
      .insert({
        name: f.name.trim(),
        category: f.category,
        brand: f.brand.trim() || null,
        unit: f.unit.trim() || DEFAULT_UNIT[f.category],
        lot_number: f.lot_number.trim() || null,
        expiration_date: f.expiration_date || null,
        supplier: f.supplier.trim() || null,
        ...values,
      })
      .select()
      .single()
    setBusy(false)
    if (err) return setError(friendlyError(err))
    onAdded(normalizeProduct(data as Product))
    toast.success(`Added ${data.name}`)
    onClose()
  }

  const set = (k: keyof ReturnType<typeof blank>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add product"
      footer={
        <>
          <button className={btn.secondary} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btn.primary} form="add-product" type="submit" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Add product
          </button>
        </>
      }
    >
      <form id="add-product" onSubmit={submit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FieldLabel htmlFor="np-name">Name</FieldLabel>
          <input id="np-name" className={input} value={f.name} onChange={set("name")} placeholder="e.g. Dysport 300U vial" maxLength={120} autoFocus />
        </div>
        <div>
          <FieldLabel htmlFor="np-cat">Category</FieldLabel>
          <select
            id="np-cat"
            className={input}
            value={f.category}
            onChange={(e) => {
              const c = e.target.value as Category
              setF((prev) => ({ ...prev, category: c, unit: DEFAULT_UNIT[c] }))
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="np-unit">Counted in</FieldLabel>
          <input id="np-unit" className={input} value={f.unit} onChange={set("unit")} placeholder="vials" maxLength={30} />
        </div>
        <div>
          <FieldLabel htmlFor="np-qty">On hand now</FieldLabel>
          <input id="np-qty" className={input} inputMode="decimal" value={f.quantity} onChange={set("quantity")} placeholder="0" />
        </div>
        <div>
          <FieldLabel htmlFor="np-par">Reorder when at</FieldLabel>
          <input id="np-par" className={input} inputMode="decimal" value={f.par_level} onChange={set("par_level")} placeholder="2" />
        </div>
        <div>
          <FieldLabel htmlFor="np-cost">Cost each ($)</FieldLabel>
          <input id="np-cost" className={input} inputMode="decimal" value={f.unit_cost} onChange={set("unit_cost")} placeholder="0.00" />
        </div>
        <div>
          <FieldLabel htmlFor="np-brand">Brand</FieldLabel>
          <input id="np-brand" className={input} value={f.brand} onChange={set("brand")} placeholder="Optional" maxLength={80} />
        </div>
        <div>
          <FieldLabel htmlFor="np-lot">Lot #</FieldLabel>
          <input id="np-lot" className={input} value={f.lot_number} onChange={set("lot_number")} placeholder="Optional" maxLength={60} />
        </div>
        <div>
          <FieldLabel htmlFor="np-exp">Expires</FieldLabel>
          <input id="np-exp" type="date" className={input} value={f.expiration_date} onChange={set("expiration_date")} />
        </div>
        <div className="col-span-2">
          <FieldLabel htmlFor="np-sup">Supplier</FieldLabel>
          <input id="np-sup" className={input} value={f.supplier} onChange={set("supplier")} placeholder="Optional" maxLength={120} />
        </div>
        {error && <p className="col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  )
}

const REASON_LABEL: Record<string, string> = {
  edit: "Count updated",
  "starting count": "Starting count",
  used: "Used",
  received: "Received",
  wasted: "Wasted",
  expired: "Expired",
  returned: "Returned",
  "count correction": "Count correction",
}

export function HistoryDialog({
  product,
  staffById,
  onClose,
}: {
  product: Product | null
  staffById: Map<string, Staff>
  onClose: () => void
}) {
  const [rows, setRows] = useState<Movement[] | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!product) return
    setRows(null)
    setError("")
    supabase
      .from("stock_movements")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error: err }) => {
        if (err) setError(friendlyError(err))
        else setRows((data as Movement[]).map((m) => ({ ...m, change: Number(m.change), quantity_after: Number(m.quantity_after) })))
      })
  }, [product])

  return (
    <Modal open={!!product} onClose={onClose} title={product ? `History · ${product.name}` : "History"}>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {!rows && !error && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}
      {rows && rows.length === 0 && <p className="py-8 text-center text-slate-500">No stock changes recorded yet.</p>}
      {rows && rows.length > 0 && (
        <ol className="divide-y divide-slate-100">
          {rows.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {REASON_LABEL[m.reason] ?? m.reason}
                  <span className="font-normal text-slate-500"> · now {fmtNum(m.quantity_after)} {product?.unit}</span>
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(m.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  {m.created_by && staffById.get(m.created_by) ? ` · ${staffById.get(m.created_by)!.display_name}` : ""}
                </p>
                {m.note && <p className="mt-1 text-sm text-slate-600">“{m.note}”</p>}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums ${
                  m.change > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {m.change > 0 ? "+" : ""}
                {fmtNum(m.change)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  )
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  autoComplete: string
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        className={`${input} pr-11`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export { PasswordInput }

export function ChangePasswordForm({ onDone, submitLabel = "Save new password" }: { onDone: () => void; submitLabel?: string }) {
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (pw.length < 10) return setError("Use at least 10 characters.")
    if (pw !== pw2) return setError("The two passwords don't match.")
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password: pw })
    if (err) {
      setBusy(false)
      return setError(/same/i.test(err.message) ? "Choose a password different from your current one." : friendlyError(err))
    }
    await supabase.rpc("mark_password_changed")
    setBusy(false)
    toast.success("Password updated")
    onDone()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <FieldLabel htmlFor="pw1">New password</FieldLabel>
        <PasswordInput id="pw1" value={pw} onChange={setPw} autoComplete="new-password" placeholder="At least 10 characters" />
      </div>
      <div>
        <FieldLabel htmlFor="pw2">Type it again</FieldLabel>
        <PasswordInput id="pw2" value={pw2} onChange={setPw2} autoComplete="new-password" />
      </div>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <button type="submit" className={`${btn.primary} w-full`} disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  )
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  const bytes = new Uint32Array(16)
  crypto.getRandomValues(bytes)
  const s = Array.from(bytes, (b) => chars[b % chars.length]).join("")
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}`
}

export function TeamDialog({
  open,
  onClose,
  staff,
  me,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  staff: Staff[]
  me: Staff
  onChanged: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"staff" | "owner">("staff")
  const [pw, setPw] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<{ email: string; pw: string } | null>(null)
  const [removing, setRemoving] = useState<Staff | null>(null)
  const [resetFor, setResetFor] = useState<{ s: Staff; pw: string } | null>(null)

  useEffect(() => {
    if (open) {
      setName("")
      setEmail("")
      setRole("staff")
      setPw(generatePassword())
      setError("")
      setCreated(null)
      setResetFor(null)
    }
  }, [open])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setBusy(true)
    const { error: err } = await supabase.rpc("owner_add_staff", { p_email: email, p_password: pw, p_name: name, p_role: role })
    setBusy(false)
    if (err) return setError(friendlyError(err))
    setCreated({ email: email.trim().toLowerCase(), pw })
    setName("")
    setEmail("")
    setPw(generatePassword())
    onChanged()
  }

  const active = staff.filter((s) => s.active)

  return (
    <>
      <Modal open={open} onClose={onClose} title="Team logins" wide>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {active.map((s) => (
            <li key={s.user_id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                  {s.display_name} {s.user_id === me.user_id && <span className="text-slate-400">(you)</span>}
                </p>
                <p className="text-sm text-slate-500">{s.role === "owner" ? "Owner · can manage logins" : "Staff"}</p>
              </div>
              {s.user_id !== me.user_id && (
                <div className="flex shrink-0 gap-1">
                  <button
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label={`Reset password for ${s.display_name}`}
                    title="Reset password"
                    onClick={() => setResetFor({ s, pw: generatePassword() })}
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    aria-label={`Remove ${s.display_name}`}
                    title="Remove login"
                    onClick={() => setRemoving(s)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {resetFor && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              New temporary password for <strong>{resetFor.s.display_name}</strong>:
            </p>
            <p className="my-2 select-all font-mono text-lg tracking-wide text-slate-900">{resetFor.pw}</p>
            <div className="flex gap-2">
              <button className={btn.secondary} onClick={() => setResetFor(null)}>
                Cancel
              </button>
              <button
                className={btn.primary}
                onClick={async () => {
                  const { error: err } = await supabase.rpc("owner_reset_password", { p_user_id: resetFor.s.user_id, p_password: resetFor.pw })
                  if (err) return toast.error(friendlyError(err))
                  toast.success(`Password reset. Give ${resetFor.s.display_name} the new password.`)
                  setResetFor(null)
                }}
              >
                Set this password
              </button>
            </div>
          </div>
        )}

        <h3 className="mb-3 mt-6 flex items-center gap-2 font-semibold text-slate-900">
          <UserPlus className="h-4 w-4" /> Add a login
        </h3>
        {created && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Login created. Share these with them; they&apos;ll pick their own password the first time they sign in.
            <p className="mt-2 font-mono text-base text-slate-900">
              {created.email}
              <br />
              <span className="select-all">{created.pw}</span>
            </p>
          </div>
        )}
        <form onSubmit={add} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="t-name">Name</FieldLabel>
            <input id="t-name" className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
          </div>
          <div>
            <FieldLabel htmlFor="t-email">Email</FieldLabel>
            <input id="t-email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
          </div>
          <div>
            <FieldLabel htmlFor="t-pw">Temporary password</FieldLabel>
            <input id="t-pw" className={`${input} font-mono`} value={pw} onChange={(e) => setPw(e.target.value)} minLength={10} required />
          </div>
          <div>
            <FieldLabel htmlFor="t-role">Access</FieldLabel>
            <select id="t-role" className={input} value={role} onChange={(e) => setRole(e.target.value as "staff" | "owner")}>
              <option value="staff">Staff (view and edit inventory)</option>
              <option value="owner">Owner (also manages logins)</option>
            </select>
          </div>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button type="submit" className={btn.primary} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Create login
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!removing}
        title="Remove login?"
        message={`${removing?.display_name} will be signed out and won't be able to sign in again. Their past changes stay in the history.`}
        confirmLabel="Remove login"
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          const { error: err } = await supabase.rpc("owner_remove_staff", { p_user_id: removing!.user_id })
          if (err) {
            toast.error(friendlyError(err))
            return
          }
          toast.success(`${removing!.display_name} removed`)
          onChanged()
        }}
      />
    </>
  )
}
