import { NextResponse } from "next/server"
import { upsertBills } from "@/lib/db"

const sampleBills = [
  {
    bill_id: "HR-1234",
    title: "Housing Stability Act of 2026",
    summary: "Would expand tenant protections and require clearer notice periods for evictions. Includes provisions for emergency rental assistance and anti-retaliation measures for tenants.",
    status: "In Committee",
    level: "federal" as const,
    state: null,
    chamber: "House",
    introduced_date: "2026-01-15",
    last_action: "Referred to House Committee on Financial Services",
    last_action_date: "2026-01-20",
    sponsor: "Rep. Alexandria Ocasio-Cortez [D-NY-14]",
    topics: ["Housing", "Tenant Rights", "Rental Assistance"],
    url: "https://congress.gov/bill/119th-congress/house-bill/1234",
    source: "congress",
    raw_data: null,
  },
  {
    bill_id: "S-567",
    title: "Community Safety Reporting Act",
    summary: "Would require expanded public reporting on safety funding and outcomes. Mandates annual transparency reports from law enforcement agencies receiving federal funding.",
    status: "Passed Senate",
    level: "federal" as const,
    state: null,
    chamber: "Senate",
    introduced_date: "2026-02-01",
    last_action: "Passed Senate by unanimous consent",
    last_action_date: "2026-03-15",
    sponsor: "Sen. Cory Booker [D-NJ]",
    topics: ["Public Safety", "Transparency", "Law Enforcement"],
    url: "https://congress.gov/bill/119th-congress/senate-bill/567",
    source: "congress",
    raw_data: null,
  },
  {
    bill_id: "CA-AB-2024",
    title: "California Clean Energy Jobs Act",
    summary: "Creates a state fund for clean energy workforce development and training programs. Targets 100,000 new green jobs by 2030 with focus on disadvantaged communities.",
    status: "Passed Assembly",
    level: "state" as const,
    state: "CA",
    chamber: "Assembly",
    introduced_date: "2026-01-10",
    last_action: "Passed Assembly, sent to Senate",
    last_action_date: "2026-03-01",
    sponsor: "Asm. Buffy Wicks [D-14]",
    topics: ["Clean Energy", "Jobs", "Workforce Development"],
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB2024",
    source: "legiscan",
    raw_data: null,
  },
  {
    bill_id: "TX-HB-445",
    title: "Texas Property Tax Relief Act",
    summary: "Provides property tax exemptions for seniors and disabled veterans. Increases homestead exemption from $40,000 to $100,000 for qualifying residents.",
    status: "In Committee",
    level: "state" as const,
    state: "TX",
    chamber: "House",
    introduced_date: "2026-01-20",
    last_action: "Referred to Ways and Means Committee",
    last_action_date: "2026-01-25",
    sponsor: "Rep. Morgan Meyer [R-108]",
    topics: ["Property Tax", "Tax Relief", "Veterans"],
    url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB445",
    source: "legiscan",
    raw_data: null,
  },
  {
    bill_id: "NY-S-1001",
    title: "New York Tenant Protection Act",
    summary: "Strengthens rent stabilization laws and limits security deposits to one month rent. Expands right to counsel for tenants facing eviction proceedings.",
    status: "Introduced",
    level: "state" as const,
    state: "NY",
    chamber: "Senate",
    introduced_date: "2026-02-10",
    last_action: "Introduced and referred to Housing Committee",
    last_action_date: "2026-02-10",
    sponsor: "Sen. Brian Kavanagh [D-27]",
    topics: ["Housing", "Tenant Rights", "Rent Stabilization"],
    url: "https://www.nysenate.gov/legislation/bills/2025/S1001",
    source: "legiscan",
    raw_data: null,
  },
  {
    bill_id: "HR-789",
    title: "Digital Privacy Rights Act",
    summary: "Establishes comprehensive data privacy protections for consumers. Requires explicit consent for data collection and gives users the right to delete personal information.",
    status: "In Committee",
    level: "federal" as const,
    state: null,
    chamber: "House",
    introduced_date: "2026-02-15",
    last_action: "Referred to Energy and Commerce Committee",
    last_action_date: "2026-02-20",
    sponsor: "Rep. Anna Eshoo [D-CA-16]",
    topics: ["Privacy", "Data Protection", "Consumer Rights"],
    url: "https://congress.gov/bill/119th-congress/house-bill/789",
    source: "congress",
    raw_data: null,
  },
  {
    bill_id: "FL-SB-234",
    title: "Florida Healthcare Access Act",
    summary: "Expands Medicaid eligibility and creates subsidies for health insurance premiums for low-income residents not qualifying for federal assistance.",
    status: "In Committee",
    level: "state" as const,
    state: "FL",
    chamber: "Senate",
    introduced_date: "2026-01-25",
    last_action: "Referred to Health Policy Committee",
    last_action_date: "2026-02-01",
    sponsor: "Sen. Jason Pizzo [D-37]",
    topics: ["Healthcare", "Medicaid", "Insurance"],
    url: "https://flsenate.gov/Session/Bill/2026/234",
    source: "legiscan",
    raw_data: null,
  },
]

export async function POST() {
  try {
    const count = await upsertBills(sampleBills)
    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${count} bills`,
      count 
    })
  } catch (error) {
    console.error("[v0] Error seeding bills:", error)
    return NextResponse.json(
      { success: false, error: "Failed to seed bills" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "POST to this endpoint to seed sample bills into the database" 
  })
}
