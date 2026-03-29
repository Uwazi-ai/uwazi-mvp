import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import {
  validatePredictionRequest,
  buildPredictionPromptContext,
  buildSystemPrompt,
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

    // Build the prediction-specific system prompt
    const systemPrompt = buildSystemPrompt({
      include_prediction_layer: true,
      jurisdiction_context: `Target jurisdiction: ${JSON.stringify(body.jurisdiction)}`,
      time_context: `Current date: ${new Date().toISOString().split("T")[0]}. Time horizon: ${body.time_horizon ?? "current cycle"}.`,
    })

    // Build the prediction context as the user message
    const predictionContext = buildPredictionPromptContext(body)

    // Call the model with structured prediction output
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: predictionContext },
      ],
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
