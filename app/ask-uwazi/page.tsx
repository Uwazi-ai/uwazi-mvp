"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { useAuth } from "@/lib/auth-context"
import { examplePrompts, mockAnswer, type UwaziAnswer } from "@/lib/mock-data"
import { 
  Send, 
  Bookmark, 
  Sparkles, 
  ArrowUp,
  Copy,
  Check,
  RotateCcw,
  Zap,
  MessageSquare,
  Scale,
  FileText,
  Lightbulb,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  answer?: UwaziAnswer
  timestamp: Date
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1">
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
    </div>
  )
}

function AskUwaziContent() {
  const { user } = useAuth()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: mockAnswer.quickAnswer,
      answer: mockAnswer,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSave = (id: string) => {
    setSavedIds((prev) => new Set(prev).add(id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {isEmpty ? (
              /* Empty State - Centered Hero */
              <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mt-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Ask <span className="text-primary">Uwazi</span>
                </h1>
                <p className="mt-3 max-w-md text-center text-muted-foreground">
                  Get clear, plain-English answers about legislation, policy, and civic issues.
                </p>

                {/* Suggested Prompts Grid */}
                <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                  {examplePrompts.slice(0, 4).map((prompt, index) => {
                    const icons = [Scale, FileText, MessageSquare, Lightbulb]
                    const Icon = icons[index % icons.length]
                    return (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(prompt)}
                        className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-card/80"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                          {prompt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="space-y-6 pb-32">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    {message.type === "user" ? (
                      /* User Message */
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      /* Assistant Message */
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-4">
                            {/* Quick Answer */}
                            <div>
                              <p className="leading-relaxed text-foreground">{message.answer?.quickAnswer}</p>
                            </div>

                            {/* In Plain English */}
                            {message.answer?.plainEnglish && (
                              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                                  <FileText className="h-4 w-4" />
                                  In Plain English
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {message.answer.plainEnglish}
                                </p>
                              </div>
                            )}

                            {/* Why This Matters */}
                            {message.answer?.whyItMatters && (
                              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                                  <Zap className="h-4 w-4" />
                                  Why This Matters
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {message.answer.whyItMatters}
                                </p>
                              </div>
                            )}

                            {/* What You Can Do */}
                            {message.answer?.whatYouCanDo && (
                              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                                  <Lightbulb className="h-4 w-4" />
                                  What You Can Do
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {message.answer.whatYouCanDo}
                                </p>
                              </div>
                            )}

                            {/* Source Note */}
                            {message.answer?.sourceNote && (
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                <span>{message.answer.sourceNote}</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  handleCopy(
                                    `${message.answer?.quickAnswer}\n\n${message.answer?.plainEnglish}`,
                                    message.id
                                  )
                                }
                              >
                                {copiedId === message.id ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                {copiedId === message.id ? "Copied" : "Copy"}
                              </Button>
                              {user ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 gap-1.5 px-2 text-xs ${
                                    savedIds.has(message.id)
                                      ? "text-primary"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                  onClick={() => handleSave(message.id)}
                                >
                                  <Bookmark
                                    className={`h-3.5 w-3.5 ${savedIds.has(message.id) ? "fill-current" : ""}`}
                                  />
                                  {savedIds.has(message.id) ? "Saved" : "Save"}
                                </Button>
                              ) : (
                                <Link href="/login">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                                  >
                                    <Bookmark className="h-3.5 w-3.5" />
                                    Save
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-tl-md bg-secondary px-4 py-3">
                      <TypingIndicator />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl px-4 py-4">
            {/* New Chat Button - Show when there are messages */}
            {!isEmpty && (
              <div className="mb-3 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewChat}
                  className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New conversation
                </Button>
              </div>
            )}

            {/* Input Container */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-end rounded-2xl border border-border bg-card shadow-lg ring-1 ring-black/5 transition-all focus-within:border-primary/50 focus-within:ring-primary/20">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about any policy, bill, or civic issue..."
                  rows={1}
                  className="max-h-[200px] min-h-[56px] flex-1 resize-none bg-transparent px-4 py-4 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="absolute bottom-2 right-2">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-40"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Footer Note */}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Uwazi uses AI to simplify complex civic information. Always verify with official sources.
            </p>
          </div>
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
