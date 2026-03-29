// =============================================================================
// Raia G1.0 — Safety & Moderation Rules
// Defines refusal behavior, escalation logic, and content safety filters.
// =============================================================================

import type {
  SafetyFlag,
  SafetyAction,
  SafetyDecision,
  ClassifiedQuestion,
} from "./types"

// Patterns that trigger safety flags during question classification.
// These are evaluated server-side before the model generates a response.
const SAFETY_PATTERNS: Array<{
  flag: SafetyFlag
  patterns: RegExp[]
  description: string
}> = [
  {
    flag: "partisan_request",
    patterns: [
      /convince\s+(people|voters|them)\s+to\s+vote\s+(for|against)/i,
      /write\s+(a\s+)?(campaign|partisan|political)\s+(ad|message|email|text)/i,
      /why\s+(should|shouldn't)\s+(I|people|we|everyone)\s+vote\s+(for|against)/i,
      /make\s+a\s+case\s+(for|against)\s+\w+\s+(party|candidate)/i,
      /draft\s+(opposition|attack|negative)\s+(research|ad|messaging)/i,
    ],
    description: "Request seeks partisan persuasion or campaign content.",
  },
  {
    flag: "voter_suppression",
    patterns: [
      /discourage\s+(people|voters|them)\s+from\s+voting/i,
      /suppress\s+(the\s+)?vote/i,
      /reduce\s+turnout/i,
      /prevent\s+(people|voters)\s+from\s+(voting|registering)/i,
      /intimidat(e|ion)\s+(at\s+)?(the\s+)?polls/i,
    ],
    description: "Request involves voter suppression or intimidation tactics.",
  },
  {
    flag: "manipulation_attempt",
    patterns: [
      /target\s+(voters|people|communities)\s+(with|using)\s+(mis|dis)information/i,
      /create\s+(fake|misleading|deceptive)\s+(news|content|information)/i,
      /manipulat(e|ion)\s+(public\s+)?opinion/i,
      /astroturf/i,
      /generate\s+(propaganda|disinformation)/i,
    ],
    description: "Request involves information manipulation or deception.",
  },
  {
    flag: "impersonation_risk",
    patterns: [
      /pretend\s+(to\s+be|you'?re)\s+(an?\s+)?(election|government|official)/i,
      /impersonat(e|ing)\s+(an?\s+)?(election|government|poll)/i,
      /pose\s+as\s+(an?\s+)?(official|authority)/i,
    ],
    description: "Request involves impersonating election officials or authorities.",
  },
  {
    flag: "legal_advice_boundary",
    patterns: [
      /am\s+I\s+(legally\s+)?(allowed|permitted|able)\s+to/i,
      /is\s+it\s+(legal|illegal)\s+(for\s+me\s+)?to/i,
      /what\s+(are\s+)?my\s+legal\s+(rights|options|remedies)/i,
      /can\s+I\s+sue/i,
      /file\s+a\s+lawsuit/i,
    ],
    description:
      "Request approaches legal advice boundary. Provide general civic info, not legal counsel.",
  },
  {
    flag: "emergency_threat",
    patterns: [
      /bomb\s+threat/i,
      /threat(en)?\s+(a\s+)?(polling|election|government)/i,
      /attack\s+(a\s+)?(polling|election)/i,
      /weapon\s+(at|near)\s+(a\s+)?(polling|election)/i,
    ],
    description: "Request involves threats to election infrastructure or public safety.",
  },
]

// Scans a question for safety flags.
export function detectSafetyFlags(question: string): SafetyFlag[] {
  const flags: SafetyFlag[] = []

  for (const rule of SAFETY_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(question)) {
        flags.push(rule.flag)
        break // one match per flag category is enough
      }
    }
  }

  return flags
}

