export type ScanInfo = {
  // What we store on the product and match against: the GTIN for GS1 codes, otherwise the code itself.
  key: string
  gtin?: string
  lot?: string
  expiry?: string
  serial?: string
}

const GS = "\x1d"

const FIXED_AI_LENGTHS: Record<string, number> = {
  "00": 18,
  "01": 14,
  "02": 14,
  "11": 6,
  "12": 6,
  "13": 6,
  "15": 6,
  "16": 6,
  "17": 6,
  "20": 2,
}
const VARIABLE_AIS = ["10", "21", "22", "240", "241", "30", "37", "90"]

function gs1Date(yymmdd: string) {
  const yy = Number(yymmdd.slice(0, 2))
  const mm = Number(yymmdd.slice(2, 4))
  let dd = Number(yymmdd.slice(4, 6))
  if (!mm || mm > 12) return undefined
  const year = 2000 + yy
  if (dd === 0) dd = new Date(year, mm, 0).getDate()
  return `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`
}

function parseElementString(s: string): Omit<ScanInfo, "key"> | null {
  const out: Omit<ScanInfo, "key"> = {}
  let i = 0
  while (i < s.length) {
    if (s[i] === GS) {
      i++
      continue
    }
    const two = s.slice(i, i + 2)
    const three = s.slice(i, i + 3)
    if (two in FIXED_AI_LENGTHS) {
      const len = FIXED_AI_LENGTHS[two]
      const value = s.slice(i + 2, i + 2 + len)
      if (value.length !== len || !/^\d+$/.test(value)) return null
      if (two === "01") out.gtin = value
      if (two === "17") out.expiry = gs1Date(value)
      i += 2 + len
      continue
    }
    const ai = VARIABLE_AIS.find((a) => (a.length === 3 ? three === a : two === a))
    if (!ai) break
    const start = i + ai.length
    const end = s.indexOf(GS, start)
    const value = s.slice(start, end === -1 ? undefined : end).slice(0, 30)
    if (ai === "10") out.lot = value
    if (ai === "21") out.serial = value
    i = end === -1 ? s.length : end + 1
  }
  return out.gtin ? out : null
}

function fromParentheses(s: string) {
  // "(01)00312345678906(17)270531(10)ABC12" -> element string with separators
  const parts = [...s.matchAll(/\((\d{2,4})\)([^(]*)/g)]
  if (parts.length === 0) return null
  return parts.map(([, ai, v]) => ai + v.trim()).join(GS)
}

export function parseScan(input: string): ScanInfo | null {
  let raw = input.replace(/[\r\n]+/g, "").trim()
  if (!raw) return null
  raw = raw.replace(/^\][A-Za-z]\d/, "")
  if (raw.startsWith(GS)) raw = raw.slice(1)

  if (/^\(\d{2,4}\)/.test(raw)) {
    const converted = fromParentheses(raw)
    if (converted) raw = converted
  }

  if (/^\d{8}$|^\d{12,14}$/.test(raw)) return { key: raw.padStart(14, "0"), gtin: raw.padStart(14, "0") }

  if (/^01\d{14}/.test(raw)) {
    const gs1 = parseElementString(raw)
    if (gs1?.gtin) return { key: gs1.gtin, ...gs1 }
  }

  const key = raw.replace(/\s+/g, " ").slice(0, 80)
  return { key }
}

export function sameBarcode(stored: string | null, info: ScanInfo) {
  if (!stored) return false
  if (stored === info.key) return true
  const normalized = parseScan(stored)
  return normalized?.key === info.key
}
