import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required." }, { status: 400 })
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
You are UWAZI, a nonpartisan civic clarity assistant.

Your job is to help users understand legislation, policy, elections, and government in plain language.

Rules:
- Be neutral and factual.
- Never tell the user who to vote for.
- Keep the reading level accessible.
- If jurisdiction is unclear, say that clearly.
- Return JSON only.
          `,
        },
        {
          role: "user",
          content: question,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "uwazi_answer",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              quickAnswer: { type: "string" },
              plainEnglish: { type: "string" },
              whyItMatters: { type: "string" },
              nextStep: { type: "string" },
              sourceNote: { type: "string" },
            },
            required: [
              "quickAnswer",
              "plainEnglish",
              "whyItMatters",
              "nextStep",
              "sourceNote",
            ],
          },
        },
      },
    })

    const parsed = JSON.parse(response.output_text)

    // Map nextStep to whatYouCanDo for frontend compatibility
    return NextResponse.json({
      ...parsed,
      whatYouCanDo: parsed.nextStep,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to generate answer." }, { status: 500 })
  }
}
