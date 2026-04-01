"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { BillCard } from "@/components/bill-card"
import type { DBBill } from "@/lib/db"
import { Search, RefreshCw, Loader2 } from "lucide-react"

type LevelFilter = "all" | "federal" | "state" | "local"

const levelFilters: { label: string; value: LevelFilter }[] = [
  { label: "All", value: "all" },
  { label: "Federal", value: "federal" },
  { label: "State", value: "state" },
  { label: "Local", value: "local" },
]

interface BillsResponse {
  success: boolean
  bills: DBBill[]
  counts: {
    federal: number
    state: number
    local: number
    total: number
  }
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

function LegislationTrackerContent() {
  const [bills, setBills] = useState<DBBill[]>([])
  const [counts, setCounts] = useState({ federal: 0, state: 0, local: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<LevelFilter>("all")
  const [trackedBills, setTrackedBills] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBills = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (activeFilter !== "all") params.set("level", activeFilter)
      if (searchQuery) params.set("search", searchQuery)
      
      const response = await fetch(`/api/bills?${params.toString()}`)
      const data: BillsResponse = await response.json()
      
      if (data.success) {
        setBills(data.bills)
        setCounts(data.counts)
      } else {
        setError("Failed to fetch bills")
      }
    } catch (err) {
      console.error("[v0] Error fetching bills:", err)
      setError("Failed to load bills. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [activeFilter, searchQuery])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "") {
        fetchBills()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchBills])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // Sync federal bills
      await fetch("/api/sync-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "legiscan", state: "US" }),
      })
      
      // Refresh the list
      await fetchBills()
    } catch (err) {
      console.error("[v0] Error syncing bills:", err)
      setError("Failed to sync bills. Check your API keys.")
    } finally {
      setIsSyncing(false)
    }
  }

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
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Legislation <span className="text-primary">Tracker</span>
              </h1>
              <p className="mt-3 text-muted-foreground">
                Browse and track bills at the federal, state, and local level.
              </p>
            </div>
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              className="gap-2 self-start"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isSyncing ? "Syncing..." : "Sync Bills"}
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-2xl font-bold text-foreground">{counts.total}</p>
              <p className="text-sm text-muted-foreground">Total Bills</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-2xl font-bold text-blue-400">{counts.federal}</p>
              <p className="text-sm text-muted-foreground">Federal</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-2xl font-bold text-purple-400">{counts.state}</p>
              <p className="text-sm text-muted-foreground">State</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-2xl font-bold text-orange-400">{counts.local}</p>
              <p className="text-sm text-muted-foreground">Local</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search bills by title, keywords, or sponsor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {levelFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeFilter === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {filter.label}
                  {filter.value === "federal" && counts.federal > 0 && (
                    <span className="ml-1.5 text-xs opacity-70">({counts.federal})</span>
                  )}
                  {filter.value === "state" && counts.state > 0 && (
                    <span className="ml-1.5 text-xs opacity-70">({counts.state})</span>
                  )}
                  {filter.value === "local" && counts.local > 0 && (
                    <span className="ml-1.5 text-xs opacity-70">({counts.local})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {bills.length} {bills.length === 1 ? "bill" : "bills"}
                  {activeFilter !== "all" && ` in ${activeFilter}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Bills Grid */}
              {bills.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {bills.map((bill) => (
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
                  <p className="text-muted-foreground">
                    {counts.total === 0
                      ? "No bills in the database yet. Click 'Sync Bills' to fetch legislation data."
                      : "No bills found matching your criteria."}
                  </p>
                  {counts.total > 0 && (
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setActiveFilter("all")
                      }}
                      className="mt-4 text-sm text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <TrackerClient
          bills={billsForClient}
          isLoggedIn={!!session?.user?.email}
        />
      </div>
    </main>
  )
}
