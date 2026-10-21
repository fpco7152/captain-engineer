"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { type Lot, type Product, daysUntil, fmtDate, fmtMoney, fmtNum, friendlyError, sortLots } from "./types"
import { Modal } from "./dialogs"

export type ActivityEntry = {
  kind: "stock" | "edit"
  id: number
  created_at: string
  product_id: string | null
  product_name: string | null
  lot_number: string | null
  action: string
  change: number | null
  quantity_after: number | null
  old_value: string | null
  new_value: string | null
  note: string | null
  actor_initials: string | null
}

const REASON_LABEL: Record<string, string> = {
  edit: "Count updated",
  "starting count": "Starting count",
  used: "Used",
  received: "Received",
  wasted: "Wasted",
  expired: "Discarded (expired)",
  returned: "Returned",
  "count correction": "Count correction",
}

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

type Range = "today" | "7d" | "30d" | "12m" | "all"
const RANGES: { value: Range; label: string; sub: string }[] = [
  { value: "today", label: "Today", sub: "Since midnight" },
  { value: "7d", label: "Week", sub: "Last 7 days" },
  { value: "30d", label: "Month", sub: "Last 30 days" },
  { value: "12m", label: "Year", sub: "Last 12 months" },
  { value: "all", label: "All time", sub: "Everything on file" },
]

function rangeStart(r: Range): Date | null {
  const d = startOfToday()
  if (r === "today") return d
  if (r === "7d") d.setDate(d.getDate() - 6)
  if (r === "30d") d.setDate(d.getDate() - 29)
  if (r === "12m") d.setFullYear(d.getFullYear() - 1)
  return r === "all" ? null : d
}

function normalize(e: ActivityEntry): ActivityEntry {
  return {
    ...e,
    change: e.change == null ? null : Number(e.change),
    quantity_after: e.quantity_after == null ? null : Number(e.quantity_after),
  }
}

async function fetchActivity(opts: { since: Date | null; productId?: string; limit?: number }) {
  const pageSize = 1000
  const out: ActivityEntry[] = []
  for (let from = 0; ; from += pageSize) {
    let q = supabase.from("activity").select("*").order("created_at", { ascending: false }).order("id", { ascending: false })
    if (opts.since) q = q.gte("created_at", opts.since.toISOString())
    if (opts.productId) q = q.eq("product_id", opts.productId)
    const { data, error } = await q.range(from, from + pageSize - 1)
    if (error) throw error
    out.push(...(data as ActivityEntry[]).map(normalize))
    if (data.length < pageSize || (opts.limit && out.length >= opts.limit)) break
  }
  return out
}

function showValue(field: string, v: string | null) {
  if (v == null || v === "") return "blank"
  if (field === "Cost each") return fmtMoney(Number(v))
  if (field === "Reorder at") return fmtNum(Number(v))
  if (field === "Track by lot") return v === "true" ? "on" : "off"
  if (field === "Expires" || field === "Lot expiration") return /^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtDate(v) : v
  return v
}

