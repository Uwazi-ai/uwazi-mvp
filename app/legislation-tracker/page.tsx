"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { BillCard } from "@/components/bill-card"
import { mockBills, type Bill } from "@/lib/mock-data"
import { Search } from "lucide-react"

type JurisdictionFilter = "All" | Bill["jurisdiction"]

const jurisdictionFilters: JurisdictionFilter[] = ["All", "Federal", "State", "Local"]

function LegislationTrackerContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<JurisdictionFilter>("All")
  const [trackedBills, setTrackedBills] = useState<Set<string>>(new Set())

  const filteredBills = useMemo(() => {
    return mockBills.filter((bill) => {
      const matchesSearch =
        bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.summary.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter = activeFilter === "All" || bill.jurisdiction === activeFilter

      return matchesSearch && matchesFilter
    })
  }, [searchQuery, activeFilter])

  const handleTrack = (billId: string) => {
    setTrackedBills((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(billId)) {
        newSet.delete(billId)
      } else {
        newSet.add(billId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Legislation <span className="text-primary">Tracker</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Browse and track bills at the federal, state, and local level.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search bills by title, number, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {jurisdictionFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredBills.length} {filteredBills.length === 1 ? "bill" : "bills"}
              {activeFilter !== "All" && ` in ${activeFilter}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Bills Grid */}
          {filteredBills.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onTrack={handleTrack}
                  isTracked={trackedBills.has(bill.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card py-12 text-center">
              <p className="text-muted-foreground">No bills found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setActiveFilter("All")
                }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function LegislationTrackerPage() {
  return (
    <Providers>
      <LegislationTrackerContent />
    </Providers>
  )
}
