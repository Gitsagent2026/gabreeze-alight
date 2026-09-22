import { NextRequest, NextResponse } from "next/server"
import { getApprovalState, isValidApprovalToken } from "@/lib/approval-state"

export async function GET(request: NextRequest) {
  const token = (request.nextUrl.searchParams.get("token") || "").trim()
  if (!token || !isValidApprovalToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  try {
    const state = await getApprovalState(token)
    if (!state) {
      return NextResponse.json({ error: "Approval token not found" }, { status: 404 })
    }

    return NextResponse.json({
      token: state.token,
      status: state.status,
      decision: state.decision,
      redirectUrl: state.status === "redirected" ? state.redirectUrl : null,
      expiresAt: state.expiresAt,
    })
  } catch (error) {
    console.error("Failed to read approval state", error)
    return NextResponse.json({ error: "Failed to read approval state" }, { status: 500 })
  }
}
