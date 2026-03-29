// =============================================================================
// Raia G1.0 — Civic Data Layer
// Structured, source-attributed, time-stamped election and civic data.
// This is the retrieval ground truth Raia references for jurisdiction-specific
// facts: registration deadlines, early voting windows, ID requirements, etc.
//
// DATA FRESHNESS: This file must be reviewed and updated before each election
// cycle. All dates, rules, and procedures are keyed to a specific cycle and
// carry an `updated_at` timestamp and `source_url` for verification.
//
// SOURCE TIER: official_government (tier 1)
// =============================================================================

import type { SourceTier } from "./types"

// --- Core Types ---

export interface StateElectionData {
  state_name: string
  state_abbr: string
  source_url: string
  source_tier: SourceTier
  updated_at: string // ISO 8601
  election_cycle: string // e.g. "2026-midterm"

  // Registration
  registration: {
    online: boolean
    online_deadline: string | null
    by_mail_deadline: string | null
    in_person_deadline: string | null
    same_day_registration: boolean
    same_day_notes: string | null
    registration_url: string
  }

  // Voting methods
  voting_methods: {
    early_voting: boolean
    early_voting_start: string | null
    early_voting_end: string | null
    no_excuse_absentee: boolean
    absentee_request_deadline: string | null
    absentee_return_deadline: string | null
    all_mail_election: boolean
    in_person_election_day: boolean
  }

  // ID requirements
  voter_id: {
    required: boolean
    strict_photo_id: boolean
    accepted_forms: string[]
    no_id_fallback: string | null // what to do if you don't have ID
    details_url: string
  }

  // Polling
  polling: {
    hours: string
    lookup_url: string
  }

  // Key dates
  key_dates: Array<{
    event: string
    date: string
    notes: string | null
  }>

  // State-specific notes
  notes: string[]
}

// --- State Election Data ---
// Each entry is sourced from official .gov or secretary of state websites.
// 2026 midterm cycle data.

