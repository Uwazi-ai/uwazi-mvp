"use client"

import { useRouter } from "next/navigation"

type BillDetailClientProps = {
  bill: {
    id: string
    bill_number: string
    title: string
    source_url: string | null
  }
  isLoggedIn: boolean
}

export default function BillDetailClient({
  bill,
  isLoggedIn,
}: BillDetailClientProps) {
  const router = useRouter()

  async function handleTrack() {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    await fetch("/api/track-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billId: bill.id }),
    })
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
      <button
        onClick={handleTrack}
        className="rounded-xl border border-[#9bd34b] px-4 py-2 text-[#9bd34b] hover:bg-[#9bd34b]/10"
      >
        Track Bill
      </button>
      {bill.source_url && (
        <a
          href={bill.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#9bd34b] px-4 py-2 font-semibold text-black hover:bg-[#9bd34b]/90"
        >
          View Source
        </a>
      )}
    </div>
  )
}
