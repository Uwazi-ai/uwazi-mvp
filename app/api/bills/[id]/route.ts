import { NextRequest, NextResponse } from "next/server"
import { getBillById } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: "Bill ID is required" },
        { status: 400 }
      )
    }

    const bill = await getBillById(id)

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error fetching bill:", error)
    return NextResponse.json(
      { error: "Failed to fetch bill" },
      { status: 500 }
    )
  }
}
