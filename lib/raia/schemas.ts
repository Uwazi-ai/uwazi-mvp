// =============================================================================
// Raia G1.0 — Structured Output Schemas
// JSON schemas for OpenAI structured responses and API validation.
// =============================================================================

// Schema for the main Raia civic Q&A response.
// Used with OpenAI's structured output (json_schema format).
export const RAIA_RESPONSE_SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    question_type: {
      type: "string" as const,
      enum: [
        "ballot_explainer",
        "candidate_comparison",
        "election_procedure",
        "deadline_inquiry",
        "legislation_summary",
        "civic_process",
        "voting_rights",
        "registration_help",
        "general_civic",
        "prediction_request",
        "unknown",
      ],
    },
    jurisdiction: {
      type: ["object", "null"] as const,
      additionalProperties: false,
      properties: {
        country: { type: "string" as const },
        state: { type: "string" as const },
        county: { type: "string" as const },
        city: { type: "string" as const },
        district: { type: "string" as const },
      },
      required: ["country", "state", "county", "city", "district"],
    },
    time_context: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        classification: {
          type: "string" as const,
          enum: ["current_fact", "historical_fact", "prediction"],
        },
        reference_date: { type: "string" as const },
        expires_at: { type: "string" as const },
        election_cycle: { type: "string" as const },
      },
      required: [
        "classification",
        "reference_date",
        "expires_at",
        "election_cycle",
      ],
    },
    quick_answer: { type: "string" as const },
    plain_english: { type: "string" as const },
    why_it_matters: { type: "string" as const },
    what_you_can_do: { type: "string" as const },
    source_note: { type: "string" as const },
    confidence: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        level: {
          type: "string" as const,
          enum: ["high", "moderate", "low", "insufficient_data"],
        },
        score: { type: "number" as const },
        reasoning: { type: "string" as const },
        data_gaps: {
          type: "array" as const,
          items: { type: "string" as const },
        },
      },
      required: ["level", "score", "reasoning", "data_gaps"],
    },
    safety_notes: { type: "string" as const },
    recommended_next_steps: {
      type: "array" as const,
      items: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          action: { type: "string" as const },
          reason: { type: "string" as const },
          priority: {
            type: "string" as const,
            enum: ["critical", "high", "medium", "low"],
          },
        },
        required: ["action", "reason", "priority"],
      },
    },
    verified_facts: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    inferences: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    metrics_to_log: {
      type: "array" as const,
      items: { type: "string" as const },
    },
  },
  required: [
    "question_type",
    "jurisdiction",
    "time_context",
    "quick_answer",
    "plain_english",
    "why_it_matters",
    "what_you_can_do",
    "source_note",
    "confidence",
    "safety_notes",
    "recommended_next_steps",
    "verified_facts",
    "inferences",
    "metrics_to_log",
  ],
}

// Schema for the Raia prediction response.
export const RAIA_PREDICTION_SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    prediction_class: {
      type: "string" as const,
      enum: [
        "turnout_likelihood",
        "confusion_likelihood",
        "deadline_miss_risk",
        "literacy_gap",
        "issue_salience",
        "community_engagement",
        "misinformation_vulnerability",
        "intervention_effectiveness",
      ],
    },
    jurisdiction: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        country: { type: "string" as const },
        state: { type: "string" as const },
        county: { type: "string" as const },
        city: { type: "string" as const },
        district: { type: "string" as const },
      },
      required: ["country", "state", "county", "city", "district"],
    },
    prediction: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        question_restated: { type: "string" as const },
        unit_of_analysis: { type: "string" as const },
        likelihood: { type: "number" as const },
        pattern: { type: "string" as const },
        drivers: {
          type: "array" as const,
          items: { type: "string" as const },
        },
        supporting_signals: {
          type: "array" as const,
          items: { type: "string" as const },
        },
        uncertainty: { type: "string" as const },
        change_conditions: {
          type: "array" as const,
          items: { type: "string" as const },
        },
      },
      required: [
        "question_restated",
        "unit_of_analysis",
        "likelihood",
        "pattern",
        "drivers",
        "supporting_signals",
        "uncertainty",
        "change_conditions",
      ],
    },
    recommended_actions: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    confidence: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        level: {
          type: "string" as const,
          enum: ["high", "moderate", "low", "insufficient_data"],
        },
        score: { type: "number" as const },
        reasoning: { type: "string" as const },
      },
      required: ["level", "score", "reasoning"],
    },
    metrics_to_monitor: {
      type: "array" as const,
      items: { type: "string" as const },
    },
  },
  required: [
    "prediction_class",
    "jurisdiction",
    "prediction",
    "recommended_actions",
    "confidence",
    "metrics_to_monitor",
  ],
}

// OpenAI structured output format wrapper for the ask endpoint.
export function getRaiaResponseFormat() {
  return {
    type: "json_schema" as const,
    name: "raia_response",
    strict: true,
    schema: RAIA_RESPONSE_SCHEMA,
  }
}

// OpenAI structured output format wrapper for the prediction endpoint.
export function getRaiaPredictionFormat() {
  return {
    type: "json_schema" as const,
    name: "raia_prediction",
    strict: true,
    schema: RAIA_PREDICTION_SCHEMA,
  }
}
