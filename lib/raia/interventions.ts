// =============================================================================
// Raia G1.0 — Intervention Recommendation Engine
// Maps predictions and scores to actionable, non-partisan interventions.
// =============================================================================

import type {
  Intervention,
  InterventionType,
  Score,
  ScoreType,
  Prediction,
  PredictionClass,
  Jurisdiction,
  UIModule,
} from "./types"

// --- Intervention Definitions ---

interface InterventionTemplate {
  type: InterventionType
  title: string
  description: string
  ui_module: UIModule
  metrics_to_log: string[]
}

const INTERVENTION_CATALOG: Record<InterventionType, InterventionTemplate> = {
  show_explainer: {
    type: "show_explainer",
    title: "Show Plain-Language Explainer",
    description:
      "Display a simplified explanation of the civic topic, ballot item, or process.",
    ui_module: "chat_response",
    metrics_to_log: [
      "explainer_shown",
      "explainer_read_time",
      "explainer_helpful_rating",
    ],
  },
  send_reminder: {
    type: "send_reminder",
    title: "Send Deadline Reminder",
    description:
      "Trigger a notification reminding the user of an upcoming civic deadline.",
    ui_module: "push_notification",
    metrics_to_log: [
      "reminder_sent",
      "reminder_opened",
      "action_completed_after_reminder",
    ],
  },
  compare_candidates: {
    type: "compare_candidates",
    title: "Show Candidate Comparison",
    description:
      "Display a neutral, factual side-by-side comparison of candidates.",
    ui_module: "full_page_explainer",
    metrics_to_log: [
      "comparison_shown",
      "comparison_expanded",
      "time_on_comparison",
    ],
  },
  simplify_language: {
    type: "simplify_language",
    title: "Simplify Language Further",
    description:
      "Regenerate the response at a lower reading level for accessibility.",
    ui_module: "chat_response",
    metrics_to_log: [
      "simplification_triggered",
      "simplified_version_helpful",
    ],
  },
  recommend_official_resource: {
    type: "recommend_official_resource",
    title: "Recommend Official Source",
    description:
      "Direct the user to an authoritative government or election resource.",
    ui_module: "inline_tooltip",
    metrics_to_log: [
      "official_link_shown",
      "official_link_clicked",
    ],
  },
  trigger_accessibility_support: {
    type: "trigger_accessibility_support",
    title: "Offer Accessibility Options",
    description:
      "Present accessibility features: larger text, audio, multilingual, or simplified navigation.",
    ui_module: "sidebar_widget",
    metrics_to_log: [
      "accessibility_offered",
      "accessibility_feature_used",
      "accessibility_type_selected",
    ],
  },
  prompt_voting_plan: {
    type: "prompt_voting_plan",
    title: "Prompt Voting Plan Creation",
    description:
      "Guide the user through creating a concrete plan for when, where, and how to vote.",
    ui_module: "full_page_explainer",
    metrics_to_log: [
      "voting_plan_prompted",
      "voting_plan_started",
      "voting_plan_completed",
    ],
  },
  surface_local_context: {
    type: "surface_local_context",
    title: "Surface Local Context",
    description:
      "Show jurisdiction-specific information relevant to the user's location.",
    ui_module: "dashboard_card",
    metrics_to_log: [
      "local_context_shown",
      "local_context_expanded",
      "jurisdiction_confirmed",
    ],
  },
  flag_misinformation_risk: {
    type: "flag_misinformation_risk",
    title: "Flag Misinformation Risk",
    description:
      "Alert the user that this topic has known misinformation circulating and elevate trusted sources.",
    ui_module: "alert_banner",
    metrics_to_log: [
      "misinfo_flag_shown",
      "trusted_source_clicked",
      "misinfo_flag_dismissed",
    ],
  },
  suggest_civic_action: {
    type: "suggest_civic_action",
    title: "Suggest Civic Action",
    description:
      "Recommend a concrete, non-partisan civic action the user can take.",
    ui_module: "chat_response",
    metrics_to_log: [
      "action_suggested",
      "action_clicked",
      "action_completed",
    ],
  },
}

// --- Score-Based Intervention Rules ---
// Maps score thresholds to recommended interventions.

interface InterventionRule {
  score_type: ScoreType
  threshold: number // trigger when score >= this value (for risk) or <= (for readiness)
  direction: "above" | "below" // above = trigger when score is high, below = when low
  priority: "critical" | "high" | "medium" | "low"
  interventions: InterventionType[]
  trigger_condition: string
}

