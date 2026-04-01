"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { 
  ArrowLeft, 
  BookmarkPlus, 
  BookmarkCheck,
  ExternalLink, 
  Calendar, 
  User, 
  MapPin,
  Building2,
  FileText,
  Clock,
  Scale,
  Loader2
} from "lucide-react"

interface Bill {
  id: string
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
  topics: string[] | null
  url: string | null
  source: string | null
}

function getStatusColor(status: string | null) {
  if (!status) return "bg-muted text-muted-foreground"
  const s = status.toLowerCase()
  if (s.includes("passed") || s.includes("enacted") || s.includes("signed")) {
    return "bg-primary/20 text-primary border-primary/30"
  }
  if (s.includes("failed") || s.includes("vetoed") || s.includes("dead")) {
    return "bg-destructive/20 text-destructive border-destructive/30"
  }
  if (s.includes("committee") || s.includes("referred")) {
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  }
  return "bg-blue-500/20 text-blue-400 border-blue-500/30"
}

function getLevelColor(level: string) {
  switch (level) {
    case "federal":
      return "bg-blue-500/20 text-blue-400"
    case "state":
      return "bg-purple-500/20 text-purple-400"
    case "local":
      return "bg-orange-500/20 text-orange-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getLevelLabel(level: string, state: string | null) {
  if (level === "federal") return "Federal"
  if (level === "state" && state) return state
  if (level === "local") return "Local"
  return level.charAt(0).toUpperCase() + level.slice(1)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

function LegislationDetailContent() {
  const params = useParams()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTracked, setIsTracked] = useState(false)

  useEffect(() => {
    async function fetchBill() {
      try {
        const response = await fetch(`/api/bills/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Bill not found")
          } else {
            setError("Failed to load bill")
          }
          return
        }
        const data = await response.json()
        setBill(data)
      } catch (err) {
        setError("Failed to load bill")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchBill()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-3xl flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/legislation-tracker"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Legislation Tracker
            </Link>
            <div className="text-center py-20">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Bill Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "The bill you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => router.push("/legislation-tracker")}>
                Browse All Bills
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Back Link */}
          <Link
            href="/legislation-tracker"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Legislation Tracker
          </Link>

          {/* Bill Card */}
          <Card className="border-border bg-card">
            <CardHeader className="space-y-4 border-b border-border">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary">
                  {bill.bill_id}
                </Badge>
                <Badge variant="secondary" className={getLevelColor(bill.level)}>
                  {getLevelLabel(bill.level, bill.state)}
                </Badge>
                {bill.chamber && (
                  <Badge variant="outline">
                    {bill.chamber}
                  </Badge>
                )}
                <Badge variant="secondary" className={getStatusColor(bill.status)}>
                  {bill.status || "Unknown Status"}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {bill.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {bill.sponsor && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{bill.sponsor}</span>
                  </div>
                )}
                {bill.introduced_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Introduced {formatDate(bill.introduced_date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{getLevelLabel(bill.level, bill.state)}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* Summary */}
              {bill.summary && (
                <div>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    Summary
                  </h2>
                  <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {bill.summary}
                  </p>
                </div>
              )}

              {/* Last Action */}
              {bill.last_action && (
                <div>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    Latest Action
                  </h2>
                  <p className="text-muted-foreground">{bill.last_action}</p>
                  {bill.last_action_date && (
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      {formatDate(bill.last_action_date)}
                    </p>
                  )}
                </div>
              )}

              {/* Topics */}
              {bill.topics && bill.topics.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">Topics</h2>
                  <div className="flex flex-wrap gap-2">
                    {bill.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
                <Button
                  onClick={() => setIsTracked(!isTracked)}
                  className={isTracked 
                    ? "gap-2 bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "gap-2"
                  }
                  variant={isTracked ? "default" : "outline"}
                >
                  {isTracked ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      Tracking
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4" />
                      Track Bill
                    </>
                  )}
                </Button>
                {bill.url && (
                  <a href={bill.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="w-full gap-2 sm:w-auto">
                      <ExternalLink className="h-4 w-4" />
                      View Source
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ask Uwazi CTA */}
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Have questions about this bill?</h2>
            <p className="mb-4 text-muted-foreground">
              Ask Uwazi to explain what this legislation means for you in plain English.
            </p>
            <Link href={`/ask-uwazi?q=Explain ${bill.bill_id} ${bill.title}`}>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Ask Uwazi about this bill
              </Button>
            </Link>
          </div>

          {/* Source Attribution */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Data sourced from {bill.source === "legiscan" ? "LegiScan" : bill.source === "congress" ? "Congress.gov" : bill.source || "public records"}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LegislationDetailPage() {
  return (
    <Providers>
      <LegislationDetailContent />
    </Providers>
  )
}
