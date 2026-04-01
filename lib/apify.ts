"use server"

import { ApifyClient } from "apify-client"

// Initialize Apify client
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
})

// LegiScan API base URL
const LEGISCAN_API_BASE = "https://api.legiscan.com"

export interface Bill {
  bill_id: string
  title: string
  summary: string | null
  status: string | null
  level: "federal" | "state" | "local"
  state: string | null
  chamber: string | null
  introduced_date: string | null
  last_action: string | null
  last_action_date: string | null
  sponsor: string | null
  topics: string[]
  url: string | null
  source: string
  raw_data: Record<string, unknown>
}

// Map LegiScan status codes to human-readable status
const STATUS_MAP: Record<number, string> = {
  1: "Introduced",
  2: "Engrossed",
  3: "Enrolled",
  4: "Passed",
  5: "Vetoed",
  6: "Failed",
}

// Map state abbreviations
const STATE_MAP: Record<number, string> = {
  1: "AL", 2: "AK", 3: "AZ", 4: "AR", 5: "CA", 6: "CO", 7: "CT", 8: "DE",
  9: "FL", 10: "GA", 11: "HI", 12: "ID", 13: "IL", 14: "IN", 15: "IA",
  16: "KS", 17: "KY", 18: "LA", 19: "ME", 20: "MD", 21: "MA", 22: "MI",
  23: "MN", 24: "MS", 25: "MO", 26: "MT", 27: "NE", 28: "NV", 29: "NH",
  30: "NJ", 31: "NM", 32: "NY", 33: "NC", 34: "ND", 35: "OH", 36: "OK",
  37: "OR", 38: "PA", 39: "RI", 40: "SC", 41: "SD", 42: "TN", 43: "TX",
  44: "UT", 45: "VT", 46: "VA", 47: "WA", 48: "WV", 49: "WI", 50: "WY",
  51: "DC", 52: "US", // US = Federal
}

/**
 * Fetch bills from LegiScan API directly
 * LegiScan provides both federal and state legislation data
 */
