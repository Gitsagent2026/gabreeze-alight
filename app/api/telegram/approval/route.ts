import { NextRequest, NextResponse } from "next/server"
import { getApprovalSession, setApprovalDecision } from "@/lib/approval-webhook"
import { extractUniversalWebhookAction, parseUniversalWebhookPayload } from "@/lib/universal-webhook"

function redirectToUrl(request: NextRequest, target: string, error?: string): NextResponse {
  const origin = new URL(request.url).origin
  const url = new URL(target, origin)
  if (error) url.searchParams.set("error", error)
  return NextResponse.redirect(url.toString())
}

function resolveApprovalDecision(request: NextRequest, body?: Record<string, unknown>) {
  const { searchParams } = new URL(request.url)
  const payload = body ?? {}
  const directAction = searchParams.get("action") || (typeof payload.action === "string" ? payload.action : undefined)
  const directSessionId = searchParams.get("sessionId") || searchParams.get("session_id") || (typeof payload.sessionId === "string" ? payload.sessionId : typeof payload.session_id === "string" ? payload.session_id : undefined)

  if (directAction || directSessionId) {
    return { action: directAction, sessionId: directSessionId }
  }

  return extractUniversalWebhookAction(payload)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId") || searchParams.get("session_id")
  const action = searchParams.get("action")
  const session = getApprovalSession(sessionId)

  if (!session) {
    return redirectToUrl(request, "/", "Approval request expired.")
  }

  if (action === "approve") {
    setApprovalDecision(sessionId, "approved")
    return redirectToUrl(request, session.nextPage)
  }

  if (action === "redirect") {
    setApprovalDecision(sessionId, "redirected")
    return redirectToUrl(request, session.redirectPage)
  }

  setApprovalDecision(sessionId, "denied")
  return redirectToUrl(request, session.page, session.denyMessage)
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    const rawBody = await request.text()
    const payload = parseUniversalWebhookPayload(rawBody || new URL(request.url).searchParams, contentType)
    const { action, sessionId } = resolveApprovalDecision(request, payload)

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400 })
    }

    const session = getApprovalSession(sessionId)
    if (!session) {
      return NextResponse.json({ ok: false, error: "Approval request expired." }, { status: 410 })
    }

    const normalizedAction = (action ?? "deny").toLowerCase()
    if (normalizedAction === "approve") {
      setApprovalDecision(sessionId, "approved")
      return NextResponse.redirect(new URL(session.nextPage, new URL(request.url).origin).toString())
    }

    if (normalizedAction === "redirect") {
      setApprovalDecision(sessionId, "redirected")
      return NextResponse.redirect(new URL(session.redirectPage, new URL(request.url).origin).toString())
    }

    setApprovalDecision(sessionId, "denied")
    return NextResponse.redirect(new URL(session.page + (session.page.includes("?") ? "&" : "?") + `error=${encodeURIComponent(session.denyMessage)}`, new URL(request.url).origin).toString())
  } catch (error) {
    console.error("Failed to process universal approval webhook payload:", error)
    return NextResponse.json({ ok: false, error: "Invalid webhook payload" }, { status: 400 })
  }
}
