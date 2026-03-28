"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { useAuth } from "@/lib/auth-context"
import { examplePrompts, mockBills } from "@/lib/mock-data"
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
} from "lucide-react"
import Link from "next/link"

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
}

// Helper to extract text from UIMessage parts
function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("")
}

// Thinking Animation Component
function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-uwazi-green/10 ring-1 ring-uwazi-green/20">
        <Loader2 className="h-4 w-4 animate-spin text-uwazi-green" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Thinking</span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uwazi-green/60 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uwazi-green/60 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-uwazi-green/60" />
        </span>
      </div>
    </div>
  )
}

// Parse structured response sections from AI response
function parseResponse(text: string) {
  const sections: {
    quickAnswer?: string
    plainEnglish?: string
    whyItMatters?: string
    whatYouCanDo?: string
    sources?: string
  } = {}

  // Try to extract structured sections
  const quickAnswerMatch = text.match(/\*\*Quick Answer:\*\*\s*([\s\S]*?)(?=\*\*In Plain English:\*\*|\*\*Why This Matters:\*\*|\*\*What You Can Do:\*\*|\*\*Sources:\*\*|$)/i)
  const plainEnglishMatch = text.match(/\*\*In Plain English:\*\*\s*([\s\S]*?)(?=\*\*Why This Matters:\*\*|\*\*What You Can Do:\*\*|\*\*Sources:\*\*|$)/i)
  const whyItMattersMatch = text.match(/\*\*Why This Matters:\*\*\s*([\s\S]*?)(?=\*\*What You Can Do:\*\*|\*\*Sources:\*\*|$)/i)
  const whatYouCanDoMatch = text.match(/\*\*What You Can Do:\*\*\s*([\s\S]*?)(?=\*\*Sources:\*\*|$)/i)
  const sourcesMatch = text.match(/\*\*Sources:\*\*\s*([\s\S]*?)$/i)

  if (quickAnswerMatch) sections.quickAnswer = quickAnswerMatch[1].trim()
  if (plainEnglishMatch) sections.plainEnglish = plainEnglishMatch[1].trim()
  if (whyItMattersMatch) sections.whyItMatters = whyItMattersMatch[1].trim()
  if (whatYouCanDoMatch) sections.whatYouCanDo = whatYouCanDoMatch[1].trim()
  if (sourcesMatch) sections.sources = sourcesMatch[1].trim()

  // If no structured sections found, treat the whole thing as the answer
  const hasStructure = Object.keys(sections).length > 0
  
  return { sections, hasStructure, fullText: text }
}

// Response section component
function ResponseSection({ 
  icon: Icon, 
  title, 
  content,
  accentBorder = false
}: { 
  icon: React.ElementType
  title: string
  content: string
  accentBorder?: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${
      accentBorder 
        ? "border-uwazi-green/30 bg-uwazi-green/5" 
        : "border-border/50 bg-secondary/20"
    }`}>
      <div className="flex items-center gap-2 text-sm font-medium text-uwazi-green mb-2">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {content}
      </p>
    </div>
  )
}

function AskUwaziContent() {
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "demo-1",
      title: "Housing Policy Question",
      preview: "What does the new housing bill mean for renters?",
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "demo-2", 
      title: "Data Privacy Rights",
      preview: "What are my rights under the new data privacy law?",
      timestamp: new Date(Date.now() - 172800000),
    },
  ])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // AI SDK useChat hook
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

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
  }, [inputValue])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userInput = inputValue.trim()
    setInputValue("")

    // Create new conversation if none active
    if (!activeConversationId) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: userInput.slice(0, 40) + (userInput.length > 40 ? "..." : ""),
        preview: userInput,
        timestamp: new Date(),
      }
      setConversations(prev => [newConversation, ...prev])
      setActiveConversationId(newConversation.id)
    }

    // Send message using AI SDK
    sendMessage({ text: userInput })
  }

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return
    
    // Create new conversation
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: prompt.slice(0, 40) + (prompt.length > 40 ? "..." : ""),
      preview: prompt,
      timestamp: new Date(),
    }
    setConversations(prev => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
    
    // Send message directly
    sendMessage({ text: prompt })
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
    setInputValue("")
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
                    onClick={() => {
                      setActiveConversationId(conv.id)
                      // In a real app, load conversation messages from DB
                    }}
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
                  {messages.map((message) => {
                    const messageText = getMessageText(message)
                    const isUser = message.role === "user"
                    const parsed = !isUser ? parseResponse(messageText) : null

                    return (
                      <div key={message.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {isUser ? (
                          /* User Message */
                          <div className="flex justify-end">
                            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-uwazi-green px-5 py-3 text-black">
                              <p className="whitespace-pre-wrap font-medium">{messageText}</p>
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
                                {/* Main response or Quick Answer */}
                                {parsed?.hasStructure && parsed.sections.quickAnswer ? (
                                  <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                      {parsed.sections.quickAnswer}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                      {messageText}
                                    </p>
                                  </div>
                                )}

                                {/* Structured sections */}
                                {parsed?.hasStructure && (
                                  <div className="space-y-3">
                                    {parsed.sections.plainEnglish && (
                                      <ResponseSection 
                                        icon={FileText} 
                                        title="In Plain English" 
                                        content={parsed.sections.plainEnglish} 
                                      />
                                    )}
                                    {parsed.sections.whyItMatters && (
                                      <ResponseSection 
                                        icon={Lightbulb} 
                                        title="Why This Matters" 
                                        content={parsed.sections.whyItMatters} 
                                      />
                                    )}
                                    {parsed.sections.whatYouCanDo && (
                                      <ResponseSection 
                                        icon={ChevronRight} 
                                        title="What You Can Do" 
                                        content={parsed.sections.whatYouCanDo}
                                        accentBorder 
                                      />
                                    )}
                                    {parsed.sections.sources && (
                                      <div className="flex items-start gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                                        <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                        <span className="whitespace-pre-wrap">{parsed.sections.sources}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    onClick={() => handleCopy(messageText, message.id)}
                                  >
                                    {copiedId === message.id ? (
                                      <>
                                        <Check className="h-3 w-3" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3" />
                                        Copy
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 gap-1.5 rounded-lg px-3 text-xs ${
                                      savedIds.has(message.id)
                                        ? "text-uwazi-green"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                                    onClick={() => handleSave(message.id)}
                                    disabled={savedIds.has(message.id)}
                                  >
                                    <Bookmark className={`h-3 w-3 ${savedIds.has(message.id) ? "fill-current" : ""}`} />
                                    {savedIds.has(message.id) ? "Saved" : "Save"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Loading indicator */}
                  {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
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
          <div className="sticky bottom-0 border-t border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto max-w-3xl px-4 py-4">
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-end gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 shadow-lg ring-1 ring-border/10 transition-all focus-within:border-uwazi-green/30 focus-within:ring-uwazi-green/20">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about laws, policies, or your civic rights..."
                    className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim() || isLoading}
                    className="h-10 w-10 flex-shrink-0 rounded-xl bg-uwazi-green text-black transition-all hover:bg-uwazi-green/90 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                UWAZI provides educational information. Always verify with official sources for legal matters.
              </p>
            </div>
          </div>
        </main>
      </div>
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
