// =============================================================================
// Raia G1.0 — Scoring Frameworks
// Measurable civic scores for users, ballots, deadlines, and engagement.
// =============================================================================

import type {
  Score,
  ScoreType,
  ScoreComponent,
  Jurisdiction,
  ConfidenceLevel,
} from "./types"

// --- Score Band Labels ---

function bandLabel(value: number, type: ScoreType): string {
  // Risk scores (higher = worse)
  const riskTypes: ScoreType[] = ["deadline_risk", "ballot_complexity"]
  if (riskTypes.includes(type)) {
    if (value >= 80) return "Critical"
    if (value >= 60) return "High Risk"
    if (value >= 40) return "Moderate Risk"
    if (value >= 20) return "Low Risk"
    return "Minimal Risk"
  }

  // Positive scores (higher = better)
  if (value >= 80) return "Strong"
  if (value >= 60) return "Good"
  if (value >= 40) return "Moderate"
  if (value >= 20) return "Developing"
  return "Low"
}

// --- Civic Literacy Score ---
// Estimates a user's civic knowledge level based on interaction signals.

export interface CivicLiteracyInput {
  questions_asked: number
  question_complexity_avg: number // 0-100
  correct_process_references: number // times user referenced correct procedures
  jurisdiction_awareness: boolean // user provides jurisdiction context
  return_engagement: number // sessions where user came back
  topics_explored: string[]
}

export function computeCivicLiteracyScore(
  input: CivicLiteracyInput
): Score {
  const components: ScoreComponent[] = [
    {
      name: "Question Sophistication",
      weight: 0.3,
      value: Math.min(input.question_complexity_avg, 100),
      description: "Complexity and depth of civic questions asked.",
    },
    {
      name: "Process Knowledge",
      weight: 0.25,
      value: Math.min(input.correct_process_references * 20, 100),
      description: "Demonstrated understanding of civic procedures.",
    },
    {
      name: "Jurisdiction Awareness",
      weight: 0.15,
      value: input.jurisdiction_awareness ? 80 : 20,
      description: "Whether the user provides relevant jurisdiction context.",
    },
    {
      name: "Topic Breadth",
      weight: 0.15,
      value: Math.min(input.topics_explored.length * 15, 100),
      description: "Range of civic topics the user has engaged with.",
    },
    {
      name: "Sustained Engagement",
      weight: 0.15,
      value: Math.min(input.return_engagement * 25, 100),
      description: "Returning to learn more over multiple sessions.",
    },
  ]

  const value = Math.round(
    components.reduce((sum, c) => sum + c.value * c.weight, 0)
  )

  return {
    type: "civic_literacy",
    value,
    label: bandLabel(value, "civic_literacy"),
    components,
    explanation: `Civic literacy score of ${value}/100 (${bandLabel(value, "civic_literacy")}). Based on question depth, process knowledge, jurisdiction awareness, topic breadth, and sustained engagement.`,
    computed_at: new Date().toISOString(),
  }
}

// --- Ballot Complexity Score ---
// Estimates how difficult a ballot is for an average voter to understand.

export interface BallotComplexityInput {
  total_items: number
  ballot_measures: number
  retention_elections: number
  avg_measure_word_count: number
  legal_jargon_density: number // 0-1
  number_of_jurisdictions: number // overlapping districts on one ballot
}

export function computeBallotComplexityScore(
  input: BallotComplexityInput,
  jurisdiction?: Jurisdiction
): Score {
  const components: ScoreComponent[] = [
    {
      name: "Item Count",
      weight: 0.2,
      value: Math.min(input.total_items * 5, 100),
      description: "Total number of items on the ballot.",
    },
    {
      name: "Ballot Measure Density",
      weight: 0.25,
      value: Math.min(input.ballot_measures * 15, 100),
      description: "Number of ballot measures requiring yes/no decisions.",
    },
    {
      name: "Retention Elections",
      weight: 0.1,
      value: Math.min(input.retention_elections * 20, 100),
      description: "Judicial or official retention questions (often confusing).",
    },
    {
      name: "Language Complexity",
      weight: 0.25,
      value: Math.min(input.avg_measure_word_count / 5, 100),
      description: "Average word count and reading difficulty of ballot measures.",
    },
    {
      name: "Jargon Density",
      weight: 0.15,
      value: Math.round(input.legal_jargon_density * 100),
      description: "Proportion of legal/technical jargon in ballot text.",
    },
    {
      name: "Jurisdictional Overlap",
      weight: 0.05,
      value: Math.min(input.number_of_jurisdictions * 20, 100),
      description: "Number of overlapping jurisdictions on the ballot.",
    },
  ]

  const value = Math.round(
    components.reduce((sum, c) => sum + c.value * c.weight, 0)
  )

  return {
    type: "ballot_complexity",
    value,
    label: bandLabel(value, "ballot_complexity"),
    components,
    explanation: `Ballot complexity score of ${value}/100 (${bandLabel(value, "ballot_complexity")}). Higher scores mean harder-to-navigate ballots. Based on item count, measure density, language complexity, and jurisdictional overlap.`,
    jurisdiction,
    computed_at: new Date().toISOString(),
  }
}

