"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { useAuth } from "@/lib/auth-context"
import { User, BookmarkCheck, MessageSquare, LogOut, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

// Mock saved data
const mockSavedQuestions = [
  {
    id: "1",
    question: "What does the Community Investment Act mean for small businesses?",
    savedAt: "2026-03-15",
  },
  {
    id: "2",
    question: "How will the digital privacy law affect my data?",
    savedAt: "2026-03-10",
  },
]

const mockTrackedBills = [
  {
    id: "1",
    billNumber: "H.R. 2847",
    title: "Community Investment and Opportunity Act",
    status: "In Committee",
  },
  {
    id: "3",
    billNumber: "A.B. 445",
    title: "Clean Energy Transition Initiative",
    status: "Introduced",
  },
]

function AccountContent() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md border-border bg-card text-center">
            <CardContent className="py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">Not signed in</h2>
              <p className="mt-2 text-muted-foreground">
                Sign in to access your account and saved content.
              </p>
              <Link href="/login" className="mt-6 inline-block">
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8 border-border bg-card">
            <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Saved Questions */}
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Saved Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {mockSavedQuestions.length > 0 ? (
                  <ul className="space-y-3">
                    {mockSavedQuestions.map((q) => (
                      <li
                        key={q.id}
                        className="rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                      >
                        <p className="text-sm text-foreground">{q.question}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Saved on {new Date(q.savedAt).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No saved questions yet</p>
                    <Link href="/ask-uwazi" className="mt-3 inline-block">
                      <Button variant="outline" size="sm" className="gap-2">
                        Ask Uwazi
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracked Bills */}
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                  Tracked Bills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {mockTrackedBills.length > 0 ? (
                  <ul className="space-y-3">
                    {mockTrackedBills.map((bill) => (
                      <li key={bill.id}>
                        <Link
                          href={`/legislation-tracker/${bill.id}`}
                          className="block rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                        >
                          <p className="text-sm font-medium text-primary">{bill.billNumber}</p>
                          <p className="mt-0.5 text-sm text-foreground">{bill.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Status: {bill.status}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No tracked bills yet</p>
                    <Link href="/legislation-tracker" className="mt-3 inline-block">
                      <Button variant="outline" size="sm" className="gap-2">
                        Browse Bills
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Providers>
      <AccountContent />
    </Providers>
  )
}
