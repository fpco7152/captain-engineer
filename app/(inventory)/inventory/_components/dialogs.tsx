"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { CATEGORIES, LOT_CATEGORIES, type Category, type Product, friendlyError, normalizeProduct } from "./types"
import { FieldLabel } from "./fields"
import { ScanButton, ScanCodeDialog } from "./camera"

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

export type ProductPrefill = { barcode?: string; lot_number?: string; expiration_date?: string }

export function AddProductDialog({
  open,
  onClose,
  onAdded,
  defaultCategory,
  prefill,
  products = [],
}: {
  open: boolean
  onClose: () => void
  onAdded: (p: Product) => void
  defaultCategory: Category
  prefill?: ProductPrefill
  products?: Product[]
}) {
  const blank = () => ({
    name: "",
    category: defaultCategory,
    brand: "",
    unit: DEFAULT_UNIT[defaultCategory],
    quantity: "",
    par_level: "",
    unit_cost: "",
    lot_number: prefill?.lot_number ?? "",
    expiration_date: prefill?.expiration_date ?? "",
    supplier: "",
    barcode: prefill?.barcode ?? "",
    track_lots: LOT_CATEGORIES.includes(defaultCategory),
  })
  const [f, setF] = useState(blank)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [scanning, setScanning] = useState(false)

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
    const startingLot = f.track_lots && values.quantity > 0
    if (startingLot && (!f.lot_number.trim() || !f.expiration_date))
      return setError("Enter the lot number and expiration for the starting count, or leave On hand at 0 and receive it later.")
    setBusy(true)
    const { data, error: err } = await supabase
      .from("products")
      .insert({
        name: f.name.trim(),
        category: f.category,
        brand: f.brand.trim() || null,
        unit: f.unit.trim() || DEFAULT_UNIT[f.category],
        lot_number: f.track_lots ? null : f.lot_number.trim() || null,
        expiration_date: f.track_lots ? null : f.expiration_date || null,
        supplier: f.supplier.trim() || null,
        barcode: f.barcode.trim() || null,
        track_lots: f.track_lots,
        ...values,
        quantity: f.track_lots ? 0 : values.quantity,
      })
      .select()
      .single()
    if (err) {
      setBusy(false)
      return setError(friendlyError(err))
    }
    if (startingLot) {
      const { error: lotErr } = await supabase.rpc("receive_stock", {
        p_product_id: data.id,
        p_lot: f.lot_number,
        p_expiry: f.expiration_date,
        p_qty: values.quantity,
        p_note: "Starting count",
      })
      if (lotErr) toast.error(`Product added, but the starting count wasn't saved: ${friendlyError(lotErr)}`)
    }
    setBusy(false)
    onAdded(normalizeProduct(data as Product))
    toast.success(`Added ${data.name}`)
    onClose()
  }

  const set = (k: keyof ReturnType<typeof blank>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }))

  return (
    <>
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
              setF((prev) => ({ ...prev, category: c, unit: DEFAULT_UNIT[c], track_lots: LOT_CATEGORIES.includes(c) }))
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
          <input id="np-lot" className={input} value={f.lot_number} onChange={set("lot_number")} placeholder={f.track_lots ? "Needed for a starting count" : "Optional"} maxLength={60} />
        </div>
        <div>
          <FieldLabel htmlFor="np-exp">Expires</FieldLabel>
          <input id="np-exp" type="date" className={input} value={f.expiration_date} onChange={set("expiration_date")} />
        </div>
        <label className="col-span-2 flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            checked={f.track_lots}
            onChange={(e) => setF((prev) => ({ ...prev, track_lots: e.target.checked }))}
            className="mt-0.5 h-5 w-5 accent-teal-700"
          />
          <span>
            <span className="font-medium text-slate-900">Lot &amp; expiration confirmation</span>
            <span className="block text-slate-500">Recommended for toxins and fillers. A starting count needs its lot and expiration.</span>
          </span>
        </label>
        <div className="col-span-2">
          <FieldLabel htmlFor="np-barcode">Barcode</FieldLabel>
          <div className="flex gap-2">
            <input
              id="np-barcode"
              className={`${input} font-mono`}
              value={f.barcode}
              onChange={set("barcode")}
              placeholder="Scan or type"
              maxLength={80}
              autoComplete="off"
            />
            <ScanButton onClick={() => setScanning(true)} />
          </div>
          {(() => {
            const owner = f.barcode.trim() && products.find((p) => p.barcode === f.barcode.trim())
            return owner ? (
              <p className="mt-1.5 text-sm text-rose-700">This barcode already belongs to {owner.name}. Scan a different box or clear it.</p>
            ) : null
          })()}
        </div>
        <div className="col-span-2">
          <FieldLabel htmlFor="np-sup">Supplier</FieldLabel>
          <input id="np-sup" className={input} value={f.supplier} onChange={set("supplier")} placeholder="Optional" maxLength={120} />
        </div>
        {error && <p className="col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
    <ScanCodeDialog
      open={scanning}
      title="Scan the product's barcode"
      onClose={() => setScanning(false)}
      onResult={(info) =>
        setF((prev) => ({
          ...prev,
          barcode: info.key,
          lot_number: prev.lot_number || info.lot || "",
          expiration_date: prev.expiration_date || info.expiry || "",
        }))
      }
    />
    </>
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

export function LotStartDialog({
  product,
  onClose,
  onConfirm,
}: {
  product: Product | null
  onClose: () => void
  onConfirm: (lot: string, expiry: string) => Promise<boolean>
}) {
  const [lot, setLot] = useState("")
  const [exp, setExp] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => {
    if (product) {
      setLot(product.lot_number ?? "")
      setExp(product.expiration_date ?? "")
      setError("")
    }
  }, [product])
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lot.trim() || !exp) return setError("Enter the lot number and expiration printed on the boxes you have.")
    setBusy(true)
    const ok = await onConfirm(lot.trim(), exp)
    setBusy(false)
    if (ok) onClose()
  }
  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title="Turn on lot confirmation"
      footer={
        <>
          <button className={btn.secondary} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btn.primary} form="lot-start" type="submit" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Turn on
          </button>
        </>
      }
    >
      {product && (
        <form id="lot-start" onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-600">
            You have <strong>{product.quantity} {product.unit}</strong> of {product.name} on hand. Which lot are they from? If they come from more
            than one lot, enter the main one now and correct the lot counts afterwards.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="ls-lot">Lot number</FieldLabel>
              <input id="ls-lot" className={`${input} font-mono uppercase`} value={lot} onChange={(e) => setLot(e.target.value)} maxLength={60} autoComplete="off" />
            </div>
            <div>
              <FieldLabel htmlFor="ls-exp">Expires</FieldLabel>
              <input id="ls-exp" type="date" className={input} value={exp} onChange={(e) => setExp(e.target.value)} />
            </div>
          </div>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <button type="submit" className="hidden" />
        </form>
      )}
    </Modal>
  )
}
