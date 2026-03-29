// =============================================================================
// Raia G1.0 — Prediction Engine
// Generates structured, explainable civic forecasts.
// =============================================================================

import type {
  Prediction,
  PredictionClass,
  Jurisdiction,
  TimeContext,
  ConfidenceLevel,
  SourceReference,
  RaiaPredictionRequest,
} from "./types"
import { confidenceToLevel } from "./scoring"

// --- Signal Definitions ---
// Available signal types that can feed into predictions.

export type SignalCategory =
  | "jurisdiction"
  | "temporal"
  | "behavioral"
  | "demographic"
  | "content"
  | "environmental"

export interface PredictionSignal {
  category: SignalCategory
  name: string
  value: string | number | boolean
  weight: number // 0.0 to 1.0
  source: string
  freshness_days: number
}

// Describes what signals are relevant for each prediction class.
export const PREDICTION_SIGNAL_MAP: Record<PredictionClass, string[]> = {
  turnout_likelihood: [
    "historical_turnout_rate",
    "registration_rate",
    "days_until_election",
    "ballot_complexity",
    "media_coverage_level",
    "weather_forecast",
    "early_voting_availability",
    "competitive_races_count",
  ],
  confusion_likelihood: [
    "ballot_complexity_score",
    "legal_jargon_density",
    "ballot_measure_count",
    "retention_election_count",
    "question_frequency_on_topic",
    "civic_literacy_avg",
    "language_diversity",
  ],
  deadline_miss_risk: [
    "days_until_deadline",
    "registration_status",
    "reminder_set",
    "historical_miss_rate",
    "has_voting_plan",
    "similar_deadline_miss_rate",
  ],
  literacy_gap: [
    "civic_literacy_score",
    "question_complexity_pattern",
    "topic_breadth",
    "jurisdiction_awareness",
    "process_knowledge_signals",
    "education_content_engagement",
  ],
  issue_salience: [
    "search_volume_trend",
    "question_frequency",
    "media_mentions",
    "social_engagement_rate",
    "legislative_activity",
    "community_event_count",
  ],
  community_engagement: [
    "historical_turnout",
    "civic_org_density",
    "event_attendance_rate",
    "registration_rate",
    "media_engagement",
    "nonprofit_activity",
  ],
  misinformation_vulnerability: [
    "source_diversity_score",
    "claim_verification_rate",
    "viral_content_exposure",
    "official_source_usage_rate",
    "correction_engagement_rate",
    "topic_complexity",
  ],
  intervention_effectiveness: [
    "prior_intervention_response_rate",
    "engagement_with_similar_content",
    "civic_literacy_level",
    "channel_preference",
    "time_of_delivery",
    "content_format_preference",
  ],
}

// --- Prediction Templates ---
// Pre-defined prediction structures for each class.

interface PredictionTemplate {
  class: PredictionClass
  description: string
  typical_drivers: string[]
  typical_uncertainties: string[]
  default_actions: string[]
  disallowed_uses: string[]
}

