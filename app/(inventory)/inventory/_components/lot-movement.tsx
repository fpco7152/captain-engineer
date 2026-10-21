"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Loader2, Minus, Plus } from "lucide-react"
import { type Lot, type Product, daysUntil, fmtDate, fmtNum, sortLots } from "./types"
import type { ScanInfo } from "./barcode"

export type Direction = "in" | "out"
export type OutReason = "used" | "wasted" | "expired"

const OUT_REASONS: { value: OutReason; label: string }[] = [
  { value: "used", label: "Used" },
  { value: "wasted", label: "Wasted" },
  { value: "expired", label: "Expired" },
]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function DirectionToggle({ value, onChange }: { value: Direction; onChange: (d: Direction) => void }) {
  return (
    <div role="group" aria-label="Direction" className="grid grid-cols-2 gap-2">
      <button
        type="button"
        aria-pressed={value === "in"}
        onClick={() => onChange("in")}
        className={`flex h-14 items-center justify-center gap-2 rounded-xl text-base font-semibold ring-1 ring-inset transition ${
          value === "in" ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300"
        }`}
      >
        <ArrowDownToLine className="h-5 w-5" /> In · received
      </button>
      <button
        type="button"
        aria-pressed={value === "out"}
        onClick={() => onChange("out")}
        className={`flex h-14 items-center justify-center gap-2 rounded-xl text-base font-semibold ring-1 ring-inset transition ${
          value === "out" ? "bg-rose-600 text-white ring-rose-600" : "bg-white text-slate-700 ring-slate-300"
        }`}
      >
        <ArrowUpFromLine className="h-5 w-5" /> Out
      </button>
    </div>
  )
}

