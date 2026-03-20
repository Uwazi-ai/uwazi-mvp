import { auth } from "@/auth"
import { sql } from "@/lib/db"
import TrackerClient from "./TrackerClient"

export default async function LegislationTrackerPage() {
  const session = await auth()

  const bills = await sql`
    select id, bill_number, title, jurisdiction, status, summary_plain
    from bills
    order by updated_at desc
  `

  const billsForClient = bills.map((b) => ({
    id: b.id,
    bill_number: b.bill_number,
    title: b.title,
    jurisdiction: b.jurisdiction,
    status: b.status,
    summary_plain: b.summary_plain ?? "",
  }))

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-heading text-5xl">Legislation Tracker</h1>
          <p className="mt-3 text-white/70">
            Track bills and understand what they actually mean.
          </p>
        </div>

        <TrackerClient
          bills={billsForClient}
          isLoggedIn={!!session?.user?.email}
        />
      </div>
    </main>
  )
}
