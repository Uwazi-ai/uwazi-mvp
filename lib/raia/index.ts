// =============================================================================
// Raia G1.0 — Module Index & Orchestrator
// Main entry point for the Raia predictive civic intelligence system.
// =============================================================================

// Re-export all types
export type {
  Jurisdiction,
  JurisdictionLevel,
  TemporalClassification,
  TimeContext,
  SourceTier,
  SourceReference,
  PredictionClass,
  Prediction,
  ConfidenceLevel,
  ConfidenceAssessment,
  ScoreType,
  Score,
  ScoreComponent,
  InterventionType,
  Intervention,
  UIModule,
  QuestionType,
  ClassifiedQuestion,
  SafetyFlag,
  SafetyAction,
  SafetyDecision,
  RaiaResponse,
  RaiaPredictionRequest,
  RaiaAskRequest,
} from "./types"

// Re-export source utilities
export {
  SOURCE_TIERS,
  getRequiredSourceTiers,
  isSourceAcceptable,
  noSourceDisclosure,
} from "./sources"

// Re-export safety utilities
export {
  detectSafetyFlags,
  evaluateSafety,
  isSafeToProcess,
} from "./safety"

// Re-export scoring
export {
  computeCivicLiteracyScore,
  computeBallotComplexityScore,
  computeDeadlineRiskScore,
  computeParticipationReadinessScore,
  computeCommunityEngagementScore,
  computeConfidenceScore,
  confidenceToLevel,
} from "./scoring"

// Re-export predictions
export {
  PREDICTION_SIGNAL_MAP,
  PREDICTION_TEMPLATES,
  buildPredictionPromptContext,
  validatePredictionRequest,
} from "./predictions"

// Re-export interventions
export {
  recommendFromScores,
  recommendFromPredictions,
  mergeInterventions,
  getInterventionCatalog,
} from "./interventions"

// Re-export prompt architecture
export {
  RAIA_SYSTEM_PROMPT,
  RAIA_DEV_PROMPT,
  RAIA_PREDICTION_DEV_PROMPT,
  buildDevPrompt,
  buildMessages,
  needsPredictionLayer,
} from "./system-prompt"

// Re-export schemas
export {
  RAIA_RESPONSE_SCHEMA,
  RAIA_PREDICTION_SCHEMA,
  getRaiaResponseFormat,
  getRaiaPredictionFormat,
} from "./schemas"

// =============================================================================
// Orchestrator — Request Classification
// =============================================================================

import type {
  ClassifiedQuestion,
  QuestionType,
  Jurisdiction,
  RaiaAskRequest,
} from "./types"
import { detectSafetyFlags } from "./safety"
import { getRequiredSourceTiers } from "./sources"

// Classifies an incoming question to determine routing, safety, and source needs.
export function classifyQuestion(request: RaiaAskRequest): ClassifiedQuestion {
  const question = request.question.toLowerCase()

  // Detect question type
  const questionType = detectQuestionType(question)

  // Resolve jurisdiction from request or question text
  const jurisdiction = resolveJurisdiction(request)

  // Determine if jurisdiction is required for an accurate answer
  const jurisdictionRequired = isJurisdictionRequired(questionType)

  // Determine time sensitivity
  const timeSensitivity = detectTimeSensitivity(question, questionType)

  // Get required source tiers
  const sourcesNeeded = getRequiredSourceTiers(questionType)

  // Run safety check
  const safetyFlags = detectSafetyFlags(request.question)

  return {
    original_question: request.question,
    question_type: questionType,
    jurisdiction: jurisdiction ?? null,
    jurisdiction_required: jurisdictionRequired,
    time_sensitivity: timeSensitivity,
    sources_needed: sourcesNeeded,
    requires_retrieval: sourcesNeeded.length > 0,
    safety_flags: safetyFlags,
  }
}