// Determines the safety action based on detected flags.
export function evaluateSafety(flags: SafetyFlag[]): SafetyDecision {
  if (flags.length === 0) {
    return {
      flags: [],
      action: "caveat" as SafetyAction,
      reason: "No safety concerns detected.",
    }
  }

  // Hard refusals
  const refusalFlags: SafetyFlag[] = [
    "voter_suppression",
    "manipulation_attempt",
    "impersonation_risk",
    "emergency_threat",
  ]

  const hasRefusal = flags.some((f) => refusalFlags.includes(f))
  if (hasRefusal) {
    return {
      flags,
      action: "refuse",
      reason: buildRefusalReason(flags),
      alternative_response: buildAlternativeResponse(flags),
    }
  }

  // Partisan requests get redirected
  if (flags.includes("partisan_request")) {
    return {
      flags,
      action: "redirect",
      reason:
        "This request asks for partisan content. Raia provides non-partisan civic information only.",
      alternative_response:
        "I can help you compare candidates or issues factually and neutrally. " +
        "I can explain what each candidate has said, how they've voted, and what their platform includes — " +
        "but I won't recommend who to vote for. Would you like a neutral comparison instead?",
    }
  }

  // Legal advice gets a caveat
  if (flags.includes("legal_advice_boundary")) {
    return {
      flags,
      action: "caveat",
      reason:
        "This question approaches legal advice territory. Provide general civic information with a disclaimer.",
      alternative_response:
        "I can share general information about civic rights and procedures, " +
        "but I'm not a lawyer and this isn't legal advice. " +
        "For legal questions about your specific situation, consider contacting " +
        "a legal aid organization or your local bar association.",
    }
  }

  // Conflicting sources
  if (flags.includes("conflicting_sources")) {
    return {
      flags,
      action: "caveat",
      reason: "Available sources contain conflicting information.",
      alternative_response:
        "I found conflicting information on this topic. " +
        "I'll present what each source says so you can evaluate. " +
        "For the most reliable answer, check directly with your local election authority.",
    }
  }

  // Stale information
  if (flags.includes("stale_information_risk")) {
    return {
      flags,
      action: "caveat",
      reason: "Information may be outdated. Flagging for verification.",
    }
  }

  return {
    flags,
    action: "caveat",
    reason: "Minor safety flags detected. Proceeding with appropriate caveats.",
  }
}

function buildRefusalReason(flags: SafetyFlag[]): string {
  const reasons: string[] = []

  if (flags.includes("voter_suppression")) {
    reasons.push(
      "Raia will not help discourage, suppress, or prevent civic participation."
    )
  }
  if (flags.includes("manipulation_attempt")) {
    reasons.push(
      "Raia will not generate misleading, deceptive, or manipulative content."
    )
  }
  if (flags.includes("impersonation_risk")) {
    reasons.push(
      "Raia will not impersonate election officials or government authorities."
    )
  }
  if (flags.includes("emergency_threat")) {
    reasons.push(
      "This appears to involve threats to public safety. If this is an emergency, contact 911 immediately."
    )
  }

  return reasons.join(" ")
}

function buildAlternativeResponse(flags: SafetyFlag[]): string {
  if (flags.includes("emergency_threat")) {
    return (
      "If you are reporting a threat to election infrastructure or public safety, " +
      "please contact local law enforcement (911) or the FBI tip line (1-800-CALL-FBI). " +
      "I am a civic information assistant and cannot handle emergencies."
    )
  }

  if (flags.includes("voter_suppression")) {
    return (
      "I'm designed to help people participate in civic life, not discourage it. " +
      "I can help you understand how voting works, find your polling place, " +
      "check registration deadlines, or create a voting plan."
    )
  }

  if (flags.includes("manipulation_attempt")) {
    return (
      "I provide factual, non-partisan civic information only. " +
      "I can help you understand issues, compare candidates factually, " +
      "or learn about civic processes."
    )
  }

  return (
    "I can't help with that specific request, but I'm happy to provide " +
    "factual, non-partisan civic information. What civic topic can I help you understand?"
  )
}

// Validates that a classified question passes safety before processing.
export function isSafeToProcess(classified: ClassifiedQuestion): {
  safe: boolean
  decision: SafetyDecision
} {
  const decision = evaluateSafety(classified.safety_flags)
  return {
    safe: decision.action !== "refuse",
    decision,
  }
}
