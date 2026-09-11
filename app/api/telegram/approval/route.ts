import { NextRequest, NextResponse } from "next/server"
import { getApprovalSession, setApprovalDecision } from "@/lib/approval-webhook"

function redirectToUrl(request: NextRequest, target: string, error?: string): NextResponse {
  const origin = new URL(request.url).origin
  const url = new URL(target, origin)
  if (error) url.searchParams.set("error", error)
  return NextResponse.redirect(url.toString())
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")
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
