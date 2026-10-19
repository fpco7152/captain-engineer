"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Loader2, Minus, Plus } from "lucide-react"

type SaveState = "idle" | "saving" | "saved" | "error"

function useSaveState() {
  const [state, setState] = useState<SaveState>("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const run = async (fn: () => Promise<void>) => {
    clearTimeout(timer.current)
    setState("saving")
    try {
      await fn()
      setState("saved")
      timer.current = setTimeout(() => setState("idle"), 1400)
    } catch {
      setState("error")
      timer.current = setTimeout(() => setState("idle"), 2500)
      throw new Error("save failed")
    }
  }
  return { state, run }
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") return <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" aria-label="Saving" />
  if (state === "saved") return <Check className="h-3.5 w-3.5 text-emerald-600" aria-label="Saved" />
  return null
}

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50"

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
      {children}
    </label>
  )
}

function parseNumber(raw: string) {
  const cleaned = raw.replace(/[$,\s]/g, "")
  if (cleaned === "") return 0
  const n = Number(cleaned)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN
}

export function EditableNumber({
  value,
  onSave,
  label,
  prefix,
  suffix,
  className = "",
  inputClassName = "",
  id,
}: {
  value: number
  onSave: (v: number) => Promise<void>
  label: string
  prefix?: string
  suffix?: string
  className?: string
  inputClassName?: string
  id?: string
}) {
  const [draft, setDraft] = useState(String(value))
  const [focused, setFocused] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const { state, run } = useSaveState()

  useEffect(() => {
    if (!focused) setDraft(String(value))
  }, [value, focused])

  const commit = async () => {
    const n = parseNumber(draft)
    if (Number.isNaN(n) || n < 0 || n >= 1_000_000) {
      setInvalid(true)
      setDraft(String(value))
      setTimeout(() => setInvalid(false), 1500)
      return
    }
    setDraft(String(n))
    if (n === value) return
    try {
      await run(() => onSave(n))
    } catch {
      setDraft(String(value))
    }
  }

  return (
    <div className={`relative ${className}`}>
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{prefix}</span>
      )}
      <input
        id={id}
        aria-label={label}
        inputMode="decimal"
        enterKeyHint="done"
        autoComplete="off"
        value={draft}
        onFocus={(e) => {
          setFocused(true)
          e.currentTarget.select()
        }}
        onBlur={() => {
          setFocused(false)
          commit()
        }}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur()
          if (e.key === "Escape") {
            setDraft(String(value))
            setTimeout(() => (e.target as HTMLInputElement).blur())
          }
        }}
        style={suffix ? { paddingRight: `${suffix.length * 7 + 30}px` } : undefined}
        className={`${inputBase} h-11 tabular-nums ${prefix ? "pl-7" : ""} pr-8 ${
          invalid ? "border-rose-500 ring-2 ring-rose-500/20" : ""
        } ${inputClassName}`}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-xs text-slate-500">
        {suffix}
        <SaveIndicator state={state} />
      </span>
    </div>
  )
}

export function EditableText({
  value,
  onSave,
  label,
  placeholder,
  required,
  maxLength = 120,
  multiline,
  className = "",
  inputClassName = "",
}: {
  value: string | null
  onSave: (v: string | null) => Promise<void>
  label: string
  placeholder?: string
  required?: boolean
  maxLength?: number
  multiline?: boolean
  className?: string
  inputClassName?: string
}) {
  const [draft, setDraft] = useState(value ?? "")
  const [focused, setFocused] = useState(false)
  const { state, run } = useSaveState()

  useEffect(() => {
    if (!focused) setDraft(value ?? "")
  }, [value, focused])

  const commit = async () => {
    const t = draft.trim()
    if (required && !t) {
      setDraft(value ?? "")
      return
    }
    const next = t === "" ? null : t
    if (next === (value ?? null) || (next ?? "") === (value ?? "")) return
    try {
      await run(() => onSave(next))
    } catch {
      setDraft(value ?? "")
    }
  }

  const common = {
    "aria-label": label,
    value: draft,
    placeholder,
    maxLength,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false)
      commit()
    },
  }

  return (
    <div className={`relative ${className}`}>
      {multiline ? (
        <textarea
          {...common}
          rows={2}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value ?? "")
              setTimeout(() => (e.target as HTMLTextAreaElement).blur())
            }
          }}
          className={`${inputBase} min-h-[44px] py-2 pr-8 ${inputClassName}`}
        />
      ) : (
        <input
          {...common}
          enterKeyHint="done"
          autoComplete="off"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur()
            if (e.key === "Escape") {
              setDraft(value ?? "")
              setTimeout(() => (e.target as HTMLInputElement).blur())
            }
          }}
          className={`${inputBase} h-11 pr-8 ${inputClassName}`}
        />
      )}
      <span className="pointer-events-none absolute right-2.5 top-3.5">
        <SaveIndicator state={state} />
      </span>
    </div>
  )
}

export function EditableDate({
  value,
  onSave,
  label,
}: {
  value: string | null
  onSave: (v: string | null) => Promise<void>
  label: string
}) {
  const { state, run } = useSaveState()
  const [draft, setDraft] = useState(value ?? "")
  useEffect(() => setDraft(value ?? ""), [value])

  return (
    <div className="relative">
      <input
        type="date"
        aria-label={label}
        value={draft}
        onChange={async (e) => {
          const v = e.target.value || null
          setDraft(e.target.value)
          if (v === value) return
          try {
            await run(() => onSave(v))
          } catch {
            setDraft(value ?? "")
          }
        }}
        className={`${inputBase} h-11 pr-8`}
      />
      <span className="pointer-events-none absolute right-9 top-3.5">
        <SaveIndicator state={state} />
      </span>
    </div>
  )
}

export function EditableSelect<T extends string>({
  value,
  options,
  onSave,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onSave: (v: T) => Promise<void>
  label: string
}) {
  const { state, run } = useSaveState()
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={async (e) => {
          const v = e.target.value as T
          if (v !== value) await run(() => onSave(v)).catch(() => {})
        }}
        className={`${inputBase} h-11 appearance-none pr-8`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-3.5">
        <SaveIndicator state={state} />
      </span>
    </div>
  )
}

export function QuantityStepper({
  value,
  unit,
  onStep,
  onSet,
}: {
  value: number
  unit: string
  onStep: (delta: number) => void
  onSet: (v: number) => Promise<void>
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onStep(-1)}
        disabled={value < 1}
        aria-label="Remove one (used)"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm active:scale-95 disabled:opacity-40 hover:bg-slate-50"
      >
        <Minus className="h-5 w-5" />
      </button>
      <EditableNumber
        value={value}
        onSave={onSet}
        label="Quantity on hand"
        suffix={unit}
        className="min-w-0 flex-1"
        inputClassName="text-center text-lg font-semibold"
      />
      <button
        type="button"
        onClick={() => onStep(1)}
        aria-label="Add one (received)"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm active:scale-95 hover:bg-slate-50"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}