export const PREDICTION_TEMPLATES: Record<PredictionClass, PredictionTemplate> =
  {
    turnout_likelihood: {
      class: "turnout_likelihood",
      description:
        "Forecasts the probability of voter turnout in a given jurisdiction for a specific election.",
      typical_drivers: [
        "Historical turnout patterns for similar elections",
        "Competitiveness of races on ballot",
        "Ballot complexity and length",
        "Voter registration trends",
        "Early voting participation rates",
      ],
      typical_uncertainties: [
        "Weather and day-of conditions",
        "Late-breaking news or events",
        "Accuracy of historical comparisons",
        "Differential turnout across demographics",
      ],
      default_actions: [
        "Surface turnout context in user dashboard",
        "Trigger registration and voting plan reminders",
        "Highlight early voting options",
      ],
      disallowed_uses: [
        "Partisan targeting based on expected turnout",
        "Suppression strategy based on low-turnout prediction",
      ],
    },

    confusion_likelihood: {
      class: "confusion_likelihood",
      description:
        "Predicts the likelihood that voters will be confused by a ballot item, civic process, or policy.",
      typical_drivers: [
        "Legal jargon density in ballot text",
        "Number of ballot measures",
        "Retention elections (unfamiliar format)",
        "Complex policy interactions",
        "Conflicting public messaging",
      ],
      typical_uncertainties: [
        "Individual reading level variance",
        "Availability of local voter guides",
        "Media explanation quality",
      ],
      default_actions: [
        "Auto-generate plain-language explainer",
        "Offer side-by-side comparison",
        "Highlight most confusing items first",
      ],
      disallowed_uses: [
        "Exploiting confusion to influence outcomes",
      ],
    },

    deadline_miss_risk: {
      class: "deadline_miss_risk",
      description:
        "Estimates the probability that a user or community will miss a civic deadline.",
      typical_drivers: [
        "Days remaining until deadline",
        "Registration completion status",
        "Absence of voting plan",
        "No reminders configured",
        "Historical deadline miss rates in area",
      ],
      typical_uncertainties: [
        "Individual motivation and awareness",
        "External reminders from other sources",
        "Late registration availability",
      ],
      default_actions: [
        "Send deadline reminder",
        "Show countdown in dashboard",
        "Offer step-by-step registration guide",
      ],
      disallowed_uses: [
        "Exploiting deadline awareness gaps for partisan advantage",
      ],
    },

    literacy_gap: {
      class: "literacy_gap",
      description:
        "Detects areas where a user or audience likely lacks civic knowledge needed for informed participation.",
      typical_drivers: [
        "Low question complexity patterns",
        "Missing jurisdiction context in queries",
        "Narrow topic exploration",
        "Incorrect process assumptions in questions",
      ],
      typical_uncertainties: [
        "User's offline civic knowledge",
        "Cultural and language factors",
        "Quality of prior civic education",
      ],
      default_actions: [
        "Offer targeted civic education content",
        "Suggest introductory explainers",
        "Prompt jurisdiction selection",
      ],
      disallowed_uses: [
        "Using literacy gaps to target manipulation",
      ],
    },

    issue_salience: {
      class: "issue_salience",
      description:
        "Forecasts which civic issues are likely to be most important to users in a given jurisdiction and time period.",
      typical_drivers: [
        "Question frequency trends",
        "Legislative activity on topic",
        "Media coverage volume",
        "Community event activity",
        "Search volume trends",
      ],
      typical_uncertainties: [
        "Emerging issues not yet in data",
        "Media agenda-setting effects",
        "Regional variation within jurisdiction",
      ],
      default_actions: [
        "Surface trending civic topics",
        "Prioritize relevant explainers",
        "Alert nonprofits about emerging issues",
      ],
      disallowed_uses: [
        "Using salience data for partisan issue framing",
      ],
    },

    community_engagement: {
      class: "community_engagement",
      description:
        "Estimates the overall civic engagement level of a community or jurisdiction.",
      typical_drivers: [
        "Historical turnout rates",
        "Number of active civic organizations",
        "Voter registration rates",
        "Community event frequency",
        "Local media civic coverage",
      ],
      typical_uncertainties: [
        "Informal civic participation not captured in data",
        "Accuracy of organizational activity data",
        "Population mobility",
      ],
      default_actions: [
        "Provide community engagement dashboard",
        "Recommend engagement interventions for low-engagement areas",
        "Connect with local civic organizations",
      ],
      disallowed_uses: [
        "Targeting low-engagement communities for partisan gain",
      ],
    },

    misinformation_vulnerability: {
      class: "misinformation_vulnerability",
      description:
        "Assesses how vulnerable a topic, community, or user group is to civic misinformation.",
      typical_drivers: [
        "Low official-source usage",
        "High viral content exposure",
        "Topic complexity",
        "Absence of authoritative explainers",
        "History of misinformation on topic",
      ],
      typical_uncertainties: [
        "Evolving misinformation tactics",
        "Platform-specific amplification effects",
        "Cross-platform information flow",
      ],
      default_actions: [
        "Elevate official sources in response",
        "Add fact-check context",
        "Flag commonly confused claims",
        "Recommend trusted information sources",
      ],
      disallowed_uses: [
        "Creating misinformation to test vulnerability",
        "Exploiting vulnerability for manipulation",
      ],
    },

    intervention_effectiveness: {
      class: "intervention_effectiveness",
      description:
        "Predicts how effective a specific civic intervention (reminder, explainer, event) is likely to be.",
      typical_drivers: [
        "Prior response rates to similar interventions",
        "User engagement patterns",
        "Channel effectiveness data",
        "Timing optimization data",
        "Content format preferences",
      ],
      typical_uncertainties: [
        "Individual response variation",
        "External competing messages",
        "Intervention fatigue",
      ],
      default_actions: [
        "Optimize intervention timing and format",
        "A/B test content approaches",
        "Adjust channel strategy",
      ],
      disallowed_uses: [
        "Optimizing interventions for partisan persuasion",
      ],
    },
  }

// --- Prediction Builder ---

export function buildPredictionPromptContext(
  request: RaiaPredictionRequest
): string {
  const template = PREDICTION_TEMPLATES[request.prediction_class]
  const signals = PREDICTION_SIGNAL_MAP[request.prediction_class]

  return `
PREDICTION TASK: ${template.description}

Prediction Class: ${request.prediction_class}
Jurisdiction: ${formatJurisdiction(request.jurisdiction)}
Time Horizon: ${request.time_horizon ?? "current cycle"}
Additional Context: ${request.context ?? "none provided"}

AVAILABLE SIGNAL TYPES:
${signals.map((s) => `- ${s}`).join("\n")}

TYPICAL DRIVERS TO CONSIDER:
${template.typical_drivers.map((d) => `- ${d}`).join("\n")}

TYPICAL UNCERTAINTIES:
${template.typical_uncertainties.map((u) => `- ${u}`).join("\n")}

DEFAULT RECOMMENDED ACTIONS:
${template.default_actions.map((a) => `- ${a}`).join("\n")}

DISALLOWED USES (do not generate predictions for these purposes):
${template.disallowed_uses.map((d) => `- ${d}`).join("\n")}

REQUIRED OUTPUT STRUCTURE:
1. Restate the predictive question
2. State what is likely (using calibrated language: likely, may, suggests, elevated risk)
3. List the main drivers
4. List supporting signals
5. State uncertainties
6. State what would change the prediction
7. Recommend non-partisan next actions
8. Rate confidence (low / moderate / high) with brief explanation
`.trim()
}

function formatJurisdiction(j: Jurisdiction): string {
  const parts = [j.country]
  if (j.state) parts.push(j.state)
  if (j.county) parts.push(j.county)
  if (j.city) parts.push(j.city)
  if (j.district) parts.push(j.district)
  return parts.join(", ")
}

// Validates that a prediction request is safe and well-formed.
export function validatePredictionRequest(
  request: RaiaPredictionRequest
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!request.prediction_class) {
    errors.push("prediction_class is required")
  } else if (!PREDICTION_TEMPLATES[request.prediction_class]) {
    errors.push(`Unknown prediction class: ${request.prediction_class}`)
  }

  if (!request.jurisdiction?.country) {
    errors.push("jurisdiction.country is required for predictions")
  }

  return { valid: errors.length === 0, errors }
}
