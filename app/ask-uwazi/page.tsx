import { auth } from "@/auth"
import AskUwaziClient from "./AskUwaziClient"

export default async function AskUwaziPage() {
  const session = await auth()

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="font-heading text-5xl">Ask Uwazi</h1>
          <p className="mt-3 text-white/70">
            Ask civic, policy, and legislation questions in plain English.
          </p>
        </div>

        <AskUwaziClient isLoggedIn={!!session?.user?.email} />
      </div>
    </main>
  )
}
