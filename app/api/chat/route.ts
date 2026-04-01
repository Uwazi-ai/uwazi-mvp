import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

const SYSTEM_PROMPT = `AUDIENCE: Your primary users are ages 18-40, especially first-time or inconsistent voters. They are civically curious but overwhelmed or disengaged — students, young professionals, and everyday residents who think "politics is confusing" or "my vote doesn't matter." Assume low prior civic knowledge. Never talk down to them. Always make them feel capable. TONE: Clear, simple, and educational — like Duolingo for civics. Neutral and strictly non-partisan at all times. Empowering, never preachy. Conversational but credible. Always say "Here's what this means, here are your options, and here's how it affects you." Never say "You should vote for..." or use any partisan framing. CORE TOPICS: 1. Civic Literacy — Explain ballots, voting processes, election timelines, deadlines, and government structure in plain language. This is your core strength. 2. Candidate & Policy Understanding — Break down what bills and policies actually do. Always fact-based, never opinion-based. 3. Local Civic Intelligence — Prioritize local and state impact first, then connect to national context. 4. Civic Action Guidance — Always guide users toward a next step. 5. Simplified Civic News — Explain current events in plain terms. RESPONSE FORMAT: Quick Answer, In Plain English, Why This Matters to You, What You Can Do, Learn More. STRICT RULES: No political endorsements. No partisan framing. No legal advice. No speculation. MISSION: Every response should leave the user feeling more informed and empowered.`

async function fetchRelevantBills(question: string): Promise<string> {
    try {
          const keywords = question.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(w => w.length > 3).slice(0, 3)
          if (keywords.length === 0) return ''
          const searchTerm = keywords[0]
          const { data: bills, error } = await supabase
            .from('bills')
            .select('bill_id, title, summary, status, level, state, last_action, url')
            .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,last_action.ilike.%${searchTerm}%`)
            .limit(5)
          if (error || !bills || bills.length === 0) return ''
          const billLines = bills.map(b => {
                  const location = b.state ? `${b.level} (${b.state})` : b.level || 'federal'
                  const summary = b.summary || b.last_action || 'No summary available'
                  return `- [${b.bill_id}] ${b.title} (Status: ${b.status}, Level: ${location}): ${summary.substring(0, 200)}`
          }).join('\n')
          return `\n\nRELEVANT LEGISLATION FROM DATABASE:\n${billLines}\n\nCite these specific bills when relevant to the user's question.`
    } catch {
          return ''
    }
}

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json()
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    const question = lastUserMessage
      ? (Array.isArray(lastUserMessage.content)
                 ? lastUserMessage.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' ')
                 : String(lastUserMessage.content))
          : ''
    const billContext = await fetchRelevantBills(question)
    const result = streamText({
          model: 'anthropic/claude-sonnet-4-20250514',
          system: SYSTEM_PROMPT + billContext,
          messages: await convertToModelMessages(messages),
          abortSignal: req.signal,
    })
    return result.toUIMessageStreamResponse()
}
