"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { mockBills, type Bill } from "@/lib/mock-data"
import { ArrowLeft, ExternalLink, BookmarkPlus, Calendar, Building2 } from "lucide-react"

function getStatusColor(status: Bill["status"]) {
  switch (status) {
    case "Introduced":
      return "bg-muted text-muted-foreground"
    case "In Committee":
      return "bg-amber-500/20 text-amber-400"
    case "Passed House":
    case "Passed Senate":
      return "bg-blue-500/20 text-blue-400"
    case "Signed":
      return "bg-primary/20 text-primary"
    case "Vetoed":
      return "bg-destructive/20 text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getJurisdictionColor(jurisdiction: Bill["jurisdiction"]) {
  switch (jurisdiction) {
    case "Federal":
      return "bg-blue-500/20 text-blue-400"
    case "State":
      return "bg-purple-500/20 text-purple-400"
    case "Local":
      return "bg-orange-500/20 text-orange-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function LegislationDetailContent({ id }: { id: string }) {
  const [isTracked, setIsTracked] = useState(false)
  
  const bill = mockBills.find((b) => b.id === id)

  if (!bill) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-2xl font-bold text-foreground">Bill not found</h1>
            <p className="mt-2 text-muted-foreground">
              The bill you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/legislation-tracker" className="mt-4 inline-block">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Legislation Tracker
              </Button>
            </Link>
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
                <Badge variant="secondary" className={getJurisdictionColor(bill.jurisdiction)}>
                  {bill.jurisdiction}
                </Badge>
                <Badge variant="secondary" className={getStatusColor(bill.status)}>
                  {bill.status}
                </Badge>
              </div>

              {/* Bill Number and Title */}
              <div>
                <p className="text-lg font-semibold text-primary">{bill.billNumber}</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {bill.title}
                </h1>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{bill.jurisdiction} Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Introduced {new Date(bill.introducedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* Summary */}
              <div>
                <h2 className="mb-3 text-lg font-semibold text-foreground">Summary</h2>
                <p className="leading-relaxed text-muted-foreground">{bill.summary}</p>
              </div>

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
                  <BookmarkPlus className={`h-4 w-4 ${isTracked ? "fill-current" : ""}`} />
                  {isTracked ? "Tracking" : "Track Bill"}
                </Button>
                <a href={bill.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="w-full gap-2 sm:w-auto">
                    <ExternalLink className="h-4 w-4" />
                    View Source
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Related Info */}
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Have questions about this bill?</h2>
            <p className="mb-4 text-muted-foreground">
              Ask Uwazi to explain what this legislation means for you in plain English.
            </p>
            <Link href={`/ask-uwazi?q=Explain ${bill.billNumber} ${bill.title}`}>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Ask Uwazi about this bill
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LegislationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return (
    <Providers>
      <LegislationDetailContent id={id} />
    </Providers>
  )
}
