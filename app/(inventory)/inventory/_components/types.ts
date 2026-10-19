export type Category = "neurotoxin" | "filler" | "skincare" | "supplies" | "other"

export const CATEGORIES: { value: Category; label: string; plural: string }[] = [
  { value: "neurotoxin", label: "Neurotoxin", plural: "Neurotoxins" },
  { value: "filler", label: "Filler", plural: "Fillers" },
  { value: "skincare", label: "Skincare", plural: "Skincare" },
  { value: "supplies", label: "Supplies", plural: "Supplies" },
  { value: "other", label: "Other", plural: "Other" },
]

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.value === c)?.plural ?? c

export type Product = {
  id: string
  name: string
  category: Category
  brand: string | null
  unit: string
  quantity: number
  par_level: number
  unit_cost: number
  supplier: string | null
  lot_number: string | null
  expiration_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export type Staff = {
  user_id: string
  display_name: string
  role: "owner" | "staff"
  must_change_password: boolean
  active: boolean
  created_at: string
}

export type Movement = {
  id: number
  product_id: string
  change: number
  quantity_after: number
  reason: string
  note: string | null
  created_by: string | null
  created_at: string
}

export type Mode = "view" | "edit"

// Logins are usernames; Supabase Auth stores them as internal, non-deliverable addresses.
const LOGIN_DOMAIN = "@inventory.local"

export function usernameToEmail(input: string) {
  const v = input.trim().toLowerCase()
  return v.includes("@") ? v : v + LOGIN_DOMAIN
}

export function emailToUsername(email: string) {
  return email.endsWith(LOGIN_DOMAIN) ? email.slice(0, -LOGIN_DOMAIN.length) : email
}

export const EXPIRING_DAYS = 60

export function normalizeProduct(p: Product): Product {
  return { ...p, quantity: Number(p.quantity), par_level: Number(p.par_level), unit_cost: Number(p.unit_cost) }
}

export function fmtNum(n: number) {
  return Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function fmtMoney(n: number) {
  const whole = Number.isInteger(n) || n >= 1000
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 })
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function daysUntil(date: string) {
  const [y, m, d] = date.split("-").map(Number)
  const [ty, tm, td] = todayISO().split("-").map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000)
}

export type Status = { key: "expired" | "out" | "low" | "expiring"; label: string }

export function productStatuses(p: Product): Status[] {
  const out: Status[] = []
  if (p.expiration_date) {
    const days = daysUntil(p.expiration_date)
    if (days < 0) out.push({ key: "expired", label: "Expired" })
    else if (days <= EXPIRING_DAYS) out.push({ key: "expiring", label: days === 0 ? "Expires today" : `Expires in ${days}d` })
  }
  if (p.quantity <= 0) out.push({ key: "out", label: "Out of stock" })
  else if (p.par_level > 0 && p.quantity <= p.par_level) out.push({ key: "low", label: "Reorder" })
  return out
}

export function fmtDate(date: string) {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function friendlyError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e)
  if (/Invalid login credentials/i.test(msg)) return "Username or password is incorrect."
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return "Can't reach the server. Check your internet connection."
  if (/JWT|expired|session/i.test(msg)) return "Your session expired. Please sign in again."
  if (/violates check constraint/i.test(msg)) return "That value isn't allowed. Numbers must be zero or more."
  if (/row-level security|permission denied/i.test(msg)) return "Your login doesn't have permission to do that."
  return msg.length > 140 ? "Something went wrong. Please try again." : msg
}
