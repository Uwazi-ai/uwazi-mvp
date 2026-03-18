"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookmarkPlus, ExternalLink } from "lucide-react"
import type { Bill } from "@/lib/mock-data"

interface BillCardProps {
  bill: Bill
  onTrack?: (billId: string) => void
  isTracked?: boolean
}

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

export function BillCard({ bill, onTrack, isTracked }: BillCardProps) {
  return (
    <Card className="flex flex-col border-border bg-card transition-colors hover:bg-card/80">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={getJurisdictionColor(bill.jurisdiction)}>
            {bill.jurisdiction}
          </Badge>
          <Badge variant="secondary" className={getStatusColor(bill.status)}>
            {bill.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-primary">{bill.billNumber}</p>
          <h3 className="mt-1 text-lg font-semibold leading-tight text-foreground">
            {bill.title}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{bill.summary}</p>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Link href={`/legislation-tracker/${bill.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            View Bill
          </Button>
        </Link>
        <Button
          variant={isTracked ? "default" : "outline"}
          size="sm"
          onClick={() => onTrack?.(bill.id)}
          className={isTracked ? "bg-primary text-primary-foreground" : ""}
        >
          <BookmarkPlus className="h-4 w-4" />
          <span className="sr-only">{isTracked ? "Tracking" : "Track Bill"}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
