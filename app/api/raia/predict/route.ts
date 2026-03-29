import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import {
  validatePredictionRequest,
  buildPredictionPromptContext,
  RAIA_SYSTEM_PROMPT,
  buildDevPrompt,
  buildMessages,
  getRaiaPredictionFormat,
} from "@/lib/raia"
import type { RaiaPredictionRequest } from "@/lib/raia"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body: RaiaPredictionRequest = await req.json()

    // Validate the prediction request
    const validation = validatePredictionRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid prediction request.", details: validation.errors },
        { status: 400 }
      )
    }

    // Three-layer prompt architecture

    // Layer 1 — System prompt: Raia identity (stable)
    const systemPrompt = RAIA_SYSTEM_PROMPT

    // Layer 2 — Developer prompt: prediction execution rules + context + intent
    let developerPrompt = buildDevPrompt({
      prediction_mode: true,
      jurisdiction_context: `Target jurisdiction: ${JSON.stringify(body.jurisdiction)}`,
      time_context: `Current date: ${new Date().toISOString().split("T")[0]}. Time horizon: ${body.time_horizon ?? "current cycle"}.`,
    })

    developerPrompt += `\nIntent: prediction_request`
    developerPrompt += `\nPrediction Class: ${body.prediction_class}`

    // Layer 3 — User input: the prediction task context
    const userInput = buildPredictionPromptContext(body)

    // Assemble message array
    const messages = buildMessages(systemPrompt, developerPrompt, userInput)

    // Call the model with structured prediction output
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
      text: {
        format: getRaiaPredictionFormat(),
      },
    })

    const parsed = JSON.parse(response.output_text)

    return NextResponse.json({
      prediction: parsed,
      _meta: {
        model: "raia-g1.0",
        prediction_class: body.prediction_class,
        jurisdiction: body.jurisdiction,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Raia G1.0 prediction error:", error)
    return NextResponse.json(
      { error: "Failed to generate prediction." },
      { status: 500 }
    )
  }
}
