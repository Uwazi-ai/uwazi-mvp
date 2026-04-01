import { sql } from "@/lib/db"

export async function ensureUser({
  email,
  name,
  image,
}: {
  email: string
  name?: string | null
  image?: string | null
}) {
  await sql`
    insert into users (email, name, image)
    values (${email}, ${name ?? null}, ${image ?? null})
    on conflict (email) do update
    set name  = coalesce(excluded.name, users.name),
        image = coalesce(excluded.image, users.image)
  `
}
