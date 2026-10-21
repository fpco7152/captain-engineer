"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  CalendarClock,
  Download,
  Eye,
  KeyRound,
  LogOut,
  Pencil,
  ArrowDownUp,
  Plus,
  ScanBarcode,
  History,
  Search,
  Syringe,
  Wallet,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import {
  CATEGORIES,
  type Category,
  type Lot,
  type Mode,
  type Product,
  type Staff,
  categoryLabel,
  fmtMoney,
  fmtNum,
  friendlyError,
  normalizeLot,
  normalizeProduct,
  productStatuses,
} from "./types"
import { AdjustRow, EditRow, type FieldPatch, ViewRow } from "./product-row"
import { AddProductDialog, ChangePasswordForm, ConfirmDialog, LotStartDialog, Modal, type ProductPrefill, btn } from "./dialogs"
import { ActivityDialog, HistoryDialog } from "./activity"
import { ScannerSheet, type StockPreset } from "./scanner"
import type { OutReason } from "./lot-movement"

type Filter = "all" | "attention" | "reorder" | "expiring" | Category

const MODE_KEY = "medspa-inventory-mode"

function singular(unit: string, n: number) {
  return Math.abs(n) === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit
}

function mostCommonUnit(items: Product[]) {
  const counts = new Map<string, number>()
  items.forEach((p) => counts.set(p.unit, (counts.get(p.unit) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "items"
}

const MODES = [
  { m: "view", label: "View", Icon: Eye, active: "bg-white text-slate-900 shadow-sm" },
  { m: "adjust", label: "Adjust", Icon: ArrowDownUp, active: "bg-teal-700 text-white shadow-sm" },
  { m: "manage", label: "Manage", Icon: Pencil, active: "bg-amber-500 text-white shadow-sm" },
] as const

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div role="group" aria-label="Screen mode" className="inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200">
      {MODES.map(({ m, label, Icon, active }) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          onClick={() => onChange(m)}
          className={`inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition sm:gap-1.5 sm:px-3 sm:text-sm ${
            mode === m ? active : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

const MODE_BANNER: Record<Exclude<Mode, "view">, { box: string; text: string; hover: string; title: string; body: string }> = {
  adjust: {
    box: "border-teal-200 bg-teal-50",
    text: "text-teal-900",
    hover: "hover:bg-teal-100",
    title: "Adjust mode.",
    body: "Change counts with − / + or Scan. Details are locked.",
  },
  manage: {
    box: "border-amber-200 bg-amber-50",
    text: "text-amber-900",
    hover: "hover:bg-amber-100",
    title: "Manage mode.",
    body: "Edit anything, add or delete products. Saves automatically.",
  },
}

function AccountMenu({
  me,
  username,
  onPassword,
  onExport,
}: {
  me: Staff
  username: string
  onPassword: () => void
  onExport: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("touchstart", close)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("touchstart", close)
    }
  }, [open])

  const item = "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
  const pick = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white shadow-sm hover:bg-teal-800"
      >
        {me.display_name.trim().charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="font-semibold text-slate-900">{me.display_name}</p>
            <p className="truncate text-sm text-slate-500">{username}</p>
          </div>
          <button className={item} onClick={pick(onPassword)}>
            <KeyRound className="h-4 w-4" /> Change password
          </button>
          <button className={item} onClick={pick(onExport)}>
            <Download className="h-4 w-4" /> Download current stock (CSV)
          </button>
          <button className={`${item} border-t border-slate-100 text-rose-700`} onClick={pick(() => supabase.auth.signOut())}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  Icon,
  tone,
  active,
  onClick,
}: {
  label: string
  value: string
  sub?: string
  Icon: typeof Syringe
  tone: "teal" | "violet" | "amber" | "orange" | "slate"
  active?: boolean
  onClick?: () => void
}) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    orange: "bg-orange-50 text-orange-700",
    slate: "bg-slate-100 text-slate-700",
  }
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      {...(onClick ? { type: "button" as const, onClick, "aria-pressed": active } : {})}
      className={`flex min-w-0 flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
        active ? "border-teal-600 ring-2 ring-teal-600/20" : "border-slate-200"
      } ${onClick ? "hover:border-slate-300 active:scale-[.99]" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-slate-500">{label}</span>
        <span className={`rounded-lg p-1.5 ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <span className="mt-2 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">{value}</span>
      {sub && <span className="mt-0.5 truncate text-xs text-slate-500">{sub}</span>}
    </Comp>
  )
}

export function InventoryApp({ me, username }: { me: Staff; username: string }) {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loadError, setLoadError] = useState("")
  const [mode, setModeState] = useState<Mode>("view")
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")
  const [live, setLive] = useState(false)
  const [adding, setAdding] = useState(false)
  const [prefill, setPrefill] = useState<ProductPrefill | undefined>()
  const [scanning, setScanning] = useState(false)
  const [stockPreset, setStockPreset] = useState<StockPreset | null>(null)
  const [lots, setLots] = useState<Lot[]>([])
  const [activityOpen, setActivityOpen] = useState(false)
  const [lotStartFor, setLotStartFor] = useState<Product | null>(null)
  const [lotStopFor, setLotStopFor] = useState<Product | null>(null)
  const [activityKey, setActivityKey] = useState(0)
  useEffect(() => setActivityKey((k) => k + 1), [products, lots])
  const [historyFor, setHistoryFor] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [pwOpen, setPwOpen] = useState(false)
  const queues = useRef(new Map<string, Promise<unknown>>())

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY)
      if (saved === "view" || saved === "adjust" || saved === "manage") setModeState(saved)
      else if (saved === "edit") setModeState("manage")
    } catch {}
  }, [])

  const setMode = (m: Mode) => {
    setModeState(m)
    try {
      localStorage.setItem(MODE_KEY, m)
    } catch {}
  }

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*").order("name")
    if (error) {
      setLoadError(friendlyError(error))
      return
    }
    setLoadError("")
    setProducts((data as Product[]).map(normalizeProduct))
    const { data: lotRows } = await supabase.from("product_lots").select("*")
    if (lotRows) setLots((lotRows as Lot[]).map(normalizeLot))
  }, [])

  const refreshProduct = useCallback(async (id: string) => {
    const [{ data: row }, { data: lotRows }] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("product_lots").select("*").eq("product_id", id),
    ])
    if (row) setProducts((prev) => prev && prev.map((p) => (p.id === id ? normalizeProduct(row as Product) : p)))
    if (lotRows) setLots((prev) => [...prev.filter((l) => l.product_id !== id), ...(lotRows as Lot[]).map(normalizeLot)])
  }, [])


  useEffect(() => {
    loadProducts()

    const channel = supabase
      .channel("inventory-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        setProducts((prev) => {
          if (!prev) return prev
          if (payload.eventType === "DELETE") return prev.filter((p) => p.id !== (payload.old as Product).id)
          const row = normalizeProduct(payload.new as Product)
          const exists = prev.some((p) => p.id === row.id)
          return exists ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row]
        })
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "product_lots" }, (payload) => {
        setLots((prev) => {
          if (payload.eventType === "DELETE") return prev.filter((l) => l.id !== (payload.old as Lot).id)
          const row = normalizeLot(payload.new as Lot)
          return prev.some((l) => l.id === row.id) ? prev.map((l) => (l.id === row.id ? row : l)) : [...prev, row]
        })
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"))

    const refresh = () => document.visibilityState === "visible" && loadProducts()
    document.addEventListener("visibilitychange", refresh)
    window.addEventListener("online", refresh)
    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener("visibilitychange", refresh)
      window.removeEventListener("online", refresh)
    }
  }, [loadProducts])


  const replace = (row: Product) => setProducts((prev) => prev && prev.map((p) => (p.id === row.id ? row : p)))

  const patch = async (id: string, change: FieldPatch) => {
    const before = products?.find((p) => p.id === id)
    if (!before) return
    replace({ ...before, ...change })
    const { data, error } = await supabase.from("products").update(change).eq("id", id).select().single()
    if (error) {
      replace(before)
      toast.error(friendlyError(error))
      throw error
    }
    replace(normalizeProduct(data as Product))
  }

  const adjust = (id: string, delta: number, reason: string, opts: { quiet?: boolean; note?: string } = {}): Promise<boolean> => {
    setProducts((prev) => prev && prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p)))
    const prevTask = queues.current.get(id) ?? Promise.resolve(true)
    const task = prevTask.then(async () => {
      const { data, error } = await supabase.rpc("adjust_stock", {
        p_product_id: id,
        p_change: delta,
        p_reason: reason,
        p_note: opts.note ?? null,
      })
      if (error) {
        toast.error(friendlyError(error))
        await loadProducts()
        return false
      }
      replace(normalizeProduct(data as Product))
      return true
    })
    queues.current.set(id, task)

    const p = products?.find((x) => x.id === id)
    if (opts.quiet || !p) return task
    const verb = delta < 0 ? "Used" : "Received"
    toast(`${verb} ${fmtNum(Math.abs(delta))} ${singular(p.unit, delta)}`, {
      description: p.name,
      action: { label: "Undo", onClick: () => adjust(id, -delta, "count correction", { quiet: true }) },
    })
    return task
  }

  const receiveLot = async (productId: string, lot: string, expiry: string, qty: number, note: string) => {
    const { error } = await supabase.rpc("receive_stock", {
      p_product_id: productId,
      p_lot: lot,
      p_expiry: expiry,
      p_qty: qty,
      p_note: note || null,
    })
    if (error) {
      toast.error(friendlyError(error))
      return false
    }
    await refreshProduct(productId)
    const p = products?.find((x) => x.id === productId)
    toast.success(`Received ${fmtNum(qty)} ${p ? singular(p.unit, qty) : ""} · Lot ${lot}`, { description: p?.name })
    return true
  }

  const takeFromLot = async (lot: Lot, qty: number, reason: OutReason, note: string) => {
    const { error } = await supabase.rpc("use_stock", { p_lot_id: lot.id, p_qty: qty, p_reason: reason, p_note: note || null })
    if (error) {
      toast.error(friendlyError(error))
      return false
    }
    await refreshProduct(lot.product_id)
    const p = products?.find((x) => x.id === lot.product_id)
    const verb = reason === "used" ? "Checked out" : reason === "wasted" ? "Wasted" : "Discarded"
    toast.success(`${verb} ${fmtNum(qty)} ${p ? singular(p.unit, qty) : ""} · Lot ${lot.lot_number}`, { description: p?.name })
    return true
  }

  const setLotCount = async (lot: Lot, qty: number) => {
    const { error } = await supabase.rpc("set_lot_count", { p_lot_id: lot.id, p_qty: qty })
    if (error) {
      toast.error(friendlyError(error))
      throw error
    }
    await refreshProduct(lot.product_id)
  }

  const patchLot = async (lot: Lot, change: Partial<Pick<Lot, "lot_number" | "expiration_date">>) => {
    const { error } = await supabase.from("product_lots").update(change).eq("id", lot.id)
    if (error) {
      toast.error(/duplicate|unique/i.test(error.message) ? "That lot number is already on file for this product." : friendlyError(error))
      throw error
    }
    await refreshProduct(lot.product_id)
  }

  const removeLot = async (lot: Lot) => {
    const { error } = await supabase.from("product_lots").delete().eq("id", lot.id)
    if (error) {
      toast.error(friendlyError(error))
      return
    }
    await refreshProduct(lot.product_id)
  }

  const setLotTracking = async (p: Product, on: boolean, lot?: string, expiry?: string) => {
    const { error } = on
      ? await supabase.rpc("enable_lot_tracking", { p_product_id: p.id, p_lot: lot ?? null, p_expiry: expiry ?? null })
      : await supabase.rpc("disable_lot_tracking", { p_product_id: p.id })
    if (error) {
      toast.error(friendlyError(error))
      return false
    }
    await refreshProduct(p.id)
    toast.success(`Lot confirmation ${on ? "on" : "off"} for ${p.name}`)
    return true
  }

  const toggleLotTracking = (p: Product, on: boolean) => {
    if (!on) return setLotStopFor(p)
    if (p.quantity > 0) return setLotStartFor(p)
    setLotTracking(p, true)
  }

  const openStock = (productId: string, direction: "in" | "out") => {
    setStockPreset({ productId, direction })
    setScanning(true)
  }

  const lotsByProduct = useMemo(() => {
    const map = new Map<string, Lot[]>()
    for (const l of lots) map.set(l.product_id, [...(map.get(l.product_id) ?? []), l])
    return map
  }, [lots])

  const remove = async (p: Product) => {
    const { error } = await supabase.from("products").delete().eq("id", p.id)
    if (error) {
      toast.error(friendlyError(error))
      return
    }
    setProducts((prev) => prev && prev.filter((x) => x.id !== p.id))
    toast.success(`Deleted ${p.name}`)
  }

  const exportCsv = () => {
    if (!products) return
    const cols = ["Name", "Category", "Brand", "On hand", "Unit", "Reorder at", "Cost each", "Value", "Lot", "Expires", "Supplier", "Notes"]
    const esc = (v: unknown) => {
      let s = v == null ? "" : String(v)
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const line = (p: Product, qty: number, lot: string | null, exp: string | null) =>
      [p.name, categoryLabel(p.category), p.brand, qty, p.unit, p.par_level, p.unit_cost.toFixed(2), (qty * p.unit_cost).toFixed(2), lot, exp, p.supplier, p.notes]
        .map(esc)
        .join(",")
    const rows = products.flatMap((p) => {
      const productLots = (lotsByProduct.get(p.id) ?? []).filter((l) => l.quantity > 0)
      if (p.track_lots && productLots.length > 0) return productLots.map((l) => line(p, l.quantity, l.lot_number, l.expiration_date))
      return [line(p, p.quantity, p.track_lots ? null : p.lot_number, p.track_lots ? null : p.expiration_date)]
    })
    const blob = new Blob([[cols.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
  }

  const stats = useMemo(() => {
    const list = products ?? []
    const tox = list.filter((p) => p.category === "neurotoxin")
    const fill = list.filter((p) => p.category === "filler")
    return {
      tox: tox.reduce((s, p) => s + p.quantity, 0),
      toxUnit: mostCommonUnit(tox),
      fill: fill.reduce((s, p) => s + p.quantity, 0),
      fillUnit: mostCommonUnit(fill),
      reorder: list.filter((p) => productStatuses(p).some((s) => s.key === "out" || s.key === "low")).length,
      expiring: list.filter((p) => productStatuses(p).some((s) => s.key === "expired" || s.key === "expiring")).length,
      value: list.reduce((s, p) => s + p.quantity * p.unit_cost, 0),
    }
  }, [products])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (products ?? []).filter((p) => {
      const st = productStatuses(p).map((s) => s.key)
      if (filter === "attention" && st.length === 0) return false
      if (filter === "reorder" && !st.some((k) => k === "out" || k === "low")) return false
      if (filter === "expiring" && !st.some((k) => k === "expired" || k === "expiring")) return false
      if (CATEGORIES.some((c) => c.value === filter) && p.category !== filter) return false
      if (!q) return true
      return [p.name, p.brand, p.lot_number, p.supplier, p.barcode].some((v) => v?.toLowerCase().includes(q))
    })
  }, [products, filter, search])

  const groups = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        items: visible.filter((p) => p.category === c.value).sort((a, b) => a.name.localeCompare(b.name)),
      })).filter((g) => g.items.length > 0),
    [visible],
  )

  const presentCategories = CATEGORIES.filter((c) => (products ?? []).some((p) => p.category === c.value))
  const attentionCount = (products ?? []).filter((p) => productStatuses(p).length > 0).length
  const toggleFilter = (f: Filter) => setFilter((cur) => (cur === f ? "all" : f))

  const chip = (active: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ring-1 ring-inset transition ${
      active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
    }`

  return (
    <div className="min-h-dvh bg-slate-50 pb-28 text-slate-900 sm:pb-16">
      <header className={`sticky top-0 z-30 border-b bg-white/95 backdrop-blur ${
          mode === "manage" ? "border-amber-300" : mode === "adjust" ? "border-teal-300" : "border-slate-200"
        }`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
              <Syringe className="h-5 w-5" />
              <span
                className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white sm:hidden ${live ? "bg-emerald-500" : "bg-slate-300"}`}
                aria-label={live ? "Live" : "Connecting"}
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <h1 className="truncate text-base font-bold leading-tight sm:text-lg">Inventory</h1>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500" : "bg-slate-300"}`} />
                {live ? "Live" : "Connecting…"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ModeToggle mode={mode} onChange={setMode} />
            <AccountMenu me={me} username={username} onPassword={() => setPwOpen(true)} onExport={exportCsv} />
          </div>
        </div>
        {mode !== "view" && (
          <div className={`border-t ${MODE_BANNER[mode].box}`}>
            <div className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm ${MODE_BANNER[mode].text}`}>
              <span>
                <strong>{MODE_BANNER[mode].title}</strong> {MODE_BANNER[mode].body}
              </span>
              <button onClick={() => setMode("view")} className={`shrink-0 rounded-md px-2 py-1 font-semibold ${MODE_BANNER[mode].hover}`}>
                Done
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 pt-5">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Summary">
          <StatCard
            label="Neurotoxins"
            value={fmtNum(stats.tox)}
            sub={`${stats.toxUnit} on hand`}
            Icon={Syringe}
            tone="teal"
            active={filter === "neurotoxin"}
            onClick={() => toggleFilter("neurotoxin")}
          />
          <StatCard
            label="Fillers"
            value={fmtNum(stats.fill)}
            sub={`${stats.fillUnit} on hand`}
            Icon={Syringe}
            tone="violet"
            active={filter === "filler"}
            onClick={() => toggleFilter("filler")}
          />
          <StatCard
            label="Need reorder"
            value={String(stats.reorder)}
            sub={stats.reorder === 1 ? "product low or out" : "products low or out"}
            Icon={AlertTriangle}
            tone="amber"
            active={filter === "reorder"}
            onClick={() => toggleFilter("reorder")}
          />
          <StatCard
            label="Expiring soon"
            value={String(stats.expiring)}
            sub="within 60 days or expired"
            Icon={CalendarClock}
            tone="orange"
            active={filter === "expiring"}
            onClick={() => toggleFilter("expiring")}
          />
          <div className="col-span-2 lg:col-span-1">
            <StatCard label="Stock value" value={fmtMoney(stats.value)} sub="at your cost" Icon={Wallet} tone="slate" />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, brand, lot, supplier"
                aria-label="Search products"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 shadow-sm outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button className={`${btn.secondary} flex-1 sm:flex-none`} onClick={() => setActivityOpen(true)}>
                <History className="h-4 w-4" /> Today&apos;s activity
              </button>
              <button
                className={`${btn.primary} hidden sm:inline-flex`}
                onClick={() => {
                  setStockPreset(null)
                  setScanning(true)
                }}
              >
                <ScanBarcode className="h-4 w-4" /> Scan
              </button>
              {mode === "manage" && (
                <button
                  className={`${btn.secondary} flex-1 sm:flex-none`}
                  onClick={() => {
                    setPrefill(undefined)
                    setAdding(true)
                  }}
                >
                  <Plus className="h-4 w-4" /> Add product
                </button>
              )}
            </div>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            <button className={chip(filter === "all")} onClick={() => setFilter("all")}>
              All
            </button>
            {presentCategories.map((c) => (
              <button key={c.value} className={chip(filter === c.value)} onClick={() => setFilter(c.value)}>
                {c.plural}
              </button>
            ))}
            <button className={chip(filter === "attention")} onClick={() => setFilter("attention")}>
              <AlertTriangle className="h-3.5 w-3.5" /> Needs attention
              {attentionCount > 0 && (
                <span className={`rounded-full px-1.5 text-xs ${filter === "attention" ? "bg-white/20" : "bg-amber-100 text-amber-900"}`}>
                  {attentionCount}
                </span>
              )}
            </button>
          </div>
        </section>

        {loadError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {loadError}
            <button className="font-semibold underline" onClick={loadProducts}>
              Try again
            </button>
          </div>
        )}

        {!products && !loadError && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading inventory">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        )}

        {products && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="font-semibold text-slate-900">No products yet</p>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "manage" ? "Add your first product to start tracking." : "Switch to Manage (top right) to add products."}
            </p>
            {mode === "manage" && (
              <button
                className={`${btn.primary} mt-4`}
                onClick={() => {
                  setPrefill(undefined)
                  setAdding(true)
                }}
              >
                <Plus className="h-4 w-4" /> Add product
              </button>
            )}
          </div>
        )}

        {products && products.length > 0 && groups.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
            Nothing matches.{" "}
            <button
              className="font-semibold text-teal-700 underline"
              onClick={() => {
                setSearch("")
                setFilter("all")
              }}
            >
              Show everything
            </button>
          </div>
        )}

        {groups.map((g) => (
          <section key={g.value} aria-labelledby={`h-${g.value}`}>
            <h2 id={`h-${g.value}`} className="mb-2 flex items-baseline justify-between px-1">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-500">{g.plural}</span>
              <span className="text-xs text-slate-400">
                {g.items.length} {g.items.length === 1 ? "product" : "products"}
              </span>
            </h2>
            <div
              className={`divide-y overflow-hidden rounded-2xl border bg-white shadow-sm ${
                mode === "manage"
                  ? "divide-slate-200 border-amber-200"
                  : mode === "adjust"
                    ? "divide-slate-100 border-teal-200"
                    : "divide-slate-100 border-slate-200"
              }`}
            >
              {g.items.map((p) =>
                mode === "adjust" ? (
                  <AdjustRow
                    key={p.id}
                    product={p}
                    lots={lotsByProduct.get(p.id) ?? []}
                    onStep={(d) => adjust(p.id, d, d < 0 ? "used" : "received")}
                    onSet={(v) => patch(p.id, { quantity: v })}
                    onStock={(d) => openStock(p.id, d)}
                    onLotCount={setLotCount}
                    onHistory={() => setHistoryFor(p)}
                  />
                ) : mode === "manage" ? (
                  <EditRow
                    key={p.id}
                    product={p}
                    lots={lotsByProduct.get(p.id) ?? []}
                    onStock={(d) => openStock(p.id, d)}
                    onLotCount={setLotCount}
                    onLotPatch={patchLot}
                    onLotRemove={removeLot}
                    onLotTracking={(on) => toggleLotTracking(p, on)}
                    onPatch={(c) => patch(p.id, c)}
                    onStep={(d) => adjust(p.id, d, d < 0 ? "used" : "received")}
                    onDelete={() => setDeleting(p)}
                    onHistory={() => setHistoryFor(p)}
                  />
                ) : (
                  <ViewRow key={p.id} product={p} lots={lotsByProduct.get(p.id) ?? []} onOpen={() => setHistoryFor(p)} />
                ),
              )}
            </div>
          </section>
        ))}
      </main>

      <ScannerSheet
        open={scanning}
        onClose={() => {
          setScanning(false)
          setStockPreset(null)
        }}
        products={products ?? []}
        lots={lots}
        preset={stockPreset}
        onReceive={receiveLot}
        onUseLot={takeFromLot}
        mode={mode}
        onSwitchMode={setMode}
        onAdjust={(id, delta, note) => adjust(id, delta, delta < 0 ? "used" : "received", { note })}
        onPatch={patch}
        onCreate={(pf) => {
          setPrefill(pf)
          setAdding(true)
        }}
      />
      <button
        type="button"
        onClick={() => {
          setStockPreset(null)
          setScanning(true)
        }}
        aria-label="Scan a barcode"
        className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-white shadow-xl shadow-teal-900/30 active:scale-95 sm:hidden ${
          scanning ? "hidden" : ""
        }`}
      >
        <ScanBarcode className="h-7 w-7" />
      </button>
      <AddProductDialog
        open={adding}
        prefill={prefill}
        products={products ?? []}
        onClose={() => setAdding(false)}
        defaultCategory={CATEGORIES.find((c) => c.value === filter)?.value ?? "neurotoxin"}
        onAdded={(p) => {
          setProducts((prev) => (prev && !prev.some((x) => x.id === p.id) ? [...prev, p] : prev))
          refreshProduct(p.id)
        }}
      />
      <HistoryDialog
        product={historyFor}
        lots={historyFor ? (lotsByProduct.get(historyFor.id) ?? []) : []}
        refreshKey={activityKey}
        onClose={() => setHistoryFor(null)}
      />
      <LotStartDialog
        product={lotStartFor}
        onClose={() => setLotStartFor(null)}
        onConfirm={(lot, expiry) => setLotTracking(lotStartFor!, true, lot, expiry)}
      />
      <ConfirmDialog
        open={!!lotStopFor}
        title="Turn off lot confirmation?"
        message={`${lotStopFor?.name} will go back to simple − / + counting. The ${lotStopFor ? fmtNum(lotStopFor.quantity) : ""} ${lotStopFor?.unit ?? ""} on hand stay as they are, and past lot records stay in the history.`}
        confirmLabel="Turn off"
        onClose={() => setLotStopFor(null)}
        onConfirm={async () => {
          await setLotTracking(lotStopFor!, false)
        }}
      />
      <ActivityDialog open={activityOpen} onClose={() => setActivityOpen(false)} products={products ?? []} refreshKey={activityKey} />
      <ConfirmDialog
        open={!!deleting}
        title="Delete product?"
        message={`"${deleting?.name}" and its stock history will be permanently removed. To keep the history, set the quantity to 0 instead.`}
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting!)}
      />
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change password">
        <ChangePasswordForm onDone={() => setPwOpen(false)} />
      </Modal>
    </div>
  )
}