export function describe(e: ActivityEntry, unit?: string) {
  if (e.kind === "stock") {
    const label = REASON_LABEL[e.action] ?? e.action
    return `${label}${e.quantity_after != null ? ` · ${fmtNum(e.quantity_after)}${unit ? ` ${unit}` : ""} on hand` : ""}`
  }
  if (e.action === "Added product" || e.action === "Removed empty lot") return e.action
  if (e.action === "Deleted product") return `Deleted product${e.old_value ? ` (had ${e.old_value})` : ""}`
  return `${e.action}: ${showValue(e.action, e.old_value)} → ${showValue(e.action, e.new_value)}`
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

function Initials({ value }: { value: string | null }) {
  return (
    <span
      title="Changed by"
      className="inline-flex h-6 max-w-full shrink-0 items-center truncate rounded-full bg-slate-900 px-2 text-[11px] font-semibold text-white"
    >
      {value ?? "?"}
    </span>
  )
}

export function ActivityList({
  entries,
  showProduct,
  unitFor,
}: {
  entries: ActivityEntry[]
  showProduct: boolean
  unitFor: (productId: string | null) => string | undefined
}) {
  return (
    <ol className="divide-y divide-slate-100">
      {entries.map((e) => {
        const stockTone =
          e.kind === "stock" ? ((e.change ?? 0) > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700") : "bg-slate-100 text-slate-600"
        return (
          <li key={`${e.kind}-${e.id}`} className="flex items-start gap-3 py-3">
            <div className="flex w-[5.5rem] shrink-0 flex-col items-start gap-1">
              <span className="text-xs font-medium tabular-nums text-slate-500">{timeOf(e.created_at)}</span>
              <Initials value={e.actor_initials} />
            </div>
            <div className="min-w-0 flex-1">
              {showProduct && <p className="break-words font-semibold text-slate-900">{e.product_name ?? "Deleted product"}</p>}
              <p className={`text-sm ${showProduct ? "text-slate-700" : "font-medium text-slate-900"}`}>{describe(e, unitFor(e.product_id))}</p>
              {(e.lot_number || e.note) && (
                <p className="text-xs text-slate-500">
                  {e.lot_number && <span className="font-mono">Lot {e.lot_number}</span>}
                  {e.lot_number && e.note && " · "}
                  {e.note && `“${e.note}”`}
                </p>
              )}
            </div>
            {e.kind === "stock" && (
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums ${stockTone}`}>
                {(e.change ?? 0) > 0 ? "+" : ""}
                {fmtNum(e.change ?? 0)}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function csvEscape(v: unknown) {
  let s = v == null ? "" : String(v)
  // Neutralize spreadsheet formulas in text, but leave real numbers like -1 alone.
  if (typeof v !== "number" && /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function downloadCsv(entries: ActivityEntry[], filename: string, unitFor: (id: string | null) => string | undefined) {
  const cols = ["Date", "Time", "Changed by", "Product", "Lot", "Type", "Action", "Change", "On hand after", "Unit", "From", "To", "Note"]
  const rows = [...entries]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((e) => {
      const d = new Date(e.created_at)
      return [
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        e.actor_initials,
        e.product_name,
        e.lot_number,
        e.kind === "stock" ? "Stock" : "Edit",
        e.kind === "stock" ? (REASON_LABEL[e.action] ?? e.action) : e.action,
        e.change,
        e.quantity_after,
        e.kind === "stock" ? unitFor(e.product_id) : "",
        e.old_value,
        e.new_value,
        e.note,
      ]
        .map(csvEscape)
        .join(",")
    })
  const blob = new Blob(["﻿" + [cols.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
}

export function ExportPanel({
  productId,
  productName,
  unitFor,
}: {
  productId?: string
  productName?: string
  unitFor: (id: string | null) => string | undefined
}) {
  const [busy, setBusy] = useState<Range | null>(null)
  const run = async (r: Range) => {
    setBusy(r)
    try {
      const entries = await fetchActivity({ since: rangeStart(r), productId })
      if (entries.length === 0) {
        toast("Nothing recorded in that period.")
        return
      }
      const day = new Date()
      const stamp = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
      const who = productName
        ? productName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") + "-"
        : ""
      downloadCsv(entries, `activity-${who}${r}-${stamp}.csv`, unitFor)
      toast.success(`Exported ${entries.length} ${entries.length === 1 ? "entry" : "entries"}`)
    } catch (e) {
      toast.error(friendlyError(e))
    } finally {
      setBusy(null)
    }
  }
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Download className="h-3.5 w-3.5" /> Export history (spreadsheet)
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            disabled={!!busy}
            onClick={() => run(r.value)}
            className="flex min-h-14 flex-col items-center justify-center rounded-xl bg-white px-2 py-2 text-center ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
              {busy === r.value && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {r.label}
            </span>
            <span className="text-[11px] text-slate-500">{r.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function useTodayActivity(open: boolean, productId: string | undefined, refreshKey: number) {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null)
  const [error, setError] = useState("")
  const load = useCallback(async () => {
    setError("")
    try {
      setEntries(await fetchActivity({ since: startOfToday(), productId, limit: 2000 }))
    } catch (e) {
      setError(friendlyError(e))
    }
  }, [productId])
  useEffect(() => {
    if (open) load()
    else setEntries(null)
  }, [open, load, refreshKey])
  return { entries, error, load }
}

function TodayBody({
  entries,
  error,
  showProduct,
  unitFor,
}: {
  entries: ActivityEntry[] | null
  error: string
  showProduct: boolean
  unitFor: (id: string | null) => string | undefined
}) {
  if (error) return <p className="py-6 text-center text-sm text-rose-700">{error}</p>
  if (!entries)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  if (entries.length === 0) return <p className="py-8 text-center text-slate-500">No changes yet today.</p>
  return <ActivityList entries={entries} showProduct={showProduct} unitFor={unitFor} />
}

export function ActivityDialog({
  open,
  onClose,
  products,
  refreshKey,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  refreshKey: number
}) {
  const unitFor = (id: string | null) => products.find((p) => p.id === id)?.unit
  const { entries, error, load } = useTodayActivity(open, undefined, refreshKey)
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
  return (
    <Modal open={open} onClose={onClose} title="Today's activity" wide>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {today}
          {entries && entries.length > 0 && ` · ${entries.length} ${entries.length === 1 ? "change" : "changes"}`}
        </p>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
      <TodayBody entries={entries} error={error} showProduct unitFor={unitFor} />
      <div className="mt-5 border-t border-slate-200 pt-4">
        <ExportPanel unitFor={unitFor} />
      </div>
    </Modal>
  )
}

export function HistoryDialog({
  product,
  lots,
  refreshKey,
  onClose,
}: {
  product: Product | null
  lots: Lot[]
  refreshKey: number
  onClose: () => void
}) {
  const unitFor = () => product?.unit
  const { entries, error } = useTodayActivity(!!product, product?.id, refreshKey)
  const inStock = sortLots(lots).filter((l) => l.quantity > 0)
  return (
    <Modal open={!!product} onClose={onClose} title={product ? `History · ${product.name}` : "History"}>
      {product?.track_lots && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Lots in stock</p>
          {inStock.length === 0 ? (
            <p className="text-sm text-slate-500">None.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {inStock.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>
                    <span className="font-mono font-semibold text-slate-900">Lot {l.lot_number}</span>
                    <span className={daysUntil(l.expiration_date) < 0 ? "font-semibold text-rose-700" : "text-slate-500"}>
                      {daysUntil(l.expiration_date) < 0 ? " · expired " : " · exp "}
                      {fmtDate(l.expiration_date)}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {fmtNum(l.quantity)} {l.quantity === 1 && product.unit.endsWith("s") ? product.unit.slice(0, -1) : product.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Today</p>
      <TodayBody entries={entries} error={error} showProduct={false} unitFor={unitFor} />
      {product && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <ExportPanel productId={product.id} productName={product.name} unitFor={unitFor} />
        </div>
      )}
    </Modal>
  )
}