export function QtyInput({ value, onChange, unit }: { value: string; onChange: (v: string) => void; unit: string }) {
  const n = Number(value.replace(",", "."))
  const step = (d: number) => onChange(String(Math.max(1, (Number.isFinite(n) ? n : 0) + d)))
  return (
    <div>
      <label htmlFor="scan-qty" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        How many {unit}
      </label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => step(-1)} aria-label="One less" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white shadow-sm active:scale-95">
          <Minus className="h-6 w-6" />
        </button>
        <input
          id="scan-qty"
          inputMode="decimal"
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 min-w-0 flex-1 rounded-xl border border-slate-300 text-center text-2xl font-bold tabular-nums shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        />
        <button type="button" onClick={() => step(1)} aria-label="One more" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white shadow-sm active:scale-95">
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

const field =
  "h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"

export function LotMovement({
  product,
  lots,
  info,
  initialDirection,
  onReceive,
  onUse,
}: {
  product: Product
  lots: Lot[]
  info?: ScanInfo | null
  initialDirection: Direction
  onReceive: (lot: string, expiry: string, qty: number) => Promise<boolean>
  onUse: (lot: Lot, qty: number, reason: OutReason) => Promise<boolean>
}) {
  const [direction, setDirection] = useState<Direction>(initialDirection)
  const [qty, setQty] = useState("1")
  const [busy, setBusy] = useState(false)
  const [lotInput, setLotInput] = useState(info?.lot ?? "")
  const [expInput, setExpInput] = useState(info?.expiry ?? "")
  const [reason, setReason] = useState<OutReason>("used")
  const sorted = useMemo(() => sortLots(lots), [lots])
  const inStock = sorted.filter((l) => l.quantity > 0)
  const scannedLot = info?.lot ? inStock.find((l) => l.lot_number === info.lot!.trim().toUpperCase()) : undefined
  const [pickedId, setPickedId] = useState<string | null>(scannedLot?.id ?? null)
  const picked = inStock.find((l) => l.id === pickedId) ?? null

  const n = Number(qty.replace(",", "."))
  const validQty = Number.isFinite(n) && n > 0 && n < 1_000_000
  const unit = product.unit
  const unitFor = (count: number) => (count === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit)
  const today = todayISO()

  // Receiving checks
  const lotNorm = lotInput.trim().toUpperCase()
  const known = lots.find((l) => l.lot_number === lotNorm)
  const inError = !lotNorm
    ? "Enter the lot number from the box."
    : !expInput
      ? "Enter the expiration date from the box."
      : expInput < today
        ? "That date has passed. Don't receive expired product."
        : known && known.expiration_date !== expInput
          ? `Lot ${lotNorm} is on file with expiration ${fmtDate(known.expiration_date)}. Check the box.`
          : ""

  // Check-out checks
  const soonestUsable = inStock.find((l) => l.expiration_date >= today)
  const pickedExpired = !!picked && picked.expiration_date < today
  const outError = !inStock.length
    ? "Nothing in stock for this product."
    : !picked
      ? "Tap the lot printed on the vial to confirm it."
      : reason === "used" && pickedExpired
        ? `Lot ${picked.lot_number} expired on ${fmtDate(picked.expiration_date)}. Choose "Expired" to discard it.`
        : validQty && n > picked.quantity
          ? `Only ${fmtNum(picked.quantity)} ${unit} left in lot ${picked.lot_number}.`
          : ""

  const canSubmit = validQty && !busy && (direction === "in" ? !inError : !outError)

  const submit = async () => {
    setBusy(true)
    try {
      if (direction === "in") await onReceive(lotNorm, expInput, n)
      else if (picked) await onUse(picked, n, reason)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <DirectionToggle
        value={direction}
        onChange={(d) => {
          setDirection(d)
          try {
            localStorage.setItem("medspa-inventory-scan-direction", d)
          } catch {}
        }}
      />

      {direction === "in" ? (
        <div className="space-y-3 rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-700">
            {info?.lot || info?.expiry ? "Filled in from the barcode. Check it matches the box." : "Enter the lot and expiration printed on the box."}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="in-lot" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Lot number
              </label>
              <input
                id="in-lot"
                value={lotInput}
                onChange={(e) => setLotInput(e.target.value)}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={60}
                className={`${field} font-mono uppercase`}
              />
            </div>
            <div>
              <label htmlFor="in-exp" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Expires
              </label>
              <input id="in-exp" type="date" min={today} value={expInput} onChange={(e) => setExpInput(e.target.value)} className={field} />
            </div>
          </div>
          {lots.some((l) => l.expiration_date >= today) && (
            <div>
              <p className="mb-1.5 text-xs text-slate-500">Same as a lot already on file:</p>
              <div className="flex flex-wrap gap-1.5">
                {sorted
                  .filter((l) => l.expiration_date >= today)
                  .map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setLotInput(l.lot_number)
                        setExpInput(l.expiration_date)
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${
                        lotNorm === l.lot_number ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-slate-700 ring-slate-300"
                      }`}
                    >
                      {l.lot_number} · {fmtDate(l.expiration_date)}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div role="group" aria-label="Reason" className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {OUT_REASONS.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={reason === r.value}
                onClick={() => setReason(r.value)}
                className={`h-10 rounded-lg text-sm font-semibold ${reason === r.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Confirm the lot on the vial</p>
            {info?.lot && !scannedLot && (
              <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
                Lot {info.lot.toUpperCase()} from this barcode isn&apos;t in stock for {product.name}. Receive it first or check the vial.
              </p>
            )}
            {inStock.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">No lots in stock. Receive this product first.</p>
            ) : (
              <div role="radiogroup" aria-label="Lot" className="space-y-2">
                {inStock.map((l) => {
                  const expired = l.expiration_date < today
                  const days = daysUntil(l.expiration_date)
                  const selected = pickedId === l.id
                  return (
                    <button
                      key={l.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPickedId(l.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left ring-1 ring-inset transition ${
                        selected ? "bg-teal-50 ring-2 ring-teal-600" : "bg-white ring-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block font-mono text-base font-semibold text-slate-900">Lot {l.lot_number}</span>
                        <span className={`block text-sm ${expired ? "font-semibold text-rose-700" : days <= 60 ? "text-orange-700" : "text-slate-500"}`}>
                          {expired ? "Expired " : "Exp "}
                          {fmtDate(l.expiration_date)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-sm text-slate-600">
                        {fmtNum(l.quantity)} left
                        {selected && <CheckCircle2 className="h-5 w-5 text-teal-700" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
            {scannedLot && pickedId === scannedLot.id && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-teal-800">
                <CheckCircle2 className="h-4 w-4" /> Lot matches the barcode
              </p>
            )}
            {picked && soonestUsable && picked.id !== soonestUsable.id && !pickedExpired && reason === "used" && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Lot {soonestUsable.lot_number} expires sooner ({fmtDate(soonestUsable.expiration_date)}). Use it first if you can.
              </p>
            )}
          </div>
        </div>
      )}

      <QtyInput value={qty} onChange={setQty} unit={unit} />

      {(direction === "in" ? inError : outError) && (lotInput || expInput || direction === "out") && (
        <p role="alert" className={`text-sm ${direction === "out" && !picked && inStock.length ? "text-slate-600" : "text-rose-700"}`}>
          {direction === "in" ? inError : outError}
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className={`${direction === "in" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-lg font-semibold text-white shadow-sm active:scale-[.99] disabled:opacity-40`}
      >
        {busy && <Loader2 className="h-5 w-5 animate-spin" />}
        {direction === "in"
          ? `Receive ${validQty ? fmtNum(n) : ""} ${unitFor(n)}${lotNorm ? ` · Lot ${lotNorm}` : ""}`
          : `${reason === "used" ? "Check out" : reason === "wasted" ? "Record wasted" : "Discard expired"} ${validQty ? fmtNum(n) : ""} ${unitFor(n)}${
              picked ? ` · Lot ${picked.lot_number}` : ""
            }`}
      </button>
    </div>
  )
}
