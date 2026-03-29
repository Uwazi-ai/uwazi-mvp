// =============================================================================
// Raia G1.0 — Source Hierarchy Configuration
// Defines trusted source tiers and retrieval priority rules.
// =============================================================================

import type { SourceTier, SourceReference, QuestionType } from "./types"

// Source tier definitions with trust ranking and usage rules.
export const SOURCE_TIERS: Record<
  SourceTier,
  {
    rank: number
    label: string
    description: string
    examples: string[]
    allowed_for: string[]
    restrictions: string[]
  }
> = {
  official_government: {
    rank: 1,
    label: "Official Government & Election Authority",
    description:
      "Primary authoritative sources for election rules, deadlines, registration, polling locations, ballot content, legislative text, and legal requirements.",
    examples: [
      "state secretary of state websites",
      "county election boards",
      "congress.gov",
      "state legislature portals",
      "vote.gov",
      "local government .gov sites",
      "federal register",
    ],
    allowed_for: [
      "election_procedure",
      "deadline_inquiry",
      "registration_help",
      "ballot_explainer",
      "legislation_summary",
      "voting_rights",
    ],
    restrictions: [],
  },

  civic_database: {
    rank: 2,
    label: "Trusted Civic Data Providers",
    description:
      "Legislative databases, civic data APIs, and verified public records aggregators.",
    examples: [
      "OpenStates API",
      "ProPublica Congress API",
      "Google Civic Information API",
      "BallotReady",
      "Ballotpedia",
      "LegiScan",
      "GovTrack",
    ],
    allowed_for: [
      "candidate_comparison",
      "legislation_summary",
      "ballot_explainer",
      "civic_prediction",
      "community_insight",
    ],
    restrictions: [
      "Cross-reference with official sources when possible",
      "Note data freshness limitations",
    ],
  },

  vetted_nonprofit: {
    rank: 3,
    label: "Vetted Nonprofit & Public Interest Organizations",
    description:
      "Nonpartisan civic organizations that produce educational content, voter guides, and public-interest analysis.",
    examples: [
      "League of Women Voters",
      "Common Cause",
      "National Conference of State Legislatures (NCSL)",
      "Brennan Center for Justice",
      "Rock the Vote",
      "vote.org",
    ],
    allowed_for: [
      "civic_literacy_help",
      "general_civic_education",
      "voting_plan_assistance",
      "community_insight",
      "nonprofit_outreach_insight",
    ],
    restrictions: [
      "Verify nonpartisan status before inclusion",
      "Do not cite advocacy positions as neutral fact",
    ],
  },

  reputable_media: {
    rank: 4,
    label: "Reputable Media (Context Only)",
    description:
      "Established news organizations used only for additional context, not as primary factual authority on rules or procedures.",
    examples: [
      "Associated Press",
      "Reuters",
      "local newspaper of record",
    ],
    allowed_for: [
      "community_insight",
      "general_civic_education",
    ],
    restrictions: [
      "Never use as sole source for election rules or deadlines",
      "Always pair with higher-tier source when citing procedures",
      "Clearly label as contextual reporting, not authoritative rule",
    ],
  },

  internal_product: {
    rank: 5,
    label: "Internal Platform Data",
    description:
      "UWAZI.AI user behavior data, aggregated engagement patterns, and product memory. Used for personalization, scoring, and internal analytics only.",
    examples: [
      "user question history",
      "civic literacy assessment results",
      "engagement patterns",
      "tracked bills and topics",
    ],
    allowed_for: [
      "dashboard_internal_analytics",
      "civic_prediction",
      "nonprofit_outreach_insight",
    ],
    restrictions: [
      "Never expose raw user data in responses",
      "Only use aggregated or anonymized patterns",
      "Never use to target users politically",
    ],
  },
}

// Determines which source tiers are required for a given question type.
export function getRequiredSourceTiers(
  questionType: QuestionType
): SourceTier[] {
  const tierMap: Record<QuestionType, SourceTier[]> = {
    election_procedure: ["official_government"],
    ballot_explainer: ["official_government", "civic_database"],
    candidate_comparison: ["civic_database", "official_government"],
    deadline_inquiry: ["official_government"],
    legislation_summary: ["official_government", "civic_database"],
    civic_process: ["official_government", "vetted_nonprofit"],
    voting_rights: ["official_government", "vetted_nonprofit"],
    registration_help: ["official_government"],
    general_civic: ["vetted_nonprofit", "civic_database"],
    prediction_request: ["civic_database", "internal_product"],
    unknown: [],
  }
  return tierMap[questionType] ?? []
}

// Validates whether a source meets minimum trust requirements.
export function isSourceAcceptable(
  source: SourceReference,
  questionType: QuestionType
): boolean {
  const tier = SOURCE_TIERS[source.tier]
  if (!tier) return false

  // For high-stakes question types, require tier 1 or 2
  const highStakesTypes: QuestionType[] = [
    "election_procedure",
    "deadline_inquiry",
    "registration_help",
    "voting_rights",
  ]

  if (highStakesTypes.includes(questionType) && tier.rank > 2) {
    return false
  }

  return source.verified || tier.rank <= 2
}

// Generates a "no source available" disclosure message.
export function noSourceDisclosure(questionType: QuestionType): string {
  const highStakesTypes: QuestionType[] = [
    "election_procedure",
    "deadline_inquiry",
    "registration_help",
    "voting_rights",
    "ballot_explainer",
  ]

  if (highStakesTypes.includes(questionType)) {
    return (
      "I don't have verified information for this specific question. " +
      "For election rules, deadlines, and registration requirements, " +
      "please check your state or local election authority directly. " +
      "You can find your local election office at vote.gov."
    )
  }

  return (
    "I don't have a verified source for this specific detail. " +
    "The information below is general guidance — please verify with " +
    "an official source before relying on it for decisions."
  )
}
