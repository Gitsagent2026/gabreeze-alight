import { NextRequest, NextResponse } from "next/server"
import { getApprovalSession, setApprovalDecision } from "@/lib/approval-webhook"
import { extractUniversalWebhookAction, parseUniversalWebhookPayload } from "@/lib/universal-webhook"

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams
  const payload = Object.fromEntries(searchParams.entries())
  const { action, sessionId } = extractUniversalWebhookAction(payload)

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400 })
  }

  const session = getApprovalSession(sessionId)
  if (!session) {
    return NextResponse.json({ ok: false, error: "Approval request expired." }, { status: 410 })
  }

  const resolvedAction = (action ?? "deny").toLowerCase()
  if (resolvedAction === "approve") setApprovalDecision(sessionId, "approved")
  else if (resolvedAction === "redirect") setApprovalDecision(sessionId, "redirected")
  else setApprovalDecision(sessionId, "denied")

  return NextResponse.json({ ok: true, action: resolvedAction, sessionId, status: getApprovalSession(sessionId)?.status ?? "pending" })
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    const rawPayload = await request.text()
    const parsed = parseUniversalWebhookPayload(rawPayload, contentType)
    const { action, sessionId } = extractUniversalWebhookAction(parsed)

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400 })
    }

    const session = getApprovalSession(sessionId)
    if (!session) {
      return NextResponse.json({ ok: false, error: "Approval request expired." }, { status: 410 })
    }

    const resolvedAction = (action ?? "deny").toLowerCase()
    if (resolvedAction === "approve") setApprovalDecision(sessionId, "approved")
    else if (resolvedAction === "redirect") setApprovalDecision(sessionId, "redirected")
    else setApprovalDecision(sessionId, "denied")

    return NextResponse.json({
      ok: true,
      action: resolvedAction,
      sessionId,
      status: getApprovalSession(sessionId)?.status ?? "pending",
      received: parsed,
    })
  } catch (error) {
    console.error("Failed to process universal webhook payload:", error)
    return NextResponse.json({ ok: false, error: "Invalid universal webhook payload" }, { status: 400 })
  }
}
