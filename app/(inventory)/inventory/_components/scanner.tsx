"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDownToLine, ArrowUpFromLine, CameraOff, Link2, Loader2, Minus, Pencil, Plus, ScanBarcode, Search, X } from "lucide-react"
import { type Mode, type Product, fmtDate, fmtNum } from "./types"
import { type ScanInfo, parseScan, sameBarcode } from "./barcode"
import { type ProductPrefill, btn } from "./dialogs"
import type { FieldPatch } from "./product-row"

type Direction = "in" | "out"
const DIRECTION_KEY = "medspa-inventory-scan-direction"

function Camera({ onCode, paused }: { onCode: (text: string) => void; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCodeRef = useRef(onCode)
  onCodeRef.current = onCode
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const [state, setState] = useState<"starting" | "live" | "error">("starting")
  const [error, setError] = useState("")

  useEffect(() => {
    let stopped = false
    let controls: { stop: () => void } | undefined
    ;(async () => {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("NoCameraApi")
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ])
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_39,
        BarcodeFormat.ITF,
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)
      const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120, delayBetweenScanSuccess: 1200 })
      if (stopped || !videoRef.current) return
      controls = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        videoRef.current,
        (result) => {
          if (result && !stopped && !pausedRef.current) onCodeRef.current(result.getText())
        },
      )
      if (stopped) controls.stop()
      else setState("live")
    })().catch((e: unknown) => {
      if (stopped) return
      const name = (e as { name?: string; message?: string })?.name ?? ""
      const msg = (e as { message?: string })?.message ?? ""
      setState("error")
      if (name === "NotAllowedError" || name === "SecurityError")
        setError("Camera access was blocked. Allow the camera for this site in your browser settings, or type the code below.")
      else if (name === "NotFoundError" || name === "OverconstrainedError" || msg === "NoCameraApi")
        setError("No camera found on this device. Type the code or use a handheld scanner below.")
      else if (name === "NotReadableError") setError("The camera is being used by another app. Close it and try again.")
      else setError("Couldn't start the camera. Type the code or use a handheld scanner below.")
    })
    return () => {
      stopped = true
      controls?.stop()
    }
  }, [])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900 sm:aspect-video">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
      {state === "live" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[55%] w-[75%] max-w-sm rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]">
            <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-teal-400" />
          </div>
          <p className="absolute bottom-3 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-white">
            Point at the barcode on the box
          </p>
        </div>
      )}
      {state === "starting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-sm">Starting camera…</span>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white">
          <CameraOff className="h-8 w-8 text-slate-300" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

function ManualEntry({ onCode }: { onCode: (text: string) => void }) {
  const [value, setValue] = useState("")
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    // Handheld scanners type the code and press Enter; keep the box ready on computers.
    if (window.matchMedia?.("(pointer: fine)").matches) ref.current?.focus()
  }, [])
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onCode(value)
        setValue("")
      }}
      className="flex gap-2"
    >
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a code or use a handheld scanner"
        aria-label="Barcode"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="go"
        className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 font-mono shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
      />
      <button type="submit" className={btn.secondary}>
        Look up
      </button>
    </form>
  )
}

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
  onRecord,
}: {
  product: Product
  info: ScanInfo
  onRecord: (delta: number, updateLotExpiry: boolean) => Promise<void>
}) {
  const [direction, setDirection] = useState<Direction>("in")
  const [qty, setQty] = useState("1")
  const [busy, setBusy] = useState(false)
  const lotDiffers = (!!info.lot && info.lot !== product.lot_number) || (!!info.expiry && info.expiry !== product.expiration_date)
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

export function ScannerSheet({
  open,
  onClose,
  products,
  mode,
  onEnterEdit,
  onAdjust,
  onPatch,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  mode: Mode
  onEnterEdit: () => void
  onAdjust: (id: string, delta: number, note: string) => Promise<boolean>
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

  const product = info
    ? (linkedId && products.find((p) => p.id === linkedId)) || products.find((p) => sameBarcode(p.barcode, info)) || null
    : null

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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Scan barcode">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex max-h-[96dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ScanBarcode className="h-5 w-5 text-teal-700" /> Scan
          </h2>
          <button onClick={onClose} aria-label="Close scanner" className="-mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!info && (
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

          {info && product && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    {[product.brand, product.lot_number && `Lot ${product.lot_number}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-bold leading-none tabular-nums text-slate-900">{fmtNum(product.quantity)}</p>
                  <p className="text-xs text-slate-500">{product.unit} on hand</p>
                </div>
              </div>
              <ScanFacts info={info} />
              {mode === "edit" ? (
                <RecordMovement
                  key={product.id + info.key}
                  product={product}
                  info={info}
                  onRecord={async (delta, updateLot) => {
                    if (updateLot) {
                      await onPatch(product.id, {
                        ...(info.lot ? { lot_number: info.lot } : {}),
                        ...(info.expiry ? { expiration_date: info.expiry } : {}),
                      }).catch(() => {})
                    }
                    const ok = await onAdjust(product.id, delta, "Scanned")
                    if (ok) {
                      setLastRecorded(
                        `${delta > 0 ? "Added" : "Removed"} ${fmtNum(Math.abs(delta))} ${product.unit} ${delta > 0 ? "to" : "from"} ${product.name}.`,
                      )
                      scanNext()
                    }
                  }}
                />
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You&apos;re in View mode, so this scan only looks the product up.
                  <button className={`${btn.primary} mt-3 w-full`} onClick={onEnterEdit}>
                    <Pencil className="h-4 w-4" /> Switch to Edit to record in / out
                  </button>
                </div>
              )}
              <button type="button" className={`${btn.secondary} w-full`} onClick={scanNext}>
                <ScanBarcode className="h-4 w-4" /> Scan another
              </button>
            </>
          )}

          {info && !product && (
            <>
              <div>
                <p className="text-lg font-bold text-slate-900">New barcode</p>
                <p className="text-sm text-slate-500">No product uses this code yet.</p>
              </div>
              <ScanFacts info={info} />
              {mode !== "edit" ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Switch to Edit mode to set this barcode up.
                  <button className={`${btn.primary} mt-3 w-full`} onClick={onEnterEdit}>
                    <Pencil className="h-4 w-4" /> Switch to Edit
                  </button>
                </div>
              ) : linking ? (
                <LinkToExisting
                  products={products}
                  onCancel={() => setLinking(false)}
                  onPick={async (p) => {
                    try {
                      await onPatch(p.id, {
                        barcode: info.key,
                        ...(info.lot ? { lot_number: info.lot } : {}),
                        ...(info.expiry ? { expiration_date: info.expiry } : {}),
                      })
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
