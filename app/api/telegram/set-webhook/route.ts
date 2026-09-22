import { NextRequest, NextResponse } from "next/server"
import { registerTelegramWebhook } from "@/lib/telegram"

function resolveBaseUrl(request: NextRequest, bodyBaseUrl?: string): string {
  const fromBody = (bodyBaseUrl || "").trim()
  if (fromBody) return fromBody

  const fromEnv = (process.env.APP_BASE_URL || "").trim()
  if (fromEnv) return fromEnv

  return request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const baseUrl = resolveBaseUrl(request, body?.baseUrl)
    const webhookUrl = new URL("/api/telegram/webhook", baseUrl).toString()

    const result = await registerTelegramWebhook(webhookUrl)
    if (!result.ok) {
      return NextResponse.json({ error: result.description || "Failed to set webhook" }, { status: 502 })
    }

    return NextResponse.json({ ok: true, webhookUrl })
  } catch (error) {
    console.error("Failed to set Telegram webhook", error)
    return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 })
  }
}
