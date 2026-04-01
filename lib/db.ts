import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role key for server-side access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Bill type matching our database schema
export interface DBBill {
  id: string
  bill_id: string
  title: string
  summary: string | null
  status: string | null
  level: "federal" | "state" | "local"
  state: string | null
  chamber: string | null
  introduced_date: string | null
  last_action: string | null
  last_action_date: string | null
  sponsor: string | null
  topics: string[]
  url: string | null
  source: string
  raw_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// Query bills with filters
export async function getBills(filters?: {
  level?: string
  state?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<DBBill[]> {
  const { level, state, status, search, limit = 50, offset = 0 } = filters || {}

  let query = supabase
    .from("bills")
    .select("*")
    .order("last_action_date", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (level) {
    query = query.eq("level", level)
  }

  if (state) {
    query = query.eq("state", state)
  }

  if (status) {
    query = query.ilike("status", `%${status}%`)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching bills:", error)
    throw error
  }

  return (data || []) as DBBill[]
}

// Get a single bill by ID
export async function getBillById(id: string): Promise<DBBill | null> {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null
    }
    console.error("[v0] Error fetching bill by ID:", error)
    throw error
  }

  return data as DBBill
}

// Get bill by external bill_id
export async function getBillByBillId(billId: string): Promise<DBBill | null> {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("bill_id", billId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("[v0] Error fetching bill by bill_id:", error)
    throw error
  }

  return data as DBBill
}

// Upsert bills (insert or update on conflict)
export async function upsertBills(bills: Omit<DBBill, "id" | "created_at" | "updated_at">[]): Promise<number> {
  let upsertedCount = 0

  for (const bill of bills) {
    try {
      const { error } = await supabase
        .from("bills")
        .upsert(
          {
            bill_id: bill.bill_id,
            title: bill.title,
            summary: bill.summary,
            status: bill.status,
            level: bill.level,
            state: bill.state,
            chamber: bill.chamber,
            introduced_date: bill.introduced_date,
            last_action: bill.last_action,
            last_action_date: bill.last_action_date,
            sponsor: bill.sponsor,
            topics: bill.topics,
            url: bill.url,
            source: bill.source,
            raw_data: bill.raw_data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "bill_id" }
        )

      if (error) {
        console.error(`[v0] Error upserting bill ${bill.bill_id}:`, error)
      } else {
        upsertedCount++
      }
    } catch (error) {
      console.error(`[v0] Error upserting bill ${bill.bill_id}:`, error)
    }
  }

  return upsertedCount
}

// Get bill count by level
export async function getBillCounts(): Promise<{ federal: number; state: number; local: number; total: number }> {
  const { count: total, error: totalError } = await supabase
    .from("bills")
    .select("*", { count: "exact", head: true })

  const { count: federal, error: federalError } = await supabase
    .from("bills")
    .select("*", { count: "exact", head: true })
    .eq("level", "federal")

  const { count: state, error: stateError } = await supabase
    .from("bills")
    .select("*", { count: "exact", head: true })
    .eq("level", "state")

  const { count: local, error: localError } = await supabase
    .from("bills")
    .select("*", { count: "exact", head: true })
    .eq("level", "local")

  if (totalError || federalError || stateError || localError) {
    console.error("[v0] Error getting bill counts")
  }

  return {
    federal: federal || 0,
    state: state || 0,
    local: local || 0,
    total: total || 0,
  }
}
