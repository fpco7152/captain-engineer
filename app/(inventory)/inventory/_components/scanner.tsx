"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDownToLine, ArrowDownUp, ArrowUpFromLine, Link2, Loader2, Minus, Pencil, Plus, ScanBarcode, Search, X } from "lucide-react"
import { Camera, ManualEntry } from "./camera"
import { type Lot, type Mode, type Product, fmtDate, fmtNum } from "./types"
import { type Direction as LotDirection, LotMovement, type OutReason } from "./lot-movement"
import { type ScanInfo, parseScan, sameBarcode } from "./barcode"
import { type ProductPrefill, btn } from "./dialogs"
import type { FieldPatch } from "./product-row"

type Direction = "in" | "out"
const DIRECTION_KEY = "medspa-inventory-scan-direction"

function ScanFacts({ info }: { info: ScanInfo }) {
  const bits = [info.lot && `Lot ${info.lot}`, info.expiry && `Exp ${fmtDate(info.expiry)}`].filter(Boolean)
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
      <p className="break-all font-mono text-slate-700">{info.key}</p>
      {bits.length > 0 && <p className="mt-0.5 text-slate-500">This box: {bits.join(" · ")}</p>}
    </div>
  )
}

function RecordMovement({
  product,
  info,
  allowDetailUpdate,
  onRecord,
}: {
  product: Product
  info: ScanInfo
  allowDetailUpdate: boolean
  onRecord: (delta: number, updateLotExpiry: boolean) => Promise<void>
}) {
  const [direction, setDirection] = useState<Direction>("in")
  const [qty, setQty] = useState("1")
  const [busy, setBusy] = useState(false)
  const lotDiffers =
    allowDetailUpdate && ((!!info.lot && info.lot !== product.lot_number) || (!!info.expiry && info.expiry !== product.expiration_date))
  const [updateLot, setUpdateLot] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DIRECTION_KEY)
      if (saved === "in" || saved === "out") setDirection(saved)
    } catch {}
  }, [])
  const choose = (d: Direction) => {
    setDirection(d)
    try {
      localStorage.setItem(DIRECTION_KEY, d)
    } catch {}
  }

  const n = Number(qty.replace(",", "."))
  const valid = Number.isFinite(n) && n > 0 && n < 1_000_000
  const tooMany = direction === "out" && valid && n > product.quantity
  const after = valid ? (direction === "in" ? product.quantity + n : product.quantity - n) : product.quantity
  const step = (d: number) => setQty(String(Math.max(1, (valid ? n : 0) + d)))
  const unit = product.unit

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Direction" className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={direction === "in"}
          onClick={() => choose("in")}
          className={`flex h-14 items-center justify-center gap-2 rounded-xl text-base font-semibold ring-1 ring-inset transition ${
            direction === "in" ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300"
          }`}
        >
          <ArrowDownToLine className="h-5 w-5" /> In · received
        </button>
        <button
          type="button"
          aria-pressed={direction === "out"}
          onClick={() => choose("out")}
          className={`flex h-14 items-center justify-center gap-2 rounded-xl text-base font-semibold ring-1 ring-inset transition ${
            direction === "out" ? "bg-rose-600 text-white ring-rose-600" : "bg-white text-slate-700 ring-slate-300"
          }`}
        >
          <ArrowUpFromLine className="h-5 w-5" /> Out · used
        </button>
      </div>

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
            value={qty}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setQty(e.target.value)}
            className="h-14 min-w-0 flex-1 rounded-xl border border-slate-300 text-center text-2xl font-bold tabular-nums shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          />
          <button type="button" onClick={() => step(1)} aria-label="One more" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white shadow-sm active:scale-95">
            <Plus className="h-6 w-6" />
          </button>
        </div>
        <p className={`mt-2 text-sm ${tooMany ? "text-rose-700" : "text-slate-500"}`}>
          {tooMany
            ? `Only ${fmtNum(product.quantity)} ${unit} on hand.`
            : valid
              ? `On hand will go from ${fmtNum(product.quantity)} to ${fmtNum(after)} ${unit}.`
              : "Enter a number above zero."}
        </p>
      </div>

      {direction === "in" && lotDiffers && (
        <label className="flex items-start gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <input type="checkbox" checked={updateLot} onChange={(e) => setUpdateLot(e.target.checked)} className="mt-0.5 h-5 w-5 accent-teal-700" />
          <span>
            Update the product&apos;s lot and expiration to this box
            {info.lot ? ` (Lot ${info.lot}` : " ("}
            {info.expiry ? `${info.lot ? ", " : ""}exp ${fmtDate(info.expiry)})` : ")"}
          </span>
        </label>
      )}

      <button
        type="button"
        disabled={!valid || tooMany || busy}
        onClick={async () => {
          setBusy(true)
          try {
            await onRecord(direction === "in" ? n : -n, direction === "in" && lotDiffers && updateLot)
          } finally {
            setBusy(false)
          }
        }}
        className={`${direction === "in" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-semibold text-white shadow-sm active:scale-[.99] disabled:opacity-40`}
      >
        {busy && <Loader2 className="h-5 w-5 animate-spin" />}
        {valid ? `${direction === "in" ? "Add" : "Remove"} ${fmtNum(n)} ${unit}` : "Record"}
      </button>
    </div>
  )
}