export async function fetchLegiScanBills(options: {
  state?: string // State abbreviation (e.g., "CA", "NY") or "US" for federal
  query?: string // Search query
  year?: number // Session year
}): Promise<Bill[]> {
  const { state = "US", query, year = new Date().getFullYear() } = options

  const apiKey = process.env.LEGISCAN_API_KEY
  if (!apiKey) {
    throw new Error("LEGISCAN_API_KEY is not configured")
  }

  const bills: Bill[] = []

  try {
    // First, get the master list of bills for the state/session
    const masterListUrl = `${LEGISCAN_API_BASE}/?key=${apiKey}&op=getMasterList&state=${state}`
    const masterResponse = await fetch(masterListUrl)
    const masterData = await masterResponse.json()

    if (masterData.status !== "OK") {
      console.error("[v0] LegiScan API error:", masterData)
      return bills
    }

    const masterList = masterData.masterlist || {}
    const sessionInfo = masterList.session || {}
    
    // Get bill details for each bill in the master list
    const billIds = Object.keys(masterList).filter(key => key !== "session")
    
    // Limit to first 50 bills to avoid rate limits
    const limitedBillIds = billIds.slice(0, 50)

    for (const billKey of limitedBillIds) {
      const billInfo = masterList[billKey]
      
      // If query provided, filter by title
      if (query && !billInfo.title?.toLowerCase().includes(query.toLowerCase())) {
        continue
      }

      // Get full bill details
      const billUrl = `${LEGISCAN_API_BASE}/?key=${apiKey}&op=getBill&id=${billInfo.bill_id}`
      const billResponse = await fetch(billUrl)
      const billData = await billResponse.json()

      if (billData.status === "OK" && billData.bill) {
        const bill = billData.bill
        
        bills.push({
          bill_id: `legiscan-${bill.bill_id}`,
          title: bill.title || billInfo.title,
          summary: bill.description || null,
          status: STATUS_MAP[bill.status] || bill.status_desc || "Unknown",
          level: state === "US" ? "federal" : "state",
          state: state === "US" ? null : state,
          chamber: bill.body || null,
          introduced_date: bill.introduced_date || null,
          last_action: bill.last_action || null,
          last_action_date: bill.last_action_date || null,
          sponsor: bill.sponsors?.[0]?.name || null,
          topics: bill.subjects?.map((s: { subject_name: string }) => s.subject_name) || [],
          url: bill.url || bill.state_link || null,
          source: "legiscan",
          raw_data: bill,
        })
      }

      // Rate limiting - LegiScan allows 30k requests/month
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return bills
  } catch (error) {
    console.error("[v0] Error fetching from LegiScan:", error)
    throw error
  }
}

/**
 * Fetch federal bills from Congress.gov using Apify web scraper
 */
export async function fetchCongressGovBills(options: {
  congress?: number // Congress number (e.g., 118 for 118th Congress)
  chamber?: "house" | "senate" | "both"
  limit?: number
}): Promise<Bill[]> {
  const { congress = 118, chamber = "both", limit = 50 } = options

  if (!process.env.APIFY_API_TOKEN) {
    throw new Error("APIFY_API_TOKEN is not configured")
  }

  const bills: Bill[] = []

  try {
    // Use Apify's web scraper actor to scrape Congress.gov
    const run = await apifyClient.actor("apify/web-scraper").call({
      startUrls: [
        { url: `https://www.congress.gov/search?q=%7B%22congress%22%3A%22${congress}%22%2C%22source%22%3A%22legislation%22%7D&pageSize=${limit}` }
      ],
      linkSelector: "a.result-heading",
      pageFunction: `
        async function pageFunction(context) {
          const { $, request, log } = context;
          
          // If this is a bill detail page
          if (request.url.includes('/bill/')) {
            const title = $('h1.legDetail').text().trim();
            const summary = $('.overview-summary').text().trim();
            const status = $('.overview-status-text').text().trim();
            const sponsor = $('.overview-sponsor a').first().text().trim();
            const introduced = $('.overview-date').first().text().trim();
            
            return {
              url: request.url,
              title,
              summary,
              status,
              sponsor,
              introduced,
              bill_id: request.url.split('/bill/')[1]?.split('/')[1] || '',
            };
          }
          
          return null;
        }
      `,
      maxPagesPerCrawl: limit,
      maxConcurrency: 5,
    })

    // Get results from the dataset
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems()

    for (const item of items) {
      if (item && item.title) {
        bills.push({
          bill_id: `congress-${item.bill_id || Date.now()}`,
          title: item.title as string,
          summary: (item.summary as string) || null,
          status: (item.status as string) || "Unknown",
          level: "federal",
          state: null,
          chamber: (item.url as string)?.includes("/house-bill/") ? "House" : "Senate",
          introduced_date: (item.introduced as string) || null,
          last_action: null,
          last_action_date: null,
          sponsor: (item.sponsor as string) || null,
          topics: [],
          url: item.url as string,
          source: "congress.gov",
          raw_data: item as Record<string, unknown>,
        })
      }
    }

    return bills
  } catch (error) {
    console.error("[v0] Error fetching from Congress.gov via Apify:", error)
    throw error
  }
}

/**
 * Search bills using LegiScan search API
 */
export async function searchBills(query: string, options?: {
  state?: string
  year?: number
}): Promise<Bill[]> {
  const { state, year = new Date().getFullYear() } = options || {}

  const apiKey = process.env.LEGISCAN_API_KEY
  if (!apiKey) {
    throw new Error("LEGISCAN_API_KEY is not configured")
  }

  const bills: Bill[] = []

  try {
    let searchUrl = `${LEGISCAN_API_BASE}/?key=${apiKey}&op=search&query=${encodeURIComponent(query)}`
    if (state) searchUrl += `&state=${state}`
    if (year) searchUrl += `&year=${year}`

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("[v0] LegiScan search error:", data)
      return bills
    }

    const searchResults = data.searchresult || {}
    
    // Get first 20 results
    const resultKeys = Object.keys(searchResults)
      .filter(key => key !== "summary")
      .slice(0, 20)

    for (const key of resultKeys) {
      const result = searchResults[key]
      
      bills.push({
        bill_id: `legiscan-${result.bill_id}`,
        title: result.title,
        summary: result.text_url ? null : result.title, // Will fetch full summary later if needed
        status: result.last_action || "Unknown",
        level: result.state === "US" ? "federal" : "state",
        state: result.state === "US" ? null : result.state,
        chamber: null,
        introduced_date: null,
        last_action: result.last_action,
        last_action_date: result.last_action_date,
        sponsor: null,
        topics: [],
        url: result.url,
        source: "legiscan",
        raw_data: result,
      })
    }

    return bills
  } catch (error) {
    console.error("[v0] Error searching LegiScan:", error)
    throw error
  }
}
