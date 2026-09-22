import { Pool } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var __approvalPool: Pool | undefined
}

function getConnectionString(): string {
  const connectionString = (process.env.DATABASE_URL || "").trim()
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for approval state operations")
  }
  return connectionString
}

export function getDbPool(): Pool {
  if (!globalThis.__approvalPool) {
    globalThis.__approvalPool = new Pool({
      connectionString: getConnectionString(),
      max: 5,
      idleTimeoutMillis: 30_000,
    })
  }
  return globalThis.__approvalPool
}
