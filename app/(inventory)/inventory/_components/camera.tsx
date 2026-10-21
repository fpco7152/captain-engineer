"use client"

import { useEffect, useRef, useState } from "react"
import { CameraOff, Loader2, ScanBarcode, X } from "lucide-react"
import { type ScanInfo, parseScan } from "./barcode"

export function Camera({ onCode, paused }: { onCode: (text: string) => void; paused: boolean }) {
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

export function ManualEntry({ onCode }: { onCode: (text: string) => void }) {
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
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        Look up
      </button>
    </form>
  )
}


// Small scanner used to fill a barcode field: returns the parsed code and closes.
export function ScanCodeDialog({
  open,
  title = "Scan barcode",
  onClose,
  onResult,
}: {
  open: boolean
  title?: string
  onClose: () => void
  onResult: (info: ScanInfo) => void
}) {
  const done = useRef(false)
  useEffect(() => {
    if (!open) return
    done.current = false
    // Capture phase so Escape closes only this scanner, not a form underneath it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [open, onClose])

  if (!open) return null
  const handle = (text: string) => {
    const info = parseScan(text)
    if (!info || done.current) return
    done.current = true
    navigator.vibrate?.(40)
    onResult(info)
    onClose()
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex max-h-[96dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ScanBarcode className="h-5 w-5 text-teal-700" /> {title}
          </h2>
          <button onClick={onClose} aria-label="Close barcode scanner" className="-mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Camera onCode={handle} paused={false} />
          <ManualEntry onCode={handle} />
        </div>
      </div>
    </div>
  )
}

export function ScanButton({ onClick, label = "Scan" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 active:scale-[.98]"
    >
      <ScanBarcode className="h-4 w-4" /> {label}
    </button>
  )
}
