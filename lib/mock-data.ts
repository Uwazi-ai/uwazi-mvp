export interface Bill {
  id: string
  billNumber: string
  title: string
  jurisdiction: "Federal" | "State" | "Local"
  status: "Introduced" | "In Committee" | "Passed House" | "Passed Senate" | "Signed" | "Vetoed"
  summary: string
  sourceUrl: string
  introducedDate: string
}

export interface SavedQuestion {
  id: string
  question: string
  answer: string
  savedAt: string
}

export interface TrackedBill {
  billId: string
  trackedAt: string
}

export const mockBills: Bill[] = [
  {
    id: "1",
    billNumber: "H.R. 2847",
    title: "Community Investment and Opportunity Act",
    jurisdiction: "Federal",
    status: "In Committee",
    summary: "A bill to increase federal investment in underserved communities through grants for small businesses, infrastructure improvements, and workforce development programs.",
    sourceUrl: "https://congress.gov/bill/119th-congress/house-bill/2847",
    introducedDate: "2026-01-15",
  },
  {
    id: "2",
    billNumber: "S.B. 1124",
    title: "Digital Privacy Protection Act",
    jurisdiction: "Federal",
    status: "Passed Senate",
    summary: "Establishes comprehensive data privacy rights for consumers, including the right to access, delete, and opt-out of sale of personal information collected by companies.",
    sourceUrl: "https://congress.gov/bill/119th-congress/senate-bill/1124",
    introducedDate: "2026-02-03",
  },
  {
    id: "3",
    billNumber: "A.B. 445",
    title: "Clean Energy Transition Initiative",
    jurisdiction: "State",
    status: "Introduced",
    summary: "Requires state utilities to achieve 100% renewable energy by 2035 and provides tax incentives for residential solar installation and electric vehicle adoption.",
    sourceUrl: "https://legislature.state.gov/bill/ab445",
    introducedDate: "2026-02-20",
  },
  {
    id: "4",
    billNumber: "Ord. 2026-12",
    title: "Affordable Housing Zoning Amendment",
    jurisdiction: "Local",
    status: "In Committee",
    summary: "Amends city zoning code to allow increased density in transit corridors and requires 15% affordable units in new developments over 20 units.",
    sourceUrl: "https://citycouncil.gov/ordinance-2026-12",
    introducedDate: "2026-03-01",
  },
  {
    id: "5",
    billNumber: "H.R. 3156",
    title: "Healthcare Price Transparency Act",
    jurisdiction: "Federal",
    status: "Introduced",
    summary: "Mandates that hospitals and insurance companies provide clear, upfront pricing for medical procedures and prohibits surprise billing practices.",
    sourceUrl: "https://congress.gov/bill/119th-congress/house-bill/3156",
    introducedDate: "2026-02-28",
  },
  {
    id: "6",
    billNumber: "S.B. 892",
    title: "Public Transit Expansion Fund",
    jurisdiction: "State",
    status: "Passed House",
    summary: "Creates a dedicated fund for expanding public transit systems in metropolitan areas, funded by a small increase in vehicle registration fees.",
    sourceUrl: "https://legislature.state.gov/bill/sb892",
    introducedDate: "2026-01-22",
  },
]

export const examplePrompts = [
  "What does the new housing bill mean for renters?",
  "How will the climate policy affect local businesses?",
  "Explain the healthcare reform in simple terms",
  "What are my rights under the new data privacy law?",
]

export interface UwaziAnswer {
  quickAnswer: string
  plainEnglish: string
  whyItMatters: string
  whatYouCanDo: string
  sourceNote: string
}

export const mockAnswer: UwaziAnswer = {
  quickAnswer: "The Community Investment Act would direct $50 billion to underserved neighborhoods over 5 years, funding small business grants, infrastructure, and job training.",
  plainEnglish: "Think of this like a neighborhood improvement program on a national scale. The government would send money directly to communities that have historically been left behind. Local businesses could apply for grants to expand or start up, roads and public spaces would get upgrades, and job training programs would help residents build new skills.",
  whyItMatters: "If you live or work in an underserved community, this could mean new job opportunities, better infrastructure, and more local businesses. Even if you don't, stronger communities benefit everyone through economic growth and reduced inequality.",
  whatYouCanDo: "Contact your representative to share your opinion on this bill. Attend local town halls where the bill is being discussed. If you own a small business, start researching grant eligibility requirements now.",
  sourceNote: "Based on H.R. 2847 introduced January 15, 2026. Bill text and status available at congress.gov.",
}
