import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { sql } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { question, answer } = await req.json()

    await sql`
      insert into saved_questions (user_email, question, answer)
      values (${session.user.email}, ${question}, ${JSON.stringify(answer)}::jsonb)
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save question" }, { status: 500 })
  }
}