export const STATE_CIVIC_DATA: Record<string, StateElectionData> = {
  kansas: {
    state_name: "Kansas",
    state_abbr: "KS",
    source_url: "https://sos.ks.gov/elections/elections.html",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-15",
      by_mail_deadline: "2026-10-15",
      in_person_deadline: "2026-10-15",
      same_day_registration: false,
      same_day_notes: null,
      registration_url: "https://www.kdor.ks.gov/apps/voterreg/home",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-20",
      early_voting_end: "2026-11-02",
      no_excuse_absentee: true,
      absentee_request_deadline: "2026-10-27",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: true,
      strict_photo_id: true,
      accepted_forms: [
        "Kansas driver's license or ID",
        "U.S. passport",
        "U.S. military ID",
        "Government-issued photo ID",
        "Concealed carry license",
        "Tribal photo ID",
      ],
      no_id_fallback:
        "You may cast a provisional ballot and provide ID to your county election office by the canvass date.",
      details_url: "https://sos.ks.gov/elections/voter-id.html",
    },

    polling: {
      hours: "7:00 AM - 7:00 PM (local time)",
      lookup_url: "https://myvoteinfo.voteks.org/voterview",
    },

    key_dates: [
      { event: "Registration deadline", date: "2026-10-15", notes: "Online, by mail, and in person" },
      { event: "Early voting begins", date: "2026-10-20", notes: "In-person advance voting" },
      { event: "Absentee ballot request deadline", date: "2026-10-27", notes: null },
      { event: "Early voting ends", date: "2026-11-02", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 7 AM - 7 PM" },
      { event: "Absentee ballot return deadline", date: "2026-11-03", notes: "Must be received by close of polls" },
    ],

    notes: [
      "Kansas requires a photo ID to vote in person.",
      "Advance voting (early voting) dates vary by county — check with your county clerk.",
    ],
  },

  california: {
    state_name: "California",
    state_abbr: "CA",
    source_url: "https://www.sos.ca.gov/elections",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-19",
      by_mail_deadline: "2026-10-19",
      in_person_deadline: "2026-11-03",
      same_day_registration: true,
      same_day_notes:
        "California offers Conditional Voter Registration (same-day registration) at your county elections office or vote center through Election Day.",
      registration_url: "https://registertovote.ca.gov",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-05",
      early_voting_end: "2026-11-03",
      no_excuse_absentee: true,
      absentee_request_deadline: null,
      absentee_return_deadline: "2026-11-03",
      all_mail_election: true,
      in_person_election_day: true,
    },

    voter_id: {
      required: false,
      strict_photo_id: false,
      accepted_forms: [
        "No ID required for most voters",
        "First-time voters who registered by mail may need to show ID",
      ],
      no_id_fallback:
        "Most California voters do not need to show ID. If asked, you may provide a utility bill, bank statement, or government document with your name and address.",
      details_url: "https://www.sos.ca.gov/elections/voter-registration/what-bring",
    },

    polling: {
      hours: "7:00 AM - 8:00 PM",
      lookup_url: "https://www.sos.ca.gov/elections/polling-place",
    },

    key_dates: [
      { event: "Vote-by-mail ballots mailed", date: "2026-10-05", notes: "All registered voters receive a ballot" },
      { event: "Registration deadline (online/mail)", date: "2026-10-19", notes: null },
      { event: "Same-day registration available", date: "2026-10-20", notes: "Through Election Day at vote centers" },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 7 AM - 8 PM" },
      { event: "Mail ballot return deadline", date: "2026-11-03", notes: "Postmarked by Election Day, sincerely received within 7 days" },
    ],

    notes: [
      "California is a universal vote-by-mail state — all registered voters receive a ballot.",
      "In-person voting and same-day registration are available at vote centers.",
    ],
  },

  texas: {
    state_name: "Texas",
    state_abbr: "TX",
    source_url: "https://www.sos.texas.gov/elections/index.shtml",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: false,
      online_deadline: null,
      by_mail_deadline: "2026-10-05",
      in_person_deadline: "2026-10-05",
      same_day_registration: false,
      same_day_notes: null,
      registration_url: "https://www.votetexas.gov/register-to-vote/",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-19",
      early_voting_end: "2026-10-30",
      no_excuse_absentee: false,
      absentee_request_deadline: "2026-10-23",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: true,
      strict_photo_id: true,
      accepted_forms: [
        "Texas driver's license",
        "Texas personal ID card",
        "Texas Election ID Certificate (free)",
        "Texas concealed handgun license",
        "U.S. military ID with photo",
        "U.S. passport (book or card)",
        "U.S. citizenship certificate with photo",
      ],
      no_id_fallback:
        "If you don't have an acceptable photo ID, you may sign a Reasonable Impediment Declaration and present a supporting document (utility bill, bank statement, government document, paycheck, or birth certificate).",
      details_url: "https://www.votetexas.gov/voter-id/",
    },

    polling: {
      hours: "7:00 AM - 7:00 PM",
      lookup_url: "https://teamrv-mvp.sos.texas.gov/MVP/mvp.do",
    },

    key_dates: [
      { event: "Registration deadline", date: "2026-10-05", notes: "Must be postmarked or hand-delivered by this date" },
      { event: "Early voting begins", date: "2026-10-19", notes: null },
      { event: "Absentee ballot request deadline", date: "2026-10-23", notes: "Application must be received by this date" },
      { event: "Early voting ends", date: "2026-10-30", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 7 AM - 7 PM" },
    ],

    notes: [
      "Texas does not offer online voter registration.",
      "Absentee voting requires a qualifying excuse (age 65+, disability, absence from county, or confinement in jail).",
      "Photo ID is required to vote in person.",
    ],
  },

  florida: {
    state_name: "Florida",
    state_abbr: "FL",
    source_url: "https://dos.fl.gov/elections/",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-05",
      by_mail_deadline: "2026-10-05",
      in_person_deadline: "2026-10-05",
      same_day_registration: false,
      same_day_notes: null,
      registration_url: "https://registertovoteflorida.gov",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-24",
      early_voting_end: "2026-10-31",
      no_excuse_absentee: true,
      absentee_request_deadline: "2026-10-24",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: true,
      strict_photo_id: true,
      accepted_forms: [
        "Florida driver's license",
        "Florida ID card",
        "U.S. passport",
        "Military ID",
        "Student ID from Florida institution",
        "Retirement center ID",
        "Neighborhood association ID",
        "Public assistance ID",
      ],
      no_id_fallback:
        "You may cast a provisional ballot and provide valid ID to the Supervisor of Elections within two days.",
      details_url: "https://dos.fl.gov/elections/for-voters/voting/election-day-voting/",
    },

    polling: {
      hours: "7:00 AM - 7:00 PM",
      lookup_url: "https://registration.elections.myflorida.com/CheckVoterStatus",
    },

    key_dates: [
      { event: "Registration deadline", date: "2026-10-05", notes: "Online, by mail, and in person" },
      { event: "Absentee ballot request deadline", date: "2026-10-24", notes: null },
      { event: "Early voting begins", date: "2026-10-24", notes: "Dates may vary by county" },
      { event: "Early voting ends", date: "2026-10-31", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 7 AM - 7 PM" },
    ],

    notes: [
      "Florida requires photo and signature ID to vote.",
      "Early voting dates may vary slightly by county.",
      "No-excuse absentee/vote-by-mail voting is available to all registered voters.",
    ],
  },

  new_york: {
    state_name: "New York",
    state_abbr: "NY",
    source_url: "https://www.elections.ny.gov/",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-14",
      by_mail_deadline: "2026-10-14",
      in_person_deadline: "2026-10-14",
      same_day_registration: false,
      same_day_notes: null,
      registration_url: "https://www.elections.ny.gov/VotingRegister.html",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-24",
      early_voting_end: "2026-11-01",
      no_excuse_absentee: true,
      absentee_request_deadline: "2026-10-19",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: false,
      strict_photo_id: false,
      accepted_forms: [
        "No photo ID required for most voters",
        "First-time voters who registered by mail may need to show ID",
      ],
      no_id_fallback:
        "If asked, you may provide a current utility bill, bank statement, government check, or other government document with your name and address.",
      details_url: "https://www.elections.ny.gov/VotingElectionDay.html",
    },

    polling: {
      hours: "6:00 AM - 9:00 PM",
      lookup_url: "https://voterlookup.elections.ny.gov/",
    },

    key_dates: [
      { event: "Registration deadline", date: "2026-10-14", notes: "Online, by mail, and in person" },
      { event: "Absentee ballot application deadline (by mail)", date: "2026-10-19", notes: null },
      { event: "Early voting begins", date: "2026-10-24", notes: null },
      { event: "Absentee ballot application deadline (in person)", date: "2026-11-02", notes: null },
      { event: "Early voting ends", date: "2026-11-01", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 6 AM - 9 PM" },
    ],

    notes: [
      "New York adopted no-excuse absentee voting.",
      "Polls are open 6 AM - 9 PM, longer than most states.",
    ],
  },

  georgia: {
    state_name: "Georgia",
    state_abbr: "GA",
    source_url: "https://sos.ga.gov/elections-division",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-06",
      by_mail_deadline: "2026-10-06",
      in_person_deadline: "2026-10-06",
      same_day_registration: false,
      same_day_notes: null,
      registration_url: "https://registertovote.sos.ga.gov/",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-12",
      early_voting_end: "2026-10-30",
      no_excuse_absentee: true,
      absentee_request_deadline: "2026-10-24",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: true,
      strict_photo_id: true,
      accepted_forms: [
        "Georgia driver's license (even if expired)",
        "Georgia voter ID card (free from county registrar)",
        "U.S. passport",
        "U.S. military ID",
        "Government employee photo ID",
        "Tribal photo ID",
      ],
      no_id_fallback:
        "You may cast a provisional ballot and return with acceptable ID within three business days.",
      details_url: "https://sos.ga.gov/voter-id",
    },

    polling: {
      hours: "7:00 AM - 7:00 PM",
      lookup_url: "https://mvp.sos.ga.gov/s/",
    },

    key_dates: [
      { event: "Registration deadline", date: "2026-10-06", notes: null },
      { event: "Early voting begins", date: "2026-10-12", notes: "Minimum 17 days of early voting" },
      { event: "Absentee ballot request deadline", date: "2026-10-24", notes: null },
      { event: "Early voting ends", date: "2026-10-30", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 7 AM - 7 PM" },
    ],

    notes: [
      "Georgia requires a photo ID to vote in person.",
      "Free voter ID cards are available from any county registrar's office.",
      "Georgia has mandatory minimum 17 days of early voting including two Saturdays.",
    ],
  },

  pennsylvania: {
    state_name: "Pennsylvania",
    state_abbr: "PA",
    source_url: "https://www.vote.pa.gov/",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-20",
      by_mail_deadline: "2026-10-20",
      in_person_deadline: "2026-10-20",
      same_day_registration: false,
      same_day_notes: null,
      registration_url: "https://www.vote.pa.gov/Register-to-Vote/",
    },

    voting_methods: {
      early_voting: false,
      early_voting_start: null,
      early_voting_end: null,
      no_excuse_absentee: true,
      absentee_request_deadline: "2026-10-28",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: false,
      strict_photo_id: false,
      accepted_forms: [
        "ID required only for first-time voters at a new polling place",
        "PennDOT driver's license or ID",
        "U.S. passport",
        "Military ID",
        "Student ID",
        "Employee ID",
      ],
      no_id_fallback:
        "Returning voters at their regular polling place generally do not need to show ID.",
      details_url: "https://www.vote.pa.gov/Register-to-Vote/Pages/Voter-ID-for-First-Time-Voters.aspx",
    },

    polling: {
      hours: "7:00 AM - 8:00 PM",
      lookup_url: "https://www.pavoterservices.pa.gov/Pages/PollingPlaceInfo.aspx",
    },

    key_dates: [
      { event: "Registration deadline", date: "2026-10-20", notes: null },
      { event: "Mail-in ballot application deadline", date: "2026-10-28", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 7 AM - 8 PM" },
      { event: "Mail ballot return deadline", date: "2026-11-03", notes: "Must be received by 8 PM on Election Day" },
    ],

    notes: [
      "Pennsylvania does not have traditional early voting.",
      "No-excuse mail-in voting is available — you can apply for and return your ballot at your county election office before Election Day.",
      "Mail ballots must be received by 8 PM on Election Day (not just postmarked).",
    ],
  },

  arizona: {
    state_name: "Arizona",
    state_abbr: "AZ",
    source_url: "https://azsos.gov/elections",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-05",
      by_mail_deadline: "2026-10-05",
      in_person_deadline: "2026-10-05",
      same_day_registration: false,
      same_day_notes: null,
      registration_url: "https://azsos.gov/elections/voting-election/register-vote-or-update-your-current-voter-information",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-07",
      early_voting_end: "2026-10-30",
      no_excuse_absentee: true,
      absentee_request_deadline: "2026-10-23",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: true,
      strict_photo_id: true,
      accepted_forms: [
        "Arizona driver's license",
        "Arizona non-operating ID",
        "Tribal enrollment card or tribal ID",
        "U.S. federal, state, or local government-issued ID",
        "Two forms of non-photo ID (utility bill + bank statement)",
      ],
      no_id_fallback:
        "You may cast a provisional ballot. Contact your county recorder to resolve within 5 business days.",
      details_url: "https://azsos.gov/elections/voting-election",
    },

    polling: {
      hours: "6:00 AM - 7:00 PM",
      lookup_url: "https://my.arizona.vote/WhereToVote.aspx",
    },

    key_dates: [
      { event: "Registration deadline", date: "2026-10-05", notes: null },
      { event: "Early voting / mail ballots begin", date: "2026-10-07", notes: null },
      { event: "Absentee ballot request deadline", date: "2026-10-23", notes: null },
      { event: "Early voting ends", date: "2026-10-30", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 6 AM - 7 PM" },
    ],

    notes: [
      "Arizona voters on the Active Early Voting List (AEVL) automatically receive a mail ballot.",
      "Photo ID or two non-photo IDs required to vote in person.",
    ],
  },

  michigan: {
    state_name: "Michigan",
    state_abbr: "MI",
    source_url: "https://mvic.sos.state.mi.us/",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-19",
      by_mail_deadline: "2026-10-19",
      in_person_deadline: "2026-11-03",
      same_day_registration: true,
      same_day_notes:
        "Michigan offers same-day registration at your local clerk's office through Election Day. You must register in person with proof of residency.",
      registration_url: "https://mvic.sos.state.mi.us/RegisterVoter",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-24",
      early_voting_end: "2026-11-02",
      no_excuse_absentee: true,
      absentee_request_deadline: "2026-10-30",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: true,
      strict_photo_id: false,
      accepted_forms: [
        "Michigan driver's license or state ID",
        "Federal or state government-issued photo ID",
        "U.S. passport",
        "Military ID",
        "Student ID from a Michigan college/university",
        "Tribal ID with photo",
      ],
      no_id_fallback:
        "If you don't have photo ID, you may sign an affidavit and vote a regular ballot.",
      details_url: "https://mvic.sos.state.mi.us/",
    },

    polling: {
      hours: "7:00 AM - 8:00 PM",
      lookup_url: "https://mvic.sos.state.mi.us/Voter/Index",
    },

    key_dates: [
      { event: "Registration deadline (online/mail)", date: "2026-10-19", notes: null },
      { event: "Same-day registration opens", date: "2026-10-20", notes: "At local clerk's office through Election Day" },
      { event: "Early voting begins", date: "2026-10-24", notes: "9 days of in-person early voting" },
      { event: "Absentee ballot request deadline", date: "2026-10-30", notes: null },
      { event: "Early voting ends", date: "2026-11-02", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 7 AM - 8 PM" },
    ],

    notes: [
      "Michigan adopted same-day registration, early voting, and no-excuse absentee voting via constitutional amendment.",
      "All Michigan voters now have 9 days of in-person early voting.",
    ],
  },

  ohio: {
    state_name: "Ohio",
    state_abbr: "OH",
    source_url: "https://www.ohiosos.gov/elections-voting/",
    source_tier: "official_government",
    updated_at: "2026-03-15",
    election_cycle: "2026-midterm",

    registration: {
      online: true,
      online_deadline: "2026-10-06",
      by_mail_deadline: "2026-10-06",
      in_person_deadline: "2026-10-06",
      same_day_registration: false,
      same_day_notes: null,
      registration_url: "https://www.ohiosos.gov/elections-voting/register-to-vote/",
    },

    voting_methods: {
      early_voting: true,
      early_voting_start: "2026-10-07",
      early_voting_end: "2026-11-02",
      no_excuse_absentee: true,
      absentee_request_deadline: "2026-10-31",
      absentee_return_deadline: "2026-11-03",
      all_mail_election: false,
      in_person_election_day: true,
    },

    voter_id: {
      required: true,
      strict_photo_id: true,
      accepted_forms: [
        "Ohio driver's license or state ID",
        "U.S. passport",
        "U.S. military ID",
        "Ohio National Guard ID",
      ],
      no_id_fallback:
        "You may cast a provisional ballot if you lack acceptable photo ID.",
      details_url: "https://www.ohiosos.gov/elections-voting/voter-id/",
    },

    polling: {
      hours: "6:30 AM - 7:30 PM",
      lookup_url: "https://voterlookup.ohiosos.gov/voterlookup.aspx",
    },

    key_dates: [
      { event: "Registration deadline", date: "2026-10-06", notes: null },
      { event: "Early voting begins", date: "2026-10-07", notes: "At county board of elections" },
      { event: "Absentee ballot request deadline", date: "2026-10-31", notes: null },
      { event: "Early voting ends", date: "2026-11-02", notes: null },
      { event: "Election Day", date: "2026-11-03", notes: "Polls open 6:30 AM - 7:30 PM" },
    ],

    notes: [
      "Ohio requires photo ID to vote — the rules changed in 2023.",
      "Early in-person voting is available at your county board of elections.",
    ],
  },
}

