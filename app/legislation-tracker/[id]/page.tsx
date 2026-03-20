import { auth } from "@/auth"
import { sql } from "@/lib/db"
import Link from "next/link"
import BillDetailClient from "./BillDetailClient"

type Props = {
  params: Promise<{ id: string }>
}

export default async function BillDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const [bill] = await sql`
    select id, bill_number, title, jurisdiction, status, summary_plain, source_url
    from bills
    where id = ${id}
  `

  if (!bill) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="font-heading text-3xl">Bill not found</h1>
          <p className="mt-3 text-white/70">
            The bill you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/legislation-tracker"
            className="mt-6 inline-block rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
          >
            Back to Legislation Tracker
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/legislation-tracker"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          ← Back to Legislation Tracker
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
              {bill.jurisdiction}
            </span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
              {bill.status}
            </span>
          </div>
          <p className="mt-3 text-lg font-medium text-[#9bd34b]">
            {bill.bill_number}
          </p>
          <h1 className="mt-2 font-heading text-3xl">{bill.title}</h1>

          <div className="mt-6">
            <h2 className="font-heading text-xl text-[#9bd34b]">Summary</h2>
            <p className="mt-2 text-white/90">
              {bill.summary_plain ?? "No summary available."}
            </p>
          </div>

          <BillDetailClient
            bill={{
              id: bill.id,
              bill_number: bill.bill_number,
              title: bill.title,
              source_url: bill.source_url,
            }}
            isLoggedIn={!!session?.user?.email}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-heading text-xl text-[#9bd34b]">
            Have questions about this bill?
          </h2>
          <p className="mt-2 text-white/80">
            Ask Uwazi to explain what this legislation means for you in plain
            English.
          </p>
          <Link
            href={`/ask-uwazi?q=Explain ${bill.bill_number} ${bill.title}`}
            className="mt-4 inline-block rounded-xl bg-[#9bd34b] px-4 py-2 font-semibold text-black hover:bg-[#9bd34b]/90"
          >
            Ask Uwazi about this bill
          </Link>
        </div>
      </div>
    </main>
  )
}
