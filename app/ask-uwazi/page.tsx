"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { useAuth } from "@/lib/auth-context"
import { examplePrompts, mockAnswer, type UwaziAnswer } from "@/lib/mock-data"
import { Send, Bookmark, Loader2, Sparkles, AlertCircle, Lightbulb, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"

function AskUwaziContent() {
  const { user } = useAuth()
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<UwaziAnswer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    
    setIsLoading(true)
    setAnswer(null)
    setIsSaved(false)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setAnswer(mockAnswer)
    setIsLoading(false)
  }

  const handleSave = () => {
    if (!user) {
      // Redirect to login would happen here
      return
    }
    setIsSaved(true)
  }

  const handlePromptClick = (prompt: string) => {
    setQuestion(prompt)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ask <span className="text-primary">Uwazi</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Get clear, plain-English answers about legislation, policy, and civic issues.
            </p>
          </div>

          {/* Question Input */}
          <Card className="mb-6 border-border bg-card">
            <CardContent className="p-4 sm:p-6">
              <Textarea
                placeholder="What would you like to understand? Ask about any policy, bill, or civic issue..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[120px] resize-none border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-primary"
              />
              
              {/* Example Prompts */}
              <div className="mt-4">
                <p className="mb-2 text-sm text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAsk}
                  disabled={!question.trim() || isLoading}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Ask Uwazi
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="border-border bg-card">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Analyzing your question...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Answer Card */}
          {answer && !isLoading && (
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Uwazi&apos;s Answer
                </CardTitle>
                {user ? (
                  <Button
                    variant={isSaved ? "default" : "outline"}
                    size="sm"
                    onClick={handleSave}
                    className={isSaved ? "bg-primary text-primary-foreground" : ""}
                  >
                    <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Saved" : "Save Answer"}
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Login to Save
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                {/* Quick Answer */}
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Quick Answer
                  </h3>
                  <p className="text-muted-foreground">{answer.quickAnswer}</p>
                </div>

                {/* In Plain English */}
                <div className="rounded-lg border border-border bg-secondary/50 p-4">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    In Plain English
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">{answer.plainEnglish}</p>
                </div>

                {/* Why This Matters */}
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Why This Matters
                  </h3>
                  <p className="text-muted-foreground">{answer.whyItMatters}</p>
                </div>

                {/* What You Can Do */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    What You Can Do Next
                  </h3>
                  <p className="text-muted-foreground">{answer.whatYouCanDo}</p>
                </div>

                {/* Source Note */}
                <div className="border-t border-border pt-4">
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{answer.sourceNote}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!answer && !isLoading && (
            <div className="text-center text-muted-foreground">
              <p>Your answer will appear here after you ask a question.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AskUwaziPage() {
  return (
    <Providers>
      <AskUwaziContent />
    </Providers>
  )
}
