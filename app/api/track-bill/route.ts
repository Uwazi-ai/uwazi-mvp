import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { billId } = await req.json()

    const { error } = await supabase
      .from("tracked_bills")
      .upsert(
        { user_email: session.user.email, bill_id: billId },
        { onConflict: "user_email,bill_id", ignoreDuplicates: true }
      )

    if (error) throw error

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

    const { error } = await supabase
      .from("tracked_bills")
      .delete()
      .eq("user_email", session.user.email)
      .eq("bill_id", billId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to untrack bill" }, { status: 500 })
  }
}
