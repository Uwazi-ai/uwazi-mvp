import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { ensureUser } from "@/lib/ensure-user"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  await ensureUser({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  })

  const { data: savedQuestions } = await supabase
    .from("saved_questions")
    .select("*")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false })

  const { data: trackedBills } = await supabase
    .from("tracked_bills")
    .select("bills(*)")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false })

  const bills = (trackedBills || []).map((tb: any) => tb.bills).filter(Boolean)

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <h1 className="font-heading text-5xl">Your Account</h1>
          <p className="mt-2 text-white/70">{session.user.email}</p>
        </div>

        <section>
          <h2 className="font-heading text-3xl text-[#9bd34b]">Saved Questions</h2>
          <div className="mt-4 space-y-4">
            {(savedQuestions || []).length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
                No saved questions yet.
              </div>
            ) : (
              (savedQuestions || []).map((item: any) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="font-semibold text-[#9bd34b]">{item.question}</p>
                  <pre className="mt-3 whitespace-pre-wrap text-sm text-white/80">
                    {JSON.stringify(item.answer, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-3xl text-[#9bd34b]">Tracked Bills</h2>
          <div className="mt-4 space-y-4">
            {bills.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
                No tracked bills yet.
              </div>
            ) : (
              bills.map((bill: any) => (
                <div key={bill.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/60">
                    {bill.bill_number} • {bill.jurisdiction}
                  </p>
                  <h3 className="mt-1 font-heading text-2xl">{bill.title}</h3>
                  <p className="mt-2 text-white/80">{bill.summary_plain}</p>
                  <p className="mt-2 text-sm text-[#9bd34b]">Status: {bill.status}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
