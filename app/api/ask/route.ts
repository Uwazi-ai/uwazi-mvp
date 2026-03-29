import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import {
  classifyQuestion,
  evaluateSafety,
  RAIA_SYSTEM_PROMPT,
  buildDevPrompt,
  buildMessages,
  needsPredictionLayer,
  getRaiaResponseFormat,
} from "@/lib/raia"
import type { RaiaAskRequest } from "@/lib/raia"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question: string = body.question
    const jurisdiction = body.jurisdiction ?? undefined

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      )
    }

    // Step 1: Classify the question
    const raiaRequest: RaiaAskRequest = { question, jurisdiction }
    const classified = classifyQuestion(raiaRequest)

    // Step 2: Safety check — refuse before calling the model
    const safetyDecision = evaluateSafety(classified.safety_flags)

    if (safetyDecision.action === "refuse") {
      return NextResponse.json({
        quickAnswer: safetyDecision.alternative_response ?? safetyDecision.reason,
        plainEnglish: safetyDecision.reason,
        whyItMatters:
          "UWAZI.AI is committed to non-partisan, trustworthy civic information.",
        whatYouCanDo:
          "Try asking a factual question about civic processes, ballot measures, candidates, or legislation.",
        sourceNote: "Safety policy: Raia G1.0 non-partisan design constraint.",
        _raia: {
          question_type: classified.question_type,
          safety_action: safetyDecision.action,
          safety_flags: safetyDecision.flags,
        },
      })
    }

    // Step 3: Build three-layer prompt architecture
    //   Layer 1 — System prompt: Raia identity and principles (stable)
    const systemPrompt = RAIA_SYSTEM_PROMPT

    //   Layer 2 — Developer prompt: execution rules + dynamic context + intent
    let developerPrompt = buildDevPrompt({
      prediction_mode: needsPredictionLayer(classified.question_type),
      jurisdiction_context: classified.jurisdiction
        ? `User jurisdiction: ${JSON.stringify(classified.jurisdiction)}`
        : classified.jurisdiction_required
          ? "Jurisdiction not provided but required. Ask the user or provide general guidance with clear labels."
          : undefined,
      time_context: `Current date: ${new Date().toISOString().split("T")[0]}. Time sensitivity: ${classified.time_sensitivity}.`,
    })

    // Inject classified intent so the model knows how to route
    developerPrompt += `\nIntent: ${classified.question_type}`
    developerPrompt += `\nTime Sensitivity: ${classified.time_sensitivity}`
    developerPrompt += `\nSources Needed: ${classified.sources_needed.join(", ") || "none"}`
    if (classified.safety_flags.length > 0) {
      developerPrompt += `\nSafety Flags: ${classified.safety_flags.join(", ")}`
    }

    //   Layer 3 — User input: the actual question
    const userInput = question

    // Assemble message array
    const messages = buildMessages(systemPrompt, developerPrompt, userInput)

    // Step 4: Call the model with structured output
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
      text: {
        format: getRaiaResponseFormat(),
      },
    })

    const parsed = JSON.parse(response.output_text)

    // Step 5: Build response with backward compatibility for existing frontend
    const legacyResponse = {
      quickAnswer: parsed.quick_answer,
      plainEnglish: parsed.plain_english,
      whyItMatters: parsed.why_it_matters,
      whatYouCanDo: parsed.what_you_can_do,
      sourceNote: parsed.source_note,
    }

    // Step 6: Include Raia metadata for enhanced clients
    const raiaMetadata = {
      question_type: parsed.question_type,
      jurisdiction: parsed.jurisdiction,
      time_context: parsed.time_context,
      confidence: parsed.confidence,
      safety_notes: parsed.safety_notes,
      recommended_next_steps: parsed.recommended_next_steps,
      verified_facts: parsed.verified_facts,
      inferences: parsed.inferences,
      metrics_to_log: parsed.metrics_to_log,
      classified: {
        question_type: classified.question_type,
        jurisdiction_required: classified.jurisdiction_required,
        time_sensitivity: classified.time_sensitivity,
        sources_needed: classified.sources_needed,
        safety_flags: classified.safety_flags,
      },
    }

    // Add safety caveats if present
    if (safetyDecision.action === "caveat" && safetyDecision.alternative_response) {
      legacyResponse.sourceNote +=
        "\n\nNote: " + safetyDecision.alternative_response
    }

    return NextResponse.json({
      ...legacyResponse,
      _raia: raiaMetadata,
    })
  } catch (error) {
    console.error("Raia G1.0 ask error:", error)
    return NextResponse.json(
      { error: "Failed to generate answer." },
      { status: 500 }
    )
  }
}
