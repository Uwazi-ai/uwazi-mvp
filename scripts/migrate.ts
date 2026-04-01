import postgres from "postgres"
import { readFileSync } from "fs"
import { join } from "path"

async function migrate() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
  }

  const sql = postgres(url, { ssl: "require" })
  const migrationPath = join(process.cwd(), "migrations", "001_initial_schema.sql")
  const migration = readFileSync(migrationPath, "utf-8")

  console.log("Running migration: 001_initial_schema.sql")
  await sql.unsafe(migration)
  console.log("Migration complete")
  await sql.end()
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
