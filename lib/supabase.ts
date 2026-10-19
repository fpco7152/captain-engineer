import { createClient } from "@supabase/supabase-js"

// The publishable key is safe to ship to browsers; row-level security in the database
// decides what each signed-in user can read or change.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://epbpfkkktwwvblnzxenm.supabase.co"
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_retVr2FwuIk45iGf4s67JQ_mA1mbRyX"

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "medspa-inventory-auth" },
})
