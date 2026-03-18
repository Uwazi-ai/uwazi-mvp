"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { useAuth } from "@/lib/auth-context"
import { examplePrompts, mockAnswer, mockBills, type UwaziAnswer } from "@/lib/mock-data"
import { 
  Send, 
  Bookmark, 
  Sparkles, 
  ArrowUp,
  Copy,
  Check,
  Plus,
  MessageSquare,
  Scale,
  FileText,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Clock,
  Bell,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  answer?: UwaziAnswer
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  messages: Message[]
}

// Thinking Animation Component
function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-uwazi-green/10 ring-1 ring-uwazi-green/20">
        <Loader2 className="h-4 w-4 animate-spin text-uwazi-green" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Researching</span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uwazi-green/60 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uwazi-green/60 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uwazi-green/60" />
        </span>
      </div>
    </div>
  )
}

// Streaming text animation hook
function useStreamingText(text: string, isActive: boolean, speed: number = 15) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }

    setDisplayedText("")
    setIsComplete(false)
    let index = 0

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, isActive, speed])

  return { displayedText, isComplete }
}

// Collapsible Section Component
function CollapsibleSection({ 
  icon: Icon, 
  title, 
  children, 
  defaultOpen = true,
  accentBorder = false
}: { 
  icon: React.ElementType
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  accentBorder?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`rounded-xl border transition-all ${
      accentBorder 
        ? "border-uwazi-green/30 bg-uwazi-green/5" 
        : "border-border/50 bg-secondary/20"
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-uwazi-green">
          <Icon className="h-4 w-4" />
          {title}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-border/30 px-3 pb-3 pt-2">
          {children}
        </div>
      )}
    </div>
  )
}

// Follow-up suggestion chips
const followUpSuggestions = [
  "Explain this in simpler terms",
  "How does this affect me locally?",
  "What should I do next?",
  "Track this bill",
  "Find related legislation",
]

function AskUwaziContent() {
  const { user } = useAuth()
  const [input, setInput] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "demo-1",
      title: "Housing Policy Question",
      preview: "What does the new housing bill mean for renters?",
      timestamp: new Date(Date.now() - 86400000),
      messages: [],
    },
    {
      id: "demo-2", 
      title: "Data Privacy Rights",
      preview: "What are my rights under the new data privacy law?",
      timestamp: new Date(Date.now() - 172800000),
      messages: [],
    },
  ])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

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

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    // Create new conversation if none active
    if (!activeConversationId) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: input.trim().slice(0, 40) + (input.length > 40 ? "..." : ""),
        preview: input.trim(),
        timestamp: new Date(),
        messages: newMessages,
      }
      setConversations(prev => [newConversation, ...prev])
      setActiveConversationId(newConversation.id)
    }

    await new Promise((resolve) => setTimeout(resolve, 1800))

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      type: "assistant",
      content: mockAnswer.quickAnswer,
      answer: mockAnswer,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setStreamingMessageId(assistantMessageId)
    setIsLoading(false)

    // Clear streaming after animation completes
    setTimeout(() => {
      setStreamingMessageId(null)
    }, mockAnswer.quickAnswer.length * 15 + 500)
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
    setActiveConversationId(null)
    setInput("")
  }

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversationId(conv.id)
    setMessages(conv.messages)
  }

  const isEmpty = messages.length === 0
  const trackedBillsCount = 2

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? "w-72" : "w-0"
        } flex-shrink-0 border-r border-border/50 bg-card/30 transition-all duration-300 overflow-hidden`}>
          <div className="flex h-full w-72 flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <span className="text-sm font-medium text-foreground">Conversations</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all ${
                      activeConversationId === conv.id
                        ? "bg-uwazi-green/10 text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{conv.title}</p>
                      <p className="mt-0.5 truncate text-xs opacity-60">{conv.preview}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Footer - Tracked & Saved */}
            <div className="border-t border-border/50 p-3 space-y-2">
              <Link href="/legislation-tracker" className="flex items-center gap-3 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="flex-1 text-sm">Tracked Bills</span>
                {trackedBillsCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-uwazi-green/20 px-1.5 text-xs font-medium text-uwazi-green">
                    {trackedBillsCount}
                  </span>
                )}
              </Link>
              <Link href="/account" className="flex items-center gap-3 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground">
                <Bookmark className="h-4 w-4" />
                <span className="flex-1 text-sm">Saved Questions</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Toggle Sidebar Button */}
          <div className="absolute left-0 top-20 z-10 p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`h-8 w-8 text-muted-foreground hover:text-foreground transition-all ${
                sidebarOpen ? "ml-72" : "ml-0"
              }`}
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-8">
              {isEmpty ? (
                /* Empty State - Centered Hero */
                <div className="flex min-h-[60vh] flex-col items-center justify-center">
                  <div className="relative mb-4">
                    <div className="absolute -inset-4 rounded-full bg-uwazi-green/10 blur-2xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-uwazi-green/20 to-uwazi-green/5 ring-1 ring-uwazi-green/30">
                      <Sparkles className="h-10 w-10 text-uwazi-green" />
                    </div>
                  </div>
                  <h1 className="mt-6 text-center text-4xl font-bold tracking-tight text-foreground">
                    How can I help?
                  </h1>
                  <p className="mt-4 max-w-lg text-center text-lg text-muted-foreground">
                    Ask anything about laws, policies, voting, or your rights. Get clear answers in plain English.
                  </p>

                  {/* Suggested Prompts Grid */}
                  <div className="mt-12 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                    {examplePrompts.map((prompt, index) => {
                      const icons = [Scale, FileText, MessageSquare, Lightbulb]
                      const Icon = icons[index % icons.length]
                      return (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(prompt)}
                          className="group relative flex items-start gap-4 overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 text-left transition-all hover:border-uwazi-green/30 hover:bg-card"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-uwazi-green/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground transition-all group-hover:bg-uwazi-green/10 group-hover:text-uwazi-green">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="relative flex-1">
                            <span className="text-sm leading-relaxed text-foreground/80 transition-colors group-hover:text-foreground">
                              {prompt}
                            </span>
                            <ChevronRight className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-0 transition-all group-hover:right-0 group-hover:opacity-100" />
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-16 flex items-center gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Updated daily</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{mockBills.length} bills tracked</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <div className="space-y-8 pb-40">
                  {messages.map((message, index) => (
                    <div key={message.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {message.type === "user" ? (
                        /* User Message */
                        <div className="flex justify-end">
                          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-uwazi-green px-5 py-3 text-black">
                            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        /* Assistant Message */
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-uwazi-green/10 ring-1 ring-uwazi-green/20">
                              <Sparkles className="h-5 w-5 text-uwazi-green" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-4">
                              {/* Quick Answer with streaming */}
                              <StreamingText 
                                text={message.answer?.quickAnswer || message.content}
                                isStreaming={message.id === streamingMessageId}
                              />

                              {/* Modular Response Sections */}
                              {message.id !== streamingMessageId && message.answer && (
                                <div className="space-y-3 animate-in fade-in duration-500">
                                  {/* In Plain English */}
                                  {message.answer.plainEnglish && (
                                    <CollapsibleSection icon={FileText} title="In Plain English">
                                      <p className="text-sm leading-relaxed text-muted-foreground">
                                        {message.answer.plainEnglish}
                                      </p>
                                    </CollapsibleSection>
                                  )}

                                  {/* Why This Matters */}
                                  {message.answer.whyItMatters && (
                                    <CollapsibleSection icon={Lightbulb} title="Why This Matters">
                                      <p className="text-sm leading-relaxed text-muted-foreground">
                                        {message.answer.whyItMatters}
                                      </p>
                                    </CollapsibleSection>
                                  )}

                                  {/* What You Can Do */}
                                  {message.answer.whatYouCanDo && (
                                    <CollapsibleSection icon={ChevronRight} title="What You Can Do" accentBorder>
                                      <p className="text-sm leading-relaxed text-muted-foreground">
                                        {message.answer.whatYouCanDo}
                                      </p>
                                    </CollapsibleSection>
                                  )}

                                  {/* Source Note */}
                                  {message.answer.sourceNote && (
                                    <div className="flex items-start gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                                      <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                      <span>{message.answer.sourceNote}</span>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                                      onClick={() =>
                                        handleCopy(
                                          `${message.answer?.quickAnswer}\n\n${message.answer?.plainEnglish}`,
                                          message.id
                                        )
                                      }
                                    >
                                      {copiedId === message.id ? (
                                        <Check className="h-3.5 w-3.5 text-uwazi-green" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                      {copiedId === message.id ? "Copied" : "Copy"}
                                    </Button>
                                    {user ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 gap-1.5 rounded-lg px-3 text-xs ${
                                          savedIds.has(message.id)
                                            ? "text-uwazi-green"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
                                          className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        >
                                          <Bookmark className="h-3.5 w-3.5" />
                                          Save
                                        </Button>
                                      </Link>
                                    )}
                                  </div>

                                  {/* Follow-up Suggestions */}
                                  {index === messages.length - 1 && (
                                    <div className="pt-4">
                                      <p className="mb-2 text-xs font-medium text-muted-foreground">Continue exploring</p>
                                      <div className="flex flex-wrap gap-2">
                                        {followUpSuggestions.slice(0, 4).map((suggestion, i) => (
                                          <button
                                            key={i}
                                            onClick={() => handlePromptClick(suggestion)}
                                            className="rounded-full border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-uwazi-green/30 hover:bg-uwazi-green/10 hover:text-foreground"
                                          >
                                            {suggestion}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking Indicator */}
                  {isLoading && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <ThinkingIndicator />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="sticky bottom-0 border-t border-border/30 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl">
            <div className="mx-auto max-w-3xl px-4 py-4">
              {/* Input Container */}
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-end rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20 ring-1 ring-white/5 transition-all focus-within:border-uwazi-green/30 focus-within:ring-uwazi-green/10">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about laws, policies, voting, or your rights..."
                    rows={1}
                    className="max-h-[200px] min-h-[60px] flex-1 resize-none bg-transparent px-5 py-4 pr-14 text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  <div className="absolute bottom-3 right-3">
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      className="h-10 w-10 rounded-xl bg-uwazi-green text-black shadow-lg transition-all hover:bg-uwazi-green/90 hover:shadow-uwazi-green/20 hover:shadow-xl disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowUp className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Footer Note */}
              <p className="mt-3 text-center text-xs text-muted-foreground/60">
                Uwazi uses AI to simplify civic information. Always verify with official sources.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Streaming Text Component
function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const { displayedText, isComplete } = useStreamingText(text, isStreaming)

  return (
    <div>
      <p className="text-base leading-relaxed text-foreground">
        {displayedText}
        {isStreaming && !isComplete && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-uwazi-green" />
        )}
      </p>
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
