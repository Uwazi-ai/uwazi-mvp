"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookmarkPlus, ExternalLink, Calendar } from "lucide-react"
import type { DBBill } from "@/lib/db"

interface BillCardProps {
  bill: DBBill
  onTrack?: (billId: string) => void
  isTracked?: boolean
}

function getStatusColor(status: string | null) {
  if (!status) return "bg-muted text-muted-foreground"
  
  const statusLower = status.toLowerCase()
  if (statusLower.includes("introduced")) return "bg-muted text-muted-foreground"
  if (statusLower.includes("committee")) return "bg-amber-500/20 text-amber-400"
  if (statusLower.includes("passed")) return "bg-blue-500/20 text-blue-400"
  if (statusLower.includes("signed") || statusLower.includes("enacted")) return "bg-primary/20 text-primary"
  if (statusLower.includes("vetoed") || statusLower.includes("failed")) return "bg-destructive/20 text-destructive"
  if (statusLower.includes("engrossed") || statusLower.includes("enrolled")) return "bg-green-500/20 text-green-400"
  return "bg-muted text-muted-foreground"
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

export function BillCard({ bill, onTrack, isTracked }: BillCardProps) {
  const levelLabel = bill.level.charAt(0).toUpperCase() + bill.level.slice(1)
  const stateLabel = bill.state ? ` (${bill.state})` : ""

  return (
    <Card className="flex flex-col border-border bg-card transition-colors hover:bg-card/80">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={getLevelColor(bill.level)}>
            {levelLabel}{stateLabel}
          </Badge>
          {bill.status && (
            <Badge variant="secondary" className={getStatusColor(bill.status)}>
              {bill.status}
            </Badge>
          )}
          {bill.chamber && (
            <Badge variant="outline" className="text-xs">
              {bill.chamber}
            </Badge>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-primary">{bill.bill_id.replace(/^(legiscan|congress)-/, "")}</p>
          <h3 className="mt-1 text-lg font-semibold leading-tight text-foreground line-clamp-2">
            {bill.title}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 space-y-3">
        {bill.summary && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{bill.summary}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {bill.sponsor && (
            <span>Sponsor: {bill.sponsor}</span>
          )}
          {bill.introduced_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(bill.introduced_date)}
            </span>
          )}
        </div>
        {bill.topics && bill.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bill.topics.slice(0, 3).map((topic, i) => (
              <Badge key={i} variant="outline" className="text-xs px-2 py-0">
                {topic}
              </Badge>
            ))}
            {bill.topics.length > 3 && (
              <span className="text-xs text-muted-foreground">+{bill.topics.length - 3} more</span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Link href={`/legislation-tracker/${bill.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            View Details
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
