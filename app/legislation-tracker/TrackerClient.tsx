"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type Bill = {
  id: string
  bill_number: string
  title: string
  jurisdiction: string
  status: string
  summary_plain: string
}

export default function TrackerClient({
  bills,
  isLoggedIn,
}: {
  bills: Bill[]
  isLoggedIn: boolean
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("All")
  const router = useRouter()

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesQuery =
        bill.title.toLowerCase().includes(query.toLowerCase()) ||
        bill.bill_number.toLowerCase().includes(query.toLowerCase()) ||
        bill.summary_plain.toLowerCase().includes(query.toLowerCase())

      const matchesFilter =
        filter === "All" ? true : bill.jurisdiction === filter

      return matchesQuery && matchesFilter
    })
  }, [bills, query, filter])

  async function handleTrackBill(billId: string) {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    await fetch("/api/track-bill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ billId }),
    })
  }

  return (
    <div className="space-y-6">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search legislation..."
        className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {["All", "Federal", "State", "Local"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full border px-4 py-2 ${
              filter === item
                ? "border-[#9bd34b] bg-[#9bd34b] text-black"
                : "border-white/10 text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredBills.map((bill) => (
          <div
            key={bill.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <p className="text-sm text-white/60">
              {bill.bill_number} • {bill.jurisdiction}
            </p>
            <h3 className="mt-1 font-heading text-2xl">{bill.title}</h3>
            <p className="mt-3 text-white/80">{bill.summary_plain}</p>
            <p className="mt-3 text-sm text-[#9bd34b]">Status: {bill.status}</p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => router.push(`/legislation-tracker/${bill.id}`)}
                className="rounded-xl bg-[#9bd34b] px-4 py-2 font-semibold text-black"
              >
                View Bill
              </button>
              <button
                onClick={() => handleTrackBill(bill.id)}
                className="rounded-xl border border-[#9bd34b] px-4 py-2 text-[#9bd34b]"
              >
                Track Bill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