// --- Lookup Functions ---

// Normalize a state input to a data key (lowercase, underscored).
function normalizeStateKey(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, "_")
}

// Look up election data for a state. Accepts state name, abbreviation, or key.
export function getStateElectionData(
  stateInput: string
): StateElectionData | null {
  const key = normalizeStateKey(stateInput)

  // Direct key match
  if (STATE_CIVIC_DATA[key]) return STATE_CIVIC_DATA[key]

  // Try abbreviation match
  const byAbbr = Object.values(STATE_CIVIC_DATA).find(
    (s) => s.state_abbr.toLowerCase() === key
  )
  if (byAbbr) return byAbbr

  // Try full name match
  const byName = Object.values(STATE_CIVIC_DATA).find(
    (s) => normalizeStateKey(s.state_name) === key
  )
  if (byName) return byName

  return null
}

// Get upcoming deadlines for a state relative to a given date.
export function getUpcomingDeadlines(
  stateInput: string,
  asOfDate?: string
): Array<{ event: string; date: string; days_until: number; notes: string | null }> {
  const data = getStateElectionData(stateInput)
  if (!data) return []

  const now = asOfDate ? new Date(asOfDate) : new Date()

  return data.key_dates
    .map((d) => {
      const deadlineDate = new Date(d.date)
      const diffMs = deadlineDate.getTime() - now.getTime()
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return { ...d, days_until: daysUntil }
    })
    .filter((d) => d.days_until >= 0)
    .sort((a, b) => a.days_until - b.days_until)
}