function LinkToExisting({ products, onPick, onCancel }: { products: Product[]; onPick: (p: Product) => void; onCancel: () => void }) {
  const [q, setQ] = useState("")
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return products
      .filter((p) => !s || [p.name, p.brand].some((v) => v?.toLowerCase().includes(s)))
      .sort((a, b) => Number(!!a.barcode) - Number(!!b.barcode) || a.name.localeCompare(b.name))
  }, [products, q])
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find the product"
          aria-label="Find the product"
          className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        />
      </div>
      <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
        {list.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onPick(p)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50">
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-900">{p.name}</span>
                <span className="block text-xs text-slate-500">{p.barcode ? "Has a barcode · will be replaced" : "No barcode yet"}</span>
              </span>
              <Link2 className="h-4 w-4 shrink-0 text-teal-700" />
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">No products match.</li>}
      </ul>
      <button type="button" className={`${btn.secondary} w-full`} onClick={onCancel}>
        Back
      </button>
    </div>
  )
}

export type StockPreset = { productId: string; direction: LotDirection }

function savedDirection(): LotDirection {
  try {
    return localStorage.getItem(DIRECTION_KEY) === "out" ? "out" : "in"
  } catch {
    return "in"
  }
}

export function ScannerSheet({
  open,
  onClose,
  products,
  lots,
  preset,
  mode,
  onSwitchMode,
  onAdjust,
  onReceive,
  onUseLot,
  onPatch,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  lots: Lot[]
  preset: StockPreset | null
  mode: Mode
  onSwitchMode: (m: Mode) => void
  onAdjust: (id: string, delta: number, note: string) => Promise<boolean>
  onReceive: (productId: string, lot: string, expiry: string, qty: number, note: string) => Promise<boolean>
  onUseLot: (lot: Lot, qty: number, reason: OutReason, note: string) => Promise<boolean>
  onPatch: (id: string, patch: FieldPatch) => Promise<void>
  onCreate: (prefill: ProductPrefill) => void
}) {
  const [info, setInfo] = useState<ScanInfo | null>(null)
  const [linking, setLinking] = useState(false)
  const [linkedId, setLinkedId] = useState<string | null>(null)
  const [lastRecorded, setLastRecorded] = useState("")

  useEffect(() => {
    if (!open) {
      setInfo(null)
      setLinking(false)
      setLinkedId(null)
      setLastRecorded("")
      return
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const presetProduct = preset ? products.find((p) => p.id === preset.productId) ?? null : null
  const product =
    presetProduct ??
    (info ? (linkedId && products.find((p) => p.id === linkedId)) || products.find((p) => sameBarcode(p.barcode, info)) || null : null)
  const productLots = product ? lots.filter((l) => l.product_id === product.id) : []

  const recorded = (msg: string) => {
    if (preset) {
      onClose()
      return
    }
    setLastRecorded(msg)
    scanNext()
  }

  const handleCode = (text: string) => {
    const parsed = parseScan(text)
    if (!parsed) return
    navigator.vibrate?.(40)
    setInfo(parsed)
    setLinking(false)
    setLinkedId(null)
    setLastRecorded("")
  }

  const scanNext = () => {
    setInfo(null)
    setLinking(false)
    setLinkedId(null)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={preset ? "Stock in or out" : "Scan barcode"}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex max-h-[96dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            {preset ? (
              <>
                <ArrowDownUp className="h-5 w-5 text-teal-700" /> Stock in / out
              </>
            ) : (
              <>
                <ScanBarcode className="h-5 w-5 text-teal-700" /> Scan
              </>
            )}
          </h2>
          <button onClick={onClose} aria-label="Close scanner" className="-mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!info && !presetProduct && (
            <>
              {lastRecorded && (
                <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                  {lastRecorded} Scan the next box.
                </p>
              )}
              <Camera onCode={handleCode} paused={!!info} />
              <ManualEntry onCode={handleCode} />
            </>
          )}

          {product && (info || presetProduct) && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    {product.track_lots
                      ? (() => {
                          const c = productLots.filter((l) => l.quantity > 0).length
                          return c === 0 ? "No lots in stock" : `${c} ${c === 1 ? "lot" : "lots"} in stock`
                        })()
                      : [product.brand, product.lot_number && `Lot ${product.lot_number}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-bold leading-none tabular-nums text-slate-900">{fmtNum(product.quantity)}</p>
                  <p className="text-xs text-slate-500">{product.unit} on hand</p>
                </div>
              </div>
              {info && <ScanFacts info={info} />}
              {mode !== "view" && product.track_lots ? (
                <LotMovement
                  key={product.id + (info?.key ?? "") + (preset?.direction ?? "")}
                  product={product}
                  lots={productLots}
                  info={info}
                  initialDirection={preset?.direction ?? savedDirection()}
                  onReceive={async (lot, expiry, qty) => {
                    const ok = await onReceive(product.id, lot, expiry, qty, info ? "Scanned" : "")
                    if (ok) recorded(`Received ${fmtNum(qty)} ${product.unit} of ${product.name} (lot ${lot}).`)
                    return ok
                  }}
                  onUse={async (lot, qty, reason) => {
                    const ok = await onUseLot(lot, qty, reason, info ? "Scanned" : "")
                    if (ok) recorded(`Checked out ${fmtNum(qty)} ${product.unit} of ${product.name} (lot ${lot.lot_number}).`)
                    return ok
                  }}
                />
              ) : mode !== "view" ? (
                <RecordMovement
                  key={product.id + (info?.key ?? "")}
                  product={product}
                  info={info ?? { key: "" }}
                  allowDetailUpdate={mode === "manage" && !!info}
                  onRecord={async (delta, updateLot) => {
                    if (updateLot && info) {
                      await onPatch(product.id, {
                        ...(info.lot ? { lot_number: info.lot } : {}),
                        ...(info.expiry ? { expiration_date: info.expiry } : {}),
                      }).catch(() => {})
                    }
                    const ok = await onAdjust(product.id, delta, info ? "Scanned" : "")
                    if (ok) {
                      recorded(`${delta > 0 ? "Added" : "Removed"} ${fmtNum(Math.abs(delta))} ${product.unit} ${delta > 0 ? "to" : "from"} ${product.name}.`)
                    }
                  }}
                />
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You&apos;re in View mode, so this scan only looks the product up.
                  <button className={`${btn.primary} mt-3 w-full`} onClick={() => onSwitchMode("adjust")}>
                    <ArrowDownUp className="h-4 w-4" /> Switch to Adjust to record in / out
                  </button>
                </div>
              )}
              {!preset && (
                <button type="button" className={`${btn.secondary} w-full`} onClick={scanNext}>
                  <ScanBarcode className="h-4 w-4" /> Scan another
                </button>
              )}
            </>
          )}

          {info && !product && !preset && (
            <>
              <div>
                <p className="text-lg font-bold text-slate-900">New barcode</p>
                <p className="text-sm text-slate-500">No product uses this code yet.</p>
              </div>
              <ScanFacts info={info} />
              {mode !== "manage" ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  New barcodes are set up in Manage mode.
                  <button className={`${btn.primary} mt-3 w-full`} onClick={() => onSwitchMode("manage")}>
                    <Pencil className="h-4 w-4" /> Switch to Manage
                  </button>
                </div>
              ) : linking ? (
                <LinkToExisting
                  products={products}
                  onCancel={() => setLinking(false)}
                  onPick={async (p) => {
                    try {
                      await onPatch(
                        p.id,
                        p.track_lots
                          ? { barcode: info.key }
                          : {
                              barcode: info.key,
                              ...(info.lot ? { lot_number: info.lot } : {}),
                              ...(info.expiry ? { expiration_date: info.expiry } : {}),
                            },
                      )
                      setLinkedId(p.id)
                      setLinking(false)
                    } catch {}
                  }}
                />
              ) : (
                <div className="grid gap-2">
                  <button className={`${btn.primary} h-12 w-full`} onClick={() => setLinking(true)}>
                    <Link2 className="h-4 w-4" /> Use for an existing product
                  </button>
                  <button
                    className={`${btn.secondary} h-12 w-full`}
                    onClick={() => onCreate({ barcode: info.key, lot_number: info.lot, expiration_date: info.expiry })}
                  >
                    <Plus className="h-4 w-4" /> Create a new product
                  </button>
                </div>
              )}
              <button type="button" className="w-full py-2 text-sm font-medium text-slate-500 underline" onClick={scanNext}>
                Scan again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
