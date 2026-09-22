import { randomBytes } from "crypto"
import { LOGIN_REDIRECT_URL } from "@/lib/project-config"
import { getDbPool } from "@/lib/db"

export type ApprovalDecision = "approve" | "decline" | "redirect"
export type ApprovalStatus = "pending" | "approved" | "declined" | "redirected" | "expired"

export type ApprovalState = {
  token: string
  status: ApprovalStatus
  userId: string | null
  redirectUrl: string | null
  decision: ApprovalDecision | null
  decisionSource: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  decidedAt: string | null
  expiresAt: string
}

type DbApprovalState = {
  token: string
  status: ApprovalStatus
  user_id: string | null
  redirect_url: string | null
  decision: ApprovalDecision | null
  decision_source: string | null
  metadata: unknown
  created_at: string
  updated_at: string
  decided_at: string | null
  expires_at: string
}

export type UpdateApprovalResult =
  | { outcome: "updated"; state: ApprovalState }
  | { outcome: "unknown" }
  | { outcome: "expired"; state: ApprovalState }
  | { outcome: "already_finalized"; state: ApprovalState }

const TOKEN_REGEX = /^[A-Za-z0-9_-]{10,64}$/
const DEFAULT_APPROVAL_TTL_SEC = 10 * 60

function toApprovalState(row: DbApprovalState): ApprovalState {
  return {
    token: row.token,
    status: row.status,
    userId: row.user_id,
    redirectUrl: row.redirect_url,
    decision: row.decision,
    decisionSource: row.decision_source,
    metadata: (row.metadata && typeof row.metadata === "object" ? row.metadata : {}) as Record<
      string,
      unknown
    >,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    decidedAt: row.decided_at,
    expiresAt: row.expires_at,
  }
}

function parseApprovalTtlSec(): number {
  const raw = Number.parseInt(String(process.env.APPROVAL_TTL_SEC || ""), 10)
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_APPROVAL_TTL_SEC
  }
  return raw
}

function mapDecisionToStatus(decision: ApprovalDecision): ApprovalStatus {
  if (decision === "approve") return "approved"
  if (decision === "decline") return "declined"
  return "redirected"
}

function parseAllowlistHosts(): Set<string> {
  const hosts = new Set<string>()

  const configured = (process.env.APPROVAL_REDIRECT_ALLOWLIST || "")
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)

  for (const host of configured) {
    hosts.add(host)
  }

  try {
    hosts.add(new URL(LOGIN_REDIRECT_URL).hostname.toLowerCase())
  } catch {
    // keep empty
  }

  return hosts
}

export function getSafeRedirectUrl(candidate: string): string {
  const fallback = LOGIN_REDIRECT_URL
  const trimmed = candidate.trim()
  if (!trimmed) return fallback

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== "https:") {
      return fallback
    }
    const allowedHosts = parseAllowlistHosts()
    if (!allowedHosts.has(parsed.hostname.toLowerCase())) {
      return fallback
    }
    return parsed.toString()
  } catch {
    return fallback
  }
}

export function createApprovalToken(): string {
  return randomBytes(16).toString("base64url")
}

export function isValidApprovalToken(token: string): boolean {
  return TOKEN_REGEX.test(token)
}

export async function createApprovalState(input: {
  userId?: string
  redirectUrl?: string
  metadata?: Record<string, unknown>
}): Promise<ApprovalState> {
  const token = createApprovalToken()
  const ttlSec = parseApprovalTtlSec()
  const userId = (input.userId || "").trim() || null
  const redirectUrl = getSafeRedirectUrl(input.redirectUrl || LOGIN_REDIRECT_URL)
  const metadata = input.metadata || {}

  const query = `
    INSERT INTO approval_state (
      token,
      status,
      user_id,
      redirect_url,
      metadata,
      expires_at
    )
    VALUES ($1, 'pending', $2, $3, $4::jsonb, NOW() + ($5 * INTERVAL '1 second'))
    RETURNING
      token,
      status,
      user_id,
      redirect_url,
      decision,
      decision_source,
      metadata,
      created_at,
      updated_at,
      decided_at,
      expires_at
  `

  const pool = getDbPool()
  const result = await pool.query<DbApprovalState>(query, [
    token,
    userId,
    redirectUrl,
    JSON.stringify(metadata),
    ttlSec,
  ])

  return toApprovalState(result.rows[0])
}

export async function getApprovalState(token: string): Promise<ApprovalState | null> {
  if (!isValidApprovalToken(token)) return null

  const pool = getDbPool()
  const result = await pool.query<DbApprovalState>(
    `
      SELECT
        token,
        CASE
          WHEN status = 'pending' AND expires_at <= NOW() THEN 'expired'
          ELSE status
        END AS status,
        user_id,
        redirect_url,
        decision,
        decision_source,
        metadata,
        created_at,
        updated_at,
        decided_at,
        expires_at
      FROM approval_state
      WHERE token = $1
      LIMIT 1
    `,
    [token],
  )

  if (result.rows.length === 0) {
    return null
  }

  return toApprovalState(result.rows[0])
}

export async function updateApproval(
  token: string,
  decision: ApprovalDecision,
  source: string,
): Promise<UpdateApprovalResult> {
  if (!isValidApprovalToken(token)) {
    return { outcome: "unknown" }
  }

  const mappedStatus = mapDecisionToStatus(decision)
  const normalizedSource = source.trim() || "telegram"

  const pool = getDbPool()
  const updateResult = await pool.query<DbApprovalState>(
    `
      UPDATE approval_state
      SET
        status = $2,
        decision = $3,
        decision_source = $4,
        decided_at = NOW(),
        updated_at = NOW()
      WHERE token = $1
        AND status = 'pending'
        AND expires_at > NOW()
      RETURNING
        token,
        status,
        user_id,
        redirect_url,
        decision,
        decision_source,
        metadata,
        created_at,
        updated_at,
        decided_at,
        expires_at
    `,
    [token, mappedStatus, decision, normalizedSource],
  )

  if (updateResult.rows.length > 0) {
    return { outcome: "updated", state: toApprovalState(updateResult.rows[0]) }
  }

  const existing = await getApprovalState(token)
  if (!existing) {
    return { outcome: "unknown" }
  }

  if (existing.status === "pending" || existing.status === "expired") {
    return { outcome: "expired", state: existing }
  }

  return { outcome: "already_finalized", state: existing }
}
