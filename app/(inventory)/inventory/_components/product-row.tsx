"use client"

import { useState } from "react"
import { ChevronDown, History, Trash2 } from "lucide-react"
import { CATEGORIES, type Category, type Product, fmtDate, fmtMoney, fmtNum, productStatuses } from "./types"
import { EditableDate, EditableNumber, EditableSelect, EditableText, FieldLabel, QuantityStepper } from "./fields"

const PILL: Record<string, string> = {
  expired: "bg-rose-100 text-rose-800 ring-rose-200",
  out: "bg-rose-100 text-rose-800 ring-rose-200",
  low: "bg-amber-100 text-amber-900 ring-amber-200",
  expiring: "bg-orange-100 text-orange-900 ring-orange-200",
}

export function StatusPills({ product }: { product: Product }) {
  const statuses = productStatuses(product)
  if (statuses.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((s) => (
        <span key={s.key} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${PILL[s.key]}`}>
          {s.label}
        </span>
      ))}
    </div>
  )
}

function qtyTone(p: Product) {
  if (p.quantity <= 0) return "text-rose-700"
  if (p.par_level > 0 && p.quantity <= p.par_level) return "text-amber-700"
  return "text-slate-900"
}

function Meta({ product }: { product: Product }) {
  const bits = [
    product.brand,
    product.lot_number && `Lot ${product.lot_number}`,
    product.expiration_date && `Exp ${fmtDate(product.expiration_date)}`,
  ].filter(Boolean)
  if (bits.length === 0) return null
  return <p className="truncate text-sm text-slate-500">{bits.join(" · ")}</p>
}

export function ViewRow({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-semibold text-slate-900">{product.name}</p>
        <Meta product={product} />
        <StatusPills product={product} />
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-3xl font-bold leading-none tabular-nums ${qtyTone(product)}`}>{fmtNum(product.quantity)}</p>
        <p className="mt-1 text-xs text-slate-500">{product.unit}</p>
        {product.par_level > 0 && <p className="text-[11px] text-slate-400">reorder at {fmtNum(product.par_level)}</p>}
      </div>
    </button>
  )
}

export type FieldPatch = Partial<
  Pick<
    Product,
    | "name"
    | "category"
    | "brand"
    | "unit"
    | "quantity"
    | "par_level"
    | "unit_cost"
    | "supplier"
    | "lot_number"
    | "expiration_date"
    | "notes"
    | "barcode"
  >
>

export function EditRow({
  product,
  onPatch,
  onStep,
  onDelete,
  onHistory,
}: {
  product: Product
  onPatch: (patch: FieldPatch) => Promise<void>
  onStep: (delta: number) => void
  onDelete: () => void
  onHistory: () => void
}) {
  const [open, setOpen] = useState(false)
  const p = product
  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-2">
        <EditableText
          value={p.name}
          onSave={(v) => onPatch({ name: v ?? p.name })}
          label="Product name"
          required
          className="min-w-0 flex-1"
          inputClassName="font-semibold"
        />
        <button
          type="button"
          onClick={onHistory}
          title="Stock history"
          aria-label={`Stock history for ${p.name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <History className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-2">
        <StatusPills product={p} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-[minmax(220px,1.4fr)_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <FieldLabel>On hand</FieldLabel>
          <QuantityStepper value={p.quantity} unit={p.unit} onStep={onStep} onSet={(v) => onPatch({ quantity: v })} />
        </div>
        <div>
          <FieldLabel>Reorder at</FieldLabel>
          <EditableNumber value={p.par_level} onSave={(v) => onPatch({ par_level: v })} label="Reorder level" />
        </div>
        <div>
          <FieldLabel>Cost each</FieldLabel>
          <EditableNumber value={p.unit_cost} onSave={(v) => onPatch({ unit_cost: v })} label="Cost per item" prefix="$" />
        </div>
        <div className="col-span-2 flex items-end md:col-span-1">
          <div className="w-full rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
            <span className="text-slate-500">Value </span>
            <span className="font-semibold tabular-nums text-slate-900">{fmtMoney(p.quantity * p.unit_cost)}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1 rounded-md py-1 text-sm font-medium text-teal-700 hover:text-teal-900"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        {open ? "Hide details" : "More details"}
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 md:grid-cols-4">
          <div>
            <FieldLabel>Category</FieldLabel>
            <EditableSelect<Category>
              value={p.category}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              onSave={(v) => onPatch({ category: v })}
              label="Category"
            />
          </div>
          <div>
            <FieldLabel>Counted in</FieldLabel>
            <EditableText value={p.unit} onSave={(v) => onPatch({ unit: v ?? p.unit })} label="Unit" required maxLength={30} />
          </div>
          <div>
            <FieldLabel>Brand</FieldLabel>
            <EditableText value={p.brand} onSave={(v) => onPatch({ brand: v })} label="Brand" maxLength={80} />
          </div>
          <div>
            <FieldLabel>Lot #</FieldLabel>
            <EditableText value={p.lot_number} onSave={(v) => onPatch({ lot_number: v })} label="Lot number" maxLength={60} />
          </div>
          <div>
            <FieldLabel>Expires</FieldLabel>
            <EditableDate value={p.expiration_date} onSave={(v) => onPatch({ expiration_date: v })} label="Expiration date" />
          </div>
          <div className="col-span-2">
            <FieldLabel>Barcode</FieldLabel>
            <EditableText value={p.barcode} onSave={(v) => onPatch({ barcode: v })} label="Barcode" maxLength={80} placeholder="Scan or type" />
          </div>
          <div className="col-span-2">
            <FieldLabel>Supplier</FieldLabel>
            <EditableText value={p.supplier} onSave={(v) => onPatch({ supplier: v })} label="Supplier" />
          </div>
          <div className="col-span-2 md:col-span-4">
            <FieldLabel>Notes</FieldLabel>
            <EditableText value={p.notes} onSave={(v) => onPatch({ notes: v })} label="Notes" multiline maxLength={1000} />
          </div>
          <div className="col-span-2 md:col-span-4">
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" /> Delete product
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
