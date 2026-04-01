import { neon } from "@neondatabase/serverless"

// Create a reusable SQL client
export const sql = neon(process.env.DATABASE_URL!)

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

  // Use different queries based on filters to work with tagged template literal
  // When no filters, get all bills
  if (!level && !state && !status && !search) {
    const result = await sql`
      SELECT * FROM bills 
      ORDER BY COALESCE(last_action_date, introduced_date, created_at) DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result as DBBill[]
  }

  // With level filter only
  if (level && !state && !status && !search) {
    const result = await sql`
      SELECT * FROM bills 
      WHERE level = ${level}
      ORDER BY COALESCE(last_action_date, introduced_date, created_at) DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result as DBBill[]
  }

  // With state filter
  if (state && !status && !search) {
    const result = await sql`
      SELECT * FROM bills 
      WHERE state = ${state}
      ${level ? sql`AND level = ${level}` : sql``}
      ORDER BY COALESCE(last_action_date, introduced_date, created_at) DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result as DBBill[]
  }

  // With search filter
  if (search) {
    const searchPattern = `%${search}%`
    const result = await sql`
      SELECT * FROM bills 
      WHERE (title ILIKE ${searchPattern} OR summary ILIKE ${searchPattern})
      ${level ? sql`AND level = ${level}` : sql``}
      ${state ? sql`AND state = ${state}` : sql``}
      ORDER BY COALESCE(last_action_date, introduced_date, created_at) DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result as DBBill[]
  }

  // Default: get all with any combination of filters
  const result = await sql`
    SELECT * FROM bills 
    WHERE 1=1
    ${level ? sql`AND level = ${level}` : sql``}
    ${state ? sql`AND state = ${state}` : sql``}
    ${status ? sql`AND status ILIKE ${`%${status}%`}` : sql``}
    ORDER BY COALESCE(last_action_date, introduced_date, created_at) DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return result as DBBill[]
}

// Get a single bill by ID
export async function getBillById(id: string): Promise<DBBill | null> {
  const result = await sql`SELECT * FROM bills WHERE id = ${id} LIMIT 1`
  return (result[0] as DBBill) || null
}

// Get bill by external bill_id
export async function getBillByBillId(billId: string): Promise<DBBill | null> {
  const result = await sql`SELECT * FROM bills WHERE bill_id = ${billId} LIMIT 1`
  return (result[0] as DBBill) || null
}

// Upsert bills (insert or update on conflict)
export async function upsertBills(bills: Omit<DBBill, "id" | "created_at" | "updated_at">[]): Promise<number> {
  let upsertedCount = 0

  for (const bill of bills) {
    try {
      await sql`
        INSERT INTO bills (
          bill_id, title, summary, status, level, state, chamber,
          introduced_date, last_action, last_action_date, sponsor,
          topics, url, source, raw_data, updated_at
        ) VALUES (
          ${bill.bill_id},
          ${bill.title},
          ${bill.summary},
          ${bill.status},
          ${bill.level},
          ${bill.state},
          ${bill.chamber},
          ${bill.introduced_date},
          ${bill.last_action},
          ${bill.last_action_date},
          ${bill.sponsor},
          ${bill.topics},
          ${bill.url},
          ${bill.source},
          ${JSON.stringify(bill.raw_data)},
          NOW()
        )
        ON CONFLICT (bill_id) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          status = EXCLUDED.status,
          last_action = EXCLUDED.last_action,
          last_action_date = EXCLUDED.last_action_date,
          sponsor = EXCLUDED.sponsor,
          topics = EXCLUDED.topics,
          url = EXCLUDED.url,
          raw_data = EXCLUDED.raw_data,
          updated_at = NOW()
      `
      upsertedCount++
    } catch (error) {
      console.error(`[v0] Error upserting bill ${bill.bill_id}:`, error)
    }
  }

  return upsertedCount
}

// Get bill count by level
export async function getBillCounts(): Promise<{ federal: number; state: number; local: number; total: number }> {
  const result = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE level = 'federal') as federal,
      COUNT(*) FILTER (WHERE level = 'state') as state,
      COUNT(*) FILTER (WHERE level = 'local') as local,
      COUNT(*) as total
    FROM bills
  `
  const counts = result[0] as { federal: string; state: string; local: string; total: string }
  return {
    federal: parseInt(counts.federal) || 0,
    state: parseInt(counts.state) || 0,
    local: parseInt(counts.local) || 0,
    total: parseInt(counts.total) || 0,
  }
}
