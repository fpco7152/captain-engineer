"use client"

import { useState } from "react"
import { ArrowDownToLine, ArrowUpFromLine, ChevronDown, History, Trash2 } from "lucide-react"
import { CATEGORIES, type Category, type Lot, type Product, daysUntil, fmtDate, fmtMoney, fmtNum, productStatuses, sortLots } from "./types"
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

function Meta({ product, lots }: { product: Product; lots?: Lot[] }) {
  const inStock = (lots ?? []).filter((l) => l.quantity > 0).length
  const bits = product.track_lots
    ? [
        product.brand,
        inStock ? `${inStock} ${inStock === 1 ? "lot" : "lots"}` : "No lots in stock",
        product.lot_number && product.expiration_date && `next: ${product.lot_number} · exp ${fmtDate(product.expiration_date)}`,
      ].filter(Boolean)
    : [
        product.brand,
        product.lot_number && `Lot ${product.lot_number}`,
        product.expiration_date && `Exp ${fmtDate(product.expiration_date)}`,
      ].filter(Boolean)
  if (bits.length === 0) return null
  return <p className="truncate text-sm text-slate-500">{bits.join(" · ")}</p>
}

export function ViewRow({ product, lots, onOpen }: { product: Product; lots: Lot[]; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-semibold text-slate-900">{product.name}</p>
        <Meta product={product} lots={lots} />
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

function StockButtons({ onStock }: { onStock: (d: "in" | "out") => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onStock("in")}
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[.98]"
      >
        <ArrowDownToLine className="h-4 w-4" /> In
      </button>
      <button
        type="button"
        onClick={() => onStock("out")}
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[.98]"
      >
        <ArrowUpFromLine className="h-4 w-4" /> Out
      </button>
    </div>
  )
}

function LotTable({
  product,
  lots,
  canEditCount,
  canEditDetails,
  onCount,
  onPatch,
  onRemove,
}: {
  product: Product
  lots: Lot[]
  canEditCount: boolean
  canEditDetails: boolean
  onCount: (lot: Lot, qty: number) => Promise<void>
  onPatch?: (lot: Lot, change: Partial<Pick<Lot, "lot_number" | "expiration_date">>) => Promise<void>
  onRemove?: (lot: Lot) => void
}) {
  const shown = sortLots(lots).filter((l) => l.quantity > 0 || canEditDetails)
  if (shown.length === 0) return <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-500">No lots in stock. Tap In to receive.</p>
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
      {shown.map((l) => {
        const days = daysUntil(l.expiration_date)
        const tone = days < 0 ? "text-rose-700 font-semibold" : days <= 60 ? "text-orange-700" : "text-slate-500"
        return (
          <li key={l.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2.5 sm:grid-cols-[1fr_1fr_8rem_auto]">
            {canEditDetails && onPatch ? (
              <>
                <EditableText
                  value={l.lot_number}
                  onSave={(v) => onPatch(l, { lot_number: v ?? l.lot_number })}
                  label={`Lot number ${l.lot_number}`}
                  required
                  maxLength={60}
                  inputClassName="font-mono uppercase"
                />
                <div className="col-start-1 sm:col-start-auto">
                  <EditableDate value={l.expiration_date} onSave={(v) => (v ? onPatch(l, { expiration_date: v }) : Promise.resolve())} label={`Expiration for lot ${l.lot_number}`} />
                </div>
              </>
            ) : (
              <div className="min-w-0 sm:col-span-2">
                <p className="font-mono text-sm font-semibold text-slate-900">Lot {l.lot_number}</p>
                <p className={`text-xs ${tone}`}>
                  {days < 0 ? "Expired " : "Exp "}
                  {fmtDate(l.expiration_date)}
                </p>
              </div>
            )}
            <div className="col-start-2 row-span-2 row-start-1 w-28 sm:row-span-1 sm:col-start-auto sm:row-start-auto sm:w-auto">
              {canEditCount ? (
                <EditableNumber value={l.quantity} onSave={(v) => onCount(l, v)} label={`Count for lot ${l.lot_number}`} suffix={product.unit} />
              ) : (
                <p className="text-right text-sm font-semibold tabular-nums text-slate-900">
                  {fmtNum(l.quantity)} {product.unit}
                </p>
              )}
            </div>
            {canEditDetails && onRemove ? (
              <button
                type="button"
                disabled={l.quantity > 0}
                onClick={() => onRemove(l)}
                title={l.quantity > 0 ? "Only empty lots can be removed" : "Remove empty lot"}
                aria-label={`Remove lot ${l.lot_number}`}
                className="hidden h-11 w-11 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 disabled:text-slate-300 disabled:hover:bg-transparent sm:flex"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}
          </li>
        )
      })}
    </ul>
  )
}

function HistoryButton({ name, onHistory }: { name: string; onHistory: () => void }) {
  return (
    <button
      type="button"
      onClick={onHistory}
      title="Stock history"
      aria-label={`Stock history for ${name}`}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
    >
      <History className="h-5 w-5" />
    </button>
  )
}

export function AdjustRow({
  product,
  lots,
  onStep,
  onSet,
  onStock,
  onLotCount,
  onHistory,
}: {
  product: Product
  lots: Lot[]
  onStep: (delta: number) => void
  onSet: (v: number) => Promise<void>
  onStock: (d: "in" | "out") => void
  onLotCount: (lot: Lot, qty: number) => Promise<void>
  onHistory: () => void
}) {
  if (product.track_lots) {
    return (
      <div className="space-y-3 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate font-semibold text-slate-900">{product.name}</p>
            <StatusPills product={product} />
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-2xl font-bold leading-none tabular-nums ${qtyTone(product)}`}>{fmtNum(product.quantity)}</p>
            <p className="text-xs text-slate-500">{product.unit} total</p>
          </div>
          <HistoryButton name={product.name} onHistory={onHistory} />
        </div>
        <LotTable product={product} lots={lots} canEditCount canEditDetails={false} onCount={onLotCount} />
        <StockButtons onStock={onStock} />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-semibold text-slate-900">{product.name}</p>
        <Meta product={product} />
        <StatusPills product={product} />
      </div>
      <div className="flex items-center gap-2 sm:w-[22rem]">
        <div className="min-w-0 flex-1">
          <QuantityStepper value={product.quantity} unit={product.unit} onStep={onStep} onSet={onSet} />
        </div>
        <HistoryButton name={product.name} onHistory={onHistory} />
      </div>
    </div>
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
    | "track_lots"
  >
>

export function EditRow({
  product,
  lots,
  onPatch,
  onStep,
  onStock,
  onLotCount,
  onLotPatch,
  onLotRemove,
  onDelete,
  onHistory,
}: {
  product: Product
  lots: Lot[]
  onPatch: (patch: FieldPatch) => Promise<void>
  onStep: (delta: number) => void
  onStock: (d: "in" | "out") => void
  onLotCount: (lot: Lot, qty: number) => Promise<void>
  onLotPatch: (lot: Lot, change: Partial<Pick<Lot, "lot_number" | "expiration_date">>) => Promise<void>
  onLotRemove: (lot: Lot) => void
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
          {p.track_lots ? (
            <div className="flex items-center gap-3">
              <p className={`min-w-[3rem] text-2xl font-bold tabular-nums ${qtyTone(p)}`}>
                {fmtNum(p.quantity)} <span className="text-sm font-normal text-slate-500">{p.unit}</span>
              </p>
              <div className="flex-1">
                <StockButtons onStock={onStock} />
              </div>
            </div>
          ) : (
            <QuantityStepper value={p.quantity} unit={p.unit} onStep={onStep} onSet={(v) => onPatch({ quantity: v })} />
          )}
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

      {p.track_lots && (
        <div className="mt-3">
          <FieldLabel>Lots</FieldLabel>
          <LotTable product={p} lots={lots} canEditCount canEditDetails onCount={onLotCount} onPatch={onLotPatch} onRemove={onLotRemove} />
        </div>
      )}

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
          {!p.track_lots && (
            <>
              <div>
                <FieldLabel>Lot #</FieldLabel>
                <EditableText value={p.lot_number} onSave={(v) => onPatch({ lot_number: v })} label="Lot number" maxLength={60} />
              </div>
              <div>
                <FieldLabel>Expires</FieldLabel>
                <EditableDate value={p.expiration_date} onSave={(v) => onPatch({ expiration_date: v })} label="Expiration date" />
              </div>
            </>
          )}
          <div className="col-span-2 md:col-span-4">
            <label className={`flex items-start gap-3 rounded-lg bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-200 ${p.quantity !== 0 ? "opacity-70" : ""}`}>
              <input
                type="checkbox"
                checked={p.track_lots}
                disabled={p.quantity !== 0}
                onChange={(e) => onPatch({ track_lots: e.target.checked }).catch(() => {})}
                className="mt-0.5 h-5 w-5 accent-teal-700"
              />
              <span>
                <span className="font-medium text-slate-900">Track by lot &amp; expiration</span>
                <span className="block text-slate-500">
                  {p.quantity !== 0
                    ? "Set the count to 0 first to turn this on or off."
                    : "Receiving asks for the lot and expiration; checking out asks you to confirm the lot."}
                </span>
              </span>
            </label>
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
