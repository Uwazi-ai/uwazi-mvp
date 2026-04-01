import { NextResponse } from "next/server"
import { getBills, getBillCounts } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const level = searchParams.get("level") || undefined
    const state = searchParams.get("state") || undefined
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const countsOnly = searchParams.get("counts") === "true"

    // If only counts requested
    if (countsOnly) {
      const counts = await getBillCounts()
      return NextResponse.json({ success: true, counts })
    }

    // Get bills with filters
    const bills = await getBills({
      level,
      state,
      status,
      search,
      limit,
      offset,
    })

    // Also get counts for the UI
    const counts = await getBillCounts()

    return NextResponse.json({
      success: true,
      bills,
      counts,
      pagination: {
        limit,
        offset,
        hasMore: bills.length === limit,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching bills:", error)
    return NextResponse.json(
      { error: "Failed to fetch bills", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
