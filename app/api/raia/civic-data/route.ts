import { NextRequest, NextResponse } from "next/server"
import {
  getStateElectionData,
  getUpcomingDeadlines,
  getAvailableStates,
} from "@/lib/raia"

// GET /api/raia/civic-data?state=kansas
// GET /api/raia/civic-data?list=true (returns all available states)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stateParam = searchParams.get("state")
  const listParam = searchParams.get("list")

  // Return available states
  if (listParam === "true") {
    return NextResponse.json({
      states: getAvailableStates(),
      total: getAvailableStates().length,
    })
  }

  // Require state parameter
  if (!stateParam) {
    return NextResponse.json(
      {
        error: "State parameter is required. Use ?state=kansas or ?list=true for available states.",
        available_states: getAvailableStates().map((s) => s.name),
      },
      { status: 400 }
    )
  }

  // Look up state data
  const data = getStateElectionData(stateParam)
  if (!data) {
    return NextResponse.json(
      {
        error: `No election data found for "${stateParam}".`,
        available_states: getAvailableStates().map((s) => s.name),
      },
      { status: 404 }
    )
  }

  // Get upcoming deadlines relative to now
  const upcoming_deadlines = getUpcomingDeadlines(stateParam)

  return NextResponse.json({
    state: data,
    upcoming_deadlines,
    _meta: {
      source_tier: data.source_tier,
      source_url: data.source_url,
      updated_at: data.updated_at,
      election_cycle: data.election_cycle,
      retrieved_at: new Date().toISOString(),
    },
  })
}
