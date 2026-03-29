// =============================================================================
// Raia G1.0 — Core Type Definitions
// Predictive Civic Intelligence Model for UWAZI.AI
// =============================================================================

// --- Jurisdiction ---

export interface Jurisdiction {
  country: string
  state?: string
  county?: string
  city?: string
  district?: string
}

export type JurisdictionLevel =
  | "federal"
  | "state"
  | "county"
  | "city"
  | "district"

// --- Time Awareness ---

export type TemporalClassification = "current_fact" | "historical_fact" | "prediction"

export interface TimeContext {
  classification: TemporalClassification
  reference_date: string // ISO 8601
  expires_at?: string // when this info becomes stale
  election_cycle?: string // e.g. "2026-midterm"
}

// --- Source Hierarchy ---

export type SourceTier =
  | "official_government" // tier 1: election authorities, .gov sources
  | "civic_database" // tier 2: legislative databases, civic data providers
  | "vetted_nonprofit" // tier 3: nonpartisan nonprofits, public-interest orgs
  | "reputable_media" // tier 4: established media for context only
  | "internal_product" // tier 5: UWAZI user behavior data, product memory

export interface SourceReference {
  tier: SourceTier
  name: string
  url?: string
  retrieved_at?: string
  verified: boolean
}

// --- Prediction Types ---

export type PredictionClass =
  | "turnout_likelihood"
  | "confusion_likelihood"
  | "deadline_miss_risk"
  | "literacy_gap"
  | "issue_salience"
  | "community_engagement"
  | "misinformation_vulnerability"
  | "intervention_effectiveness"

export interface Prediction {
  class: PredictionClass
  jurisdiction: Jurisdiction
  time_context: TimeContext
  likelihood: number // 0.0 to 1.0
  confidence: ConfidenceLevel
  pattern: string // what is likely
  drivers: string[] // why it is likely
  supporting_signals: string[] // what signals support it
  uncertainty: string // what uncertainty remains
  change_conditions: string[] // what would change the prediction
  recommended_actions: string[] // what to do next
  sources: SourceReference[]
}

// --- Confidence ---

export type ConfidenceLevel = "high" | "moderate" | "low" | "insufficient_data"

export interface ConfidenceAssessment {
  level: ConfidenceLevel
  score: number // 0.0 to 1.0
  reasoning: string
  data_gaps: string[]
}

// --- Scoring Systems ---

export type ScoreType =
  | "civic_literacy"
  | "ballot_complexity"
  | "trust"
  | "deadline_risk"
  | "participation_readiness"
  | "community_engagement"
  | "confidence"

export interface Score {
  type: ScoreType
  value: number // 0 to 100
  label: string // human-readable label (e.g. "Moderate", "High Risk")
  components: ScoreComponent[]
  explanation: string
  jurisdiction?: Jurisdiction
  computed_at: string
}

export interface ScoreComponent {
  name: string
  weight: number // 0.0 to 1.0
  value: number // 0 to 100
  description: string
}

// --- Interventions ---

export type InterventionType =
  | "show_explainer"
  | "send_reminder"
  | "compare_candidates"
  | "simplify_language"
  | "recommend_official_resource"
  | "trigger_accessibility_support"
  | "prompt_voting_plan"
  | "surface_local_context"
  | "flag_misinformation_risk"
  | "suggest_civic_action"

export interface Intervention {
  type: InterventionType
  priority: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  trigger_condition: string
  target_audience?: string
  jurisdiction?: Jurisdiction
  ui_module: UIModule
  metrics_to_log: string[]
}

export type UIModule =
  | "chat_response"
  | "dashboard_card"
  | "alert_banner"
  | "push_notification"
  | "email_digest"
  | "inline_tooltip"
  | "sidebar_widget"
  | "full_page_explainer"

// --- Question Classification ---

export type QuestionType =
  | "ballot_explainer"
  | "candidate_comparison"
  | "election_procedure"
  | "deadline_inquiry"
  | "legislation_summary"
  | "civic_process"
  | "voting_rights"
  | "registration_help"
  | "general_civic"
  | "prediction_request"
  | "unknown"

export interface ClassifiedQuestion {
  original_question: string
  question_type: QuestionType
  jurisdiction: Jurisdiction | null
  jurisdiction_required: boolean
  time_sensitivity: "urgent" | "time_sensitive" | "general"
  sources_needed: SourceTier[]
  requires_retrieval: boolean
  safety_flags: SafetyFlag[]
}

// --- Safety ---

export type SafetyFlag =
  | "partisan_request"
  | "manipulation_attempt"
  | "legal_advice_boundary"
  | "conflicting_sources"
  | "stale_information_risk"
  | "impersonation_risk"
  | "voter_suppression"
  | "emergency_threat"

export type SafetyAction = "refuse" | "redirect" | "caveat" | "escalate"

export interface SafetyDecision {
  flags: SafetyFlag[]
  action: SafetyAction
  reason: string
  alternative_response?: string
}

// --- Raia Response (Structured Output) ---

export interface RaiaResponse {
  question_type: QuestionType
  jurisdiction: Jurisdiction | null
  time_context: TimeContext
  quick_answer: string
  plain_english: string
  why_it_matters: string
  what_you_can_do: string
  source_note: string
  sources: SourceReference[]
  confidence: ConfidenceAssessment
  predictions?: Prediction[]
  scores?: Score[]
  recommended_interventions: Intervention[]
  safety_decision: SafetyDecision
  ui_module: UIModule
  metrics_to_log: string[]
}

// --- Raia Prediction Request ---

export interface RaiaPredictionRequest {
  prediction_class: PredictionClass
  jurisdiction: Jurisdiction
  context?: string
  time_horizon?: string // e.g. "next_30_days", "next_election"
}

// --- Raia Ask Request ---

export interface RaiaAskRequest {
  question: string
  jurisdiction?: Partial<Jurisdiction>
  user_context?: {
    civic_literacy_score?: number
    preferred_language?: string
    accessibility_needs?: string[]
  }
}