// --- Deadline Risk Score ---
// Estimates likelihood of missing a civic deadline.

export interface DeadlineRiskInput {
  days_until_deadline: number
  registration_status: "registered" | "not_registered" | "unknown"
  has_voting_plan: boolean
  reminder_set: boolean
  historical_miss_rate?: number // 0-1
}

export function computeDeadlineRiskScore(
  input: DeadlineRiskInput,
  jurisdiction?: Jurisdiction
): Score {
  const components: ScoreComponent[] = [
    {
      name: "Time Remaining",
      weight: 0.35,
      value:
        input.days_until_deadline <= 0
          ? 100
          : input.days_until_deadline <= 3
            ? 90
            : input.days_until_deadline <= 7
              ? 70
              : input.days_until_deadline <= 14
                ? 50
                : input.days_until_deadline <= 30
                  ? 30
                  : 10,
      description: "Days remaining before the deadline.",
    },
    {
      name: "Registration Status",
      weight: 0.25,
      value:
        input.registration_status === "not_registered"
          ? 90
          : input.registration_status === "unknown"
            ? 60
            : 10,
      description: "Current voter registration status.",
    },
    {
      name: "Voting Plan",
      weight: 0.2,
      value: input.has_voting_plan ? 10 : 70,
      description: "Whether a voting plan has been created.",
    },
    {
      name: "Reminder Set",
      weight: 0.1,
      value: input.reminder_set ? 10 : 60,
      description: "Whether deadline reminders are configured.",
    },
    {
      name: "Historical Pattern",
      weight: 0.1,
      value: Math.round((input.historical_miss_rate ?? 0.5) * 100),
      description: "Historical deadline compliance rate.",
    },
  ]

  const value = Math.round(
    components.reduce((sum, c) => sum + c.value * c.weight, 0)
  )

  return {
    type: "deadline_risk",
    value,
    label: bandLabel(value, "deadline_risk"),
    components,
    explanation: `Deadline risk score of ${value}/100 (${bandLabel(value, "deadline_risk")}). Based on time remaining, registration status, voting plan readiness, and reminder configuration.`,
    jurisdiction,
    computed_at: new Date().toISOString(),
  }
}

// --- Participation Readiness Score ---
// Composite score of how ready a user is to participate in an upcoming election.

export interface ParticipationReadinessInput {
  is_registered: boolean
  knows_polling_location: boolean
  has_voting_plan: boolean
  has_reviewed_ballot: boolean
  civic_literacy_score: number // 0-100
  days_until_election: number
}

export function computeParticipationReadinessScore(
  input: ParticipationReadinessInput,
  jurisdiction?: Jurisdiction
): Score {
  const components: ScoreComponent[] = [
    {
      name: "Registration",
      weight: 0.25,
      value: input.is_registered ? 100 : 0,
      description: "Voter registration status.",
    },
    {
      name: "Polling Location",
      weight: 0.15,
      value: input.knows_polling_location ? 100 : 0,
      description: "Whether the user knows where to vote.",
    },
    {
      name: "Voting Plan",
      weight: 0.2,
      value: input.has_voting_plan ? 100 : 0,
      description: "Whether a concrete voting plan exists.",
    },
    {
      name: "Ballot Review",
      weight: 0.2,
      value: input.has_reviewed_ballot ? 100 : 0,
      description: "Whether the user has reviewed their ballot.",
    },
    {
      name: "Civic Knowledge",
      weight: 0.2,
      value: input.civic_literacy_score,
      description: "General civic literacy level.",
    },
  ]

  const value = Math.round(
    components.reduce((sum, c) => sum + c.value * c.weight, 0)
  )

  return {
    type: "participation_readiness",
    value,
    label: bandLabel(value, "participation_readiness"),
    components,
    explanation: `Participation readiness score of ${value}/100 (${bandLabel(value, "participation_readiness")}). Covers registration, polling knowledge, voting plan, ballot review, and civic literacy.`,
    jurisdiction,
    computed_at: new Date().toISOString(),
  }
}

