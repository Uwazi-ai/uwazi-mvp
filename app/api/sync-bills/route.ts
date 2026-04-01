import { NextResponse } from "next/server"
import { fetchLegiScanBills, searchBills, type Bill } from "@/lib/apify"
import { upsertBills, type DBBill } from "@/lib/db"

// Convert Apify Bill to DB Bill format
function convertToDB(bill: Bill): Omit<DBBill, "id" | "created_at" | "updated_at"> {
  return {
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
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { source = "legiscan", state, query, year } = body

    let bills: Bill[] = []

    if (source === "legiscan") {
      if (query) {
        // Search for specific bills
        bills = await searchBills(query, { state, year })
      } else {
        // Fetch master list for state/federal
        bills = await fetchLegiScanBills({ state: state || "US", query, year })
      }
    }

    if (bills.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No bills found matching criteria",
        count: 0,
      })
    }

    // Convert and upsert to database
    const dbBills = bills.map(convertToDB)
    const upsertedCount = await upsertBills(dbBills)

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${upsertedCount} bills`,
      count: upsertedCount,
      source,
    })
  } catch (error) {
    console.error("[v0] Error syncing bills:", error)
    return NextResponse.json(
      { error: "Failed to sync bills", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status or trigger manual sync
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get("state") || "US"
  const query = searchParams.get("query")

  try {
    let bills: Bill[] = []

    if (query) {
      bills = await searchBills(query, { state: state !== "US" ? state : undefined })
    } else {
      bills = await fetchLegiScanBills({ state })
    }

    return NextResponse.json({
      success: true,
      count: bills.length,
      bills: bills.slice(0, 10), // Return first 10 for preview
    })
  } catch (error) {
    console.error("[v0] Error fetching bills:", error)
    return NextResponse.json(
      { error: "Failed to fetch bills", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