const SCORE_INTERVENTION_RULES: InterventionRule[] = [
  // High ballot complexity -> simplify + explain
  {
    score_type: "ballot_complexity",
    threshold: 60,
    direction: "above",
    priority: "high",
    interventions: ["show_explainer", "simplify_language", "compare_candidates"],
    trigger_condition: "Ballot complexity score is high (>= 60/100).",
  },
  // Critical ballot complexity
  {
    score_type: "ballot_complexity",
    threshold: 80,
    direction: "above",
    priority: "critical",
    interventions: [
      "show_explainer",
      "simplify_language",
      "trigger_accessibility_support",
    ],
    trigger_condition: "Ballot complexity score is critical (>= 80/100).",
  },
  // High deadline risk -> reminders
  {
    score_type: "deadline_risk",
    threshold: 60,
    direction: "above",
    priority: "high",
    interventions: ["send_reminder", "recommend_official_resource"],
    trigger_condition: "Deadline risk score is high (>= 60/100).",
  },
  // Critical deadline risk
  {
    score_type: "deadline_risk",
    threshold: 80,
    direction: "above",
    priority: "critical",
    interventions: [
      "send_reminder",
      "recommend_official_resource",
      "prompt_voting_plan",
    ],
    trigger_condition: "Deadline risk score is critical (>= 80/100).",
  },
  // Low civic literacy -> education
  {
    score_type: "civic_literacy",
    threshold: 40,
    direction: "below",
    priority: "medium",
    interventions: ["show_explainer", "simplify_language", "suggest_civic_action"],
    trigger_condition: "Civic literacy score is low (<= 40/100).",
  },
  // Low participation readiness -> voting plan
  {
    score_type: "participation_readiness",
    threshold: 40,
    direction: "below",
    priority: "high",
    interventions: [
      "prompt_voting_plan",
      "recommend_official_resource",
      "surface_local_context",
    ],
    trigger_condition: "Participation readiness score is low (<= 40/100).",
  },
  // Low trust -> official sources
  {
    score_type: "trust",
    threshold: 40,
    direction: "below",
    priority: "high",
    interventions: [
      "recommend_official_resource",
      "flag_misinformation_risk",
    ],
    trigger_condition: "Trust score is low (<= 40/100).",
  },
  // Low community engagement
  {
    score_type: "community_engagement",
    threshold: 35,
    direction: "below",
    priority: "medium",
    interventions: [
      "surface_local_context",
      "suggest_civic_action",
      "show_explainer",
    ],
    trigger_condition: "Community engagement score is low (<= 35/100).",
  },
  // Low confidence -> transparency
  {
    score_type: "confidence",
    threshold: 40,
    direction: "below",
    priority: "medium",
    interventions: ["recommend_official_resource"],
    trigger_condition: "Response confidence is low (<= 40/100).",
  },
]

// --- Prediction-Based Intervention Rules ---

const PREDICTION_INTERVENTION_MAP: Record<PredictionClass, InterventionType[]> =
  {
    turnout_likelihood: [
      "prompt_voting_plan",
      "send_reminder",
      "surface_local_context",
    ],
    confusion_likelihood: [
      "show_explainer",
      "simplify_language",
      "compare_candidates",
    ],
    deadline_miss_risk: [
      "send_reminder",
      "recommend_official_resource",
      "prompt_voting_plan",
    ],
    literacy_gap: [
      "show_explainer",
      "simplify_language",
      "suggest_civic_action",
    ],
    issue_salience: [
      "show_explainer",
      "surface_local_context",
    ],
    community_engagement: [
      "surface_local_context",
      "suggest_civic_action",
    ],
    misinformation_vulnerability: [
      "flag_misinformation_risk",
      "recommend_official_resource",
    ],
    intervention_effectiveness: [
      "suggest_civic_action",
    ],
  }

// --- Recommendation Engine ---

// Generate interventions based on scores.
export function recommendFromScores(
  scores: Score[],
  jurisdiction?: Jurisdiction
): Intervention[] {
  const interventions: Intervention[] = []

  for (const rule of SCORE_INTERVENTION_RULES) {
    const matchingScore = scores.find((s) => s.type === rule.score_type)
    if (!matchingScore) continue

    const triggered =
      rule.direction === "above"
        ? matchingScore.value >= rule.threshold
        : matchingScore.value <= rule.threshold

    if (!triggered) continue

    for (const interventionType of rule.interventions) {
      const template = INTERVENTION_CATALOG[interventionType]
      if (!template) continue

      // Avoid duplicates
      if (interventions.some((i) => i.type === interventionType)) continue

      interventions.push({
        ...template,
        priority: rule.priority,
        trigger_condition: rule.trigger_condition,
        jurisdiction,
      })
    }
  }

  return sortByPriority(interventions)
}

// Generate interventions based on predictions.
export function recommendFromPredictions(
  predictions: Prediction[],
  jurisdiction?: Jurisdiction
): Intervention[] {
  const interventions: Intervention[] = []

  for (const prediction of predictions) {
    const types = PREDICTION_INTERVENTION_MAP[prediction.class] ?? []

    // Higher likelihood predictions get higher priority interventions
    const priority =
      prediction.likelihood >= 0.8
        ? "critical"
        : prediction.likelihood >= 0.6
          ? "high"
          : prediction.likelihood >= 0.4
            ? "medium"
            : "low"

    for (const interventionType of types) {
      const template = INTERVENTION_CATALOG[interventionType]
      if (!template) continue

      if (interventions.some((i) => i.type === interventionType)) continue

      interventions.push({
        ...template,
        priority,
        trigger_condition: `${prediction.class} prediction likelihood: ${(prediction.likelihood * 100).toFixed(0)}%`,
        jurisdiction,
      })
    }
  }

  return sortByPriority(interventions)
}

// Merge and deduplicate interventions from multiple sources.
export function mergeInterventions(
  ...sources: Intervention[][]
): Intervention[] {
  const seen = new Set<InterventionType>()
  const merged: Intervention[] = []

  // Flatten and sort by priority first
  const all = sortByPriority(sources.flat())

  for (const intervention of all) {
    if (!seen.has(intervention.type)) {
      seen.add(intervention.type)
      merged.push(intervention)
    }
  }

  return merged
}

function sortByPriority(interventions: Intervention[]): Intervention[] {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return [...interventions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )
}

// Get the full intervention catalog (for documentation or admin UI).
export function getInterventionCatalog(): InterventionTemplate[] {
  return Object.values(INTERVENTION_CATALOG)
}