function detectQuestionType(question: string): QuestionType {
  // Order matters — more specific patterns first

  if (/ballot\s+(measure|initiative|proposition|question|item)/i.test(question)) {
    return "ballot_explainer"
  }

  if (/compar(e|ison|ing)\s+(candidate|running)/i.test(question) ||
      /candidate.+vs/i.test(question) ||
      /difference\s+between.+(candidate|running)/i.test(question)) {
    return "candidate_comparison"
  }

  if (/regist(er|ration)\s+(to\s+)?vote/i.test(question) ||
      /how\s+do\s+I\s+register/i.test(question)) {
    return "registration_help"
  }

  if (/deadline|due\s+date|last\s+day|cut\s*off/i.test(question)) {
    return "deadline_inquiry"
  }

  if (/poll(ing)?\s+(place|location|station|hours)/i.test(question) ||
      /where\s+(do|can)\s+I\s+vote/i.test(question) ||
      /how\s+to\s+vote|voting\s+(process|method|procedure)/i.test(question) ||
      /early\s+voting|absentee|mail.in\s+ballot/i.test(question)) {
    return "election_procedure"
  }

  if (/bill|legislation|law|act|ordinance|statute|amendment|h\.?r\.?|s\.?b\.?/i.test(question)) {
    return "legislation_summary"
  }

  if (/voting\s+right|voter\s+right|right\s+to\s+vote|voter\s+protection/i.test(question)) {
    return "voting_rights"
  }

  if (/predict|forecast|likelihood|probability|risk\s+of|chance\s+of/i.test(question)) {
    return "prediction_request"
  }

  if (/how\s+does.+(government|congress|senate|house|council|court)/i.test(question) ||
      /what\s+does.+(government|congress|senate|house|council)/i.test(question) ||
      /civic|government\s+(process|system|structure)/i.test(question)) {
    return "civic_process"
  }

  return "general_civic"
}

function resolveJurisdiction(request: RaiaAskRequest): Jurisdiction | null {
  if (request.jurisdiction) {
    return {
      country: request.jurisdiction.country ?? "US",
      state: request.jurisdiction.state,
      county: request.jurisdiction.county,
      city: request.jurisdiction.city,
      district: request.jurisdiction.district,
    }
  }

  // Attempt basic jurisdiction extraction from question text.
  // In production this would use a more sophisticated NER approach.
  const statePatterns =
    /\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New\s+Hampshire|New\s+Jersey|New\s+Mexico|New\s+York|North\s+Carolina|North\s+Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode\s+Island|South\s+Carolina|South\s+Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West\s+Virginia|Wisconsin|Wyoming)\b/i

  const match = request.question.match(statePatterns)
  if (match) {
    return {
      country: "US",
      state: match[1],
    }
  }

  return null
}

function isJurisdictionRequired(questionType: QuestionType): boolean {
  const requiresJurisdiction: QuestionType[] = [
    "election_procedure",
    "deadline_inquiry",
    "registration_help",
    "ballot_explainer",
    "voting_rights",
  ]
  return requiresJurisdiction.includes(questionType)
}

function detectTimeSensitivity(
  question: string,
  questionType: QuestionType
): "urgent" | "time_sensitive" | "general" {
  // Urgent: deadlines, registration, polling
  const urgentTypes: QuestionType[] = ["deadline_inquiry", "registration_help"]
  if (urgentTypes.includes(questionType)) return "urgent"

  // Time sensitive: elections, ballots, candidates, legislation status
  const timeSensitiveTypes: QuestionType[] = [
    "election_procedure",
    "ballot_explainer",
    "candidate_comparison",
    "legislation_summary",
  ]
  if (timeSensitiveTypes.includes(questionType)) return "time_sensitive"

  // Check for temporal keywords
  if (/today|tomorrow|this\s+week|upcoming|next\s+(election|week|month)|deadline/i.test(question)) {
    return "time_sensitive"
  }

  return "general"
}
