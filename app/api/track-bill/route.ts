import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { sql } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { billId } = await req.json()

    await sql`
      insert into tracked_bills (user_email, bill_id)
      values (${session.user.email}, ${billId})
      on conflict (user_email, bill_id) do nothing
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to track bill" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { billId } = await req.json()

    await sql`
      delete from tracked_bills
      where user_email = ${session.user.email}
        and bill_id = ${billId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to untrack bill" }, { status: 500 })
  }
}