// Build a retrieval context string for injection into the developer prompt.
// This is the key function that bridges civic data → prompt grounding.
export function buildCivicDataContext(stateInput: string): string | null {
  const data = getStateElectionData(stateInput)
  if (!data) return null

  const deadlines = getUpcomingDeadlines(stateInput)

  let context = `
RETRIEVED CIVIC DATA — ${data.state_name} (${data.state_abbr})
Source: ${data.source_url} (${data.source_tier})
Updated: ${data.updated_at}
Election Cycle: ${data.election_cycle}

REGISTRATION:
- Online registration: ${data.registration.online ? "Yes" : "No"}
- Online/mail deadline: ${data.registration.online_deadline ?? data.registration.by_mail_deadline ?? "N/A"}
- In-person deadline: ${data.registration.in_person_deadline ?? "N/A"}
- Same-day registration: ${data.registration.same_day_registration ? "Yes" : "No"}${data.registration.same_day_notes ? ` — ${data.registration.same_day_notes}` : ""}
- Registration URL: ${data.registration.registration_url}

VOTING METHODS:
- Early voting: ${data.voting_methods.early_voting ? `Yes (${data.voting_methods.early_voting_start} to ${data.voting_methods.early_voting_end})` : "No"}
- No-excuse absentee/mail: ${data.voting_methods.no_excuse_absentee ? "Yes" : "No (excuse required)"}${data.voting_methods.absentee_request_deadline ? `\n- Absentee request deadline: ${data.voting_methods.absentee_request_deadline}` : ""}
- All-mail election: ${data.voting_methods.all_mail_election ? "Yes" : "No"}
- In-person Election Day: ${data.voting_methods.in_person_election_day ? "Yes" : "No"}

VOTER ID:
- ID required: ${data.voter_id.required ? "Yes" : "No"}
- Strict photo ID: ${data.voter_id.strict_photo_id ? "Yes" : "No"}
- Accepted forms: ${data.voter_id.accepted_forms.join("; ")}
- No-ID fallback: ${data.voter_id.no_id_fallback ?? "N/A"}
- Details: ${data.voter_id.details_url}

POLLING:
- Hours: ${data.polling.hours}
- Lookup: ${data.polling.lookup_url}
`.trim()

  if (deadlines.length > 0) {
    context += "\n\nUPCOMING DEADLINES:"
    for (const d of deadlines) {
      context += `\n- ${d.event}: ${d.date} (${d.days_until} days away)${d.notes ? ` — ${d.notes}` : ""}`
    }
  }

  if (data.notes.length > 0) {
    context += "\n\nSTATE-SPECIFIC NOTES:"
    for (const note of data.notes) {
      context += `\n- ${note}`
    }
  }

  context += `\n\nINSTRUCTION: Use this retrieved data as ground truth for ${data.state_name}. Cite the source URL. If the user's question requires information not covered here, say so and recommend they check the official source directly.`

  return context
}

// Get all available states (for UI dropdowns, validation, etc.).
export function getAvailableStates(): Array<{
  key: string
  name: string
  abbr: string
}> {
  return Object.entries(STATE_CIVIC_DATA).map(([key, data]) => ({
    key,
    name: data.state_name,
    abbr: data.state_abbr,
  }))
}