// --- Community Engagement Score ---
// Estimates aggregate engagement level for a community/jurisdiction.

export interface CommunityEngagementInput {
  historical_turnout_rate: number // 0-1
  active_civic_orgs: number
  recent_engagement_events: number
  media_coverage_level: "low" | "moderate" | "high"
  population_size: number
  registered_voter_rate: number // 0-1
}

export function computeCommunityEngagementScore(
  input: CommunityEngagementInput,
  jurisdiction?: Jurisdiction
): Score {
  const components: ScoreComponent[] = [
    {
      name: "Historical Turnout",
      weight: 0.3,
      value: Math.round(input.historical_turnout_rate * 100),
      description: "Historical voter turnout rate in this area.",
    },
    {
      name: "Civic Organizations",
      weight: 0.15,
      value: Math.min(input.active_civic_orgs * 10, 100),
      description: "Number of active civic organizations.",
    },
    {
      name: "Recent Events",
      weight: 0.15,
      value: Math.min(input.recent_engagement_events * 15, 100),
      description: "Recent civic engagement events (town halls, forums, etc.).",
    },
    {
      name: "Media Coverage",
      weight: 0.1,
      value:
        input.media_coverage_level === "high"
          ? 80
          : input.media_coverage_level === "moderate"
            ? 50
            : 20,
      description: "Level of local media coverage of civic issues.",
    },
    {
      name: "Registration Rate",
      weight: 0.3,
      value: Math.round(input.registered_voter_rate * 100),
      description: "Percentage of eligible population registered to vote.",
    },
  ]

  const value = Math.round(
    components.reduce((sum, c) => sum + c.value * c.weight, 0)
  )

  return {
    type: "community_engagement",
    value,
    label: bandLabel(value, "community_engagement"),
    components,
    explanation: `Community engagement score of ${value}/100 (${bandLabel(value, "community_engagement")}). Based on turnout history, civic organizations, events, media coverage, and registration rates.`,
    jurisdiction,
    computed_at: new Date().toISOString(),
  }
}

// --- Confidence Score ---
// Meta-score: how confident Raia is in a given response.

export function computeConfidenceScore(input: {
  source_tier_used: number // 1-5
  sources_count: number
  jurisdiction_resolved: boolean
  time_sensitivity_met: boolean
  data_freshness_days: number
}): Score {
  const components: ScoreComponent[] = [
    {
      name: "Source Quality",
      weight: 0.3,
      value: Math.max(100 - (input.source_tier_used - 1) * 20, 20),
      description: "Quality tier of the primary source used.",
    },
    {
      name: "Source Breadth",
      weight: 0.15,
      value: Math.min(input.sources_count * 25, 100),
      description: "Number of corroborating sources.",
    },
    {
      name: "Jurisdiction Resolution",
      weight: 0.2,
      value: input.jurisdiction_resolved ? 90 : 30,
      description: "Whether the answer is jurisdiction-specific.",
    },
    {
      name: "Timeliness",
      weight: 0.2,
      value: input.time_sensitivity_met ? 90 : 30,
      description: "Whether time-sensitive data is current.",
    },
    {
      name: "Data Freshness",
      weight: 0.15,
      value:
        input.data_freshness_days <= 1
          ? 100
          : input.data_freshness_days <= 7
            ? 80
            : input.data_freshness_days <= 30
              ? 60
              : input.data_freshness_days <= 90
                ? 40
                : 20,
      description: "How recently the underlying data was updated.",
    },
  ]

  const value = Math.round(
    components.reduce((sum, c) => sum + c.value * c.weight, 0)
  )

  return {
    type: "confidence",
    value,
    label: bandLabel(value, "confidence"),
    components,
    explanation: `Confidence score of ${value}/100 (${bandLabel(value, "confidence")}). Reflects source quality, breadth, jurisdiction resolution, timeliness, and data freshness.`,
    computed_at: new Date().toISOString(),
  }
}

// Convert a numeric confidence score to a qualitative level.
export function confidenceToLevel(score: number): ConfidenceLevel {
  if (score >= 75) return "high"
  if (score >= 50) return "moderate"
  if (score >= 25) return "low"
  return "insufficient_data"
}
