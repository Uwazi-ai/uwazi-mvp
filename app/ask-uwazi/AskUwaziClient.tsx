"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Answer = {
  quickAnswer: string
  plainEnglish: string
  whyItMatters: string
  nextStep: string
  sourceNote: string
}

export default function AskUwaziClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAsk() {
    if (!question.trim()) return

    setLoading(true)
    setAnswer(null)

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    })

    const data = await res.json()
    setAnswer(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    await fetch("/api/save-question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, answer }),
    })
  }

  return (
    <div className="space-y-6">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about a bill, policy, election, or civic issue..."
        className="w-full min-h-[180px] rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {[
          "What does this bill mean in plain English?",
          "How does local government affect rent?",
          "What does in committee mean?",
          "How could this law affect my community?",
        ].map((prompt) => (
          <button
            key={prompt}
            onClick={() => setQuestion(prompt)}
            className="rounded-full border border-[#9bd34b]/40 px-3 py-2 text-sm text-[#9bd34b]"
          >
            {prompt}
          </button>
        ))}
      </div>

      <button
        onClick={handleAsk}
        disabled={loading}
        className="rounded-xl bg-[#9bd34b] px-5 py-3 font-semibold text-black"
      >
        {loading ? "Thinking..." : "Ask Uwazi"}
      </button>

      {answer && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <h3 className="font-heading text-xl text-[#9bd34b]">Quick answer</h3>
            <p className="mt-2 text-white/90">{answer.quickAnswer}</p>
          </div>
          <div>
            <h3 className="font-heading text-xl text-[#9bd34b]">In plain English</h3>
            <p className="mt-2 text-white/90">{answer.plainEnglish}</p>
          </div>
          <div>
            <h3 className="font-heading text-xl text-[#9bd34b]">Why this matters</h3>
            <p className="mt-2 text-white/90">{answer.whyItMatters}</p>
          </div>
          <div>
            <h3 className="font-heading text-xl text-[#9bd34b]">What you can do next</h3>
            <p className="mt-2 text-white/90">{answer.nextStep}</p>
          </div>
          <div>
            <h3 className="font-heading text-xl text-[#9bd34b]">Source note</h3>
            <p className="mt-2 text-white/90">{answer.sourceNote}</p>
          </div>

          <button
            onClick={handleSave}
            className="rounded-xl border border-[#9bd34b] px-4 py-2 text-[#9bd34b]"
          >
            Save Answer
          </button>
        </div>
      )}
    </div>
  )
}
