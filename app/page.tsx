import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageSquare, FileText, ArrowRight, Sparkles, Shield, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"

export default function HomePage() {
  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(155,211,75,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(155,211,75,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
            
            <div className="relative mx-auto max-w-4xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Understand what&apos;s shaping your{" "}
                <span className="text-uwazi-green">community.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                UWAZI helps you understand legislation, policy, and civic issues in plain English. 
                No jargon. No confusion. Just clarity on what matters to you.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/ask-uwazi">
                  <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <MessageSquare className="h-5 w-5" />
                    Ask Uwazi
                  </Button>
                </Link>
                <Link href="/legislation-tracker">
                  <Button size="lg" variant="outline" className="gap-2">
                    <FileText className="h-5 w-5" />
                    Track Legislation
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Feature Cards Section */}
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Ask Uwazi Card */}
                <Card className="group relative overflow-hidden border-border bg-card transition-all hover:border-primary/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardHeader className="relative pb-2">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Ask Uwazi</h2>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      Have a question about a policy, bill, or civic issue? Ask Uwazi and get a clear, 
                      plain-English explanation with context on why it matters and what you can do.
                    </p>
                    <Link href="/ask-uwazi">
                      <Button variant="secondary" className="group/btn gap-2">
                        Start asking
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Legislation Tracker Card */}
                <Card className="group relative overflow-hidden border-border bg-card transition-all hover:border-primary/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardHeader className="relative pb-2">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Legislation Tracker</h2>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      Stay informed about bills at every level—federal, state, and local. 
                      Track the ones that matter to you and get updates on their progress.
                    </p>
                    <Link href="/legislation-tracker">
                      <Button variant="secondary" className="group/btn gap-2">
                        Browse legislation
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Why UWAZI Section */}
          <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
                Why <span className="text-uwazi-green">UWAZI</span>?
              </h2>
              <div className="grid gap-8 sm:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Plain English</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Complex legislation explained simply. No legal jargon, just clear answers.
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Trustworthy</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Source-backed information with links to official documents and records.
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Actionable</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Know what matters and what you can do about it in your community.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Ready to stay informed?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start exploring legislation and get answers to your civic questions today.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/ask-uwazi">
                  <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-uwazi-green">UWAZI</span>
                <span className="text-sm text-muted-foreground">Civic clarity for everyone.</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Made for informed communities.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Providers>
  )
}
