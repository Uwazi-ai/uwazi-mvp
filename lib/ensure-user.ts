import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function ensureUser({
  email,
  name,
  image,
}: {
  email: string
  name?: string | null
  image?: string | null
}) {
  await supabase
    .from('users')
    .upsert(
      { email, name: name ?? null, image: image ?? null },
      { onConflict: 'email' }
    )
}
