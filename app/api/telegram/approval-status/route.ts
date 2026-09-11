import { NextRequest, NextResponse } from "next/server"
import { getApprovalSession } from "@/lib/approval-webhook"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")
  const session = getApprovalSession(sessionId)

  if (!session) {
    return NextResponse.json({ status: "missing" }, { status: 404 })
  }

  return NextResponse.json({
    status: session.status,
    nextPage: session.nextPage,
    redirectPage: session.redirectPage,
    denyMessage: session.denyMessage,
    timeoutMessage: session.timeoutMessage,
  })
}
