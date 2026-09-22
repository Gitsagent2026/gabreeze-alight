import { NextRequest, NextResponse } from "next/server"
import { type ApprovalDecision, updateApproval } from "@/lib/approval-state"
import { answerTelegramCallbackQuery } from "@/lib/telegram"

const CALLBACK_REGEX = /^(approve|decline|redirect):([A-Za-z0-9_-]{10,64})$/

function isWebhookAuthorized(request: NextRequest): boolean {
  const expectedSecret = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim()
  if (!expectedSecret) return true
  return request.headers.get("x-telegram-bot-api-secret-token") === expectedSecret
}

function decisionText(decision: ApprovalDecision): string {
  if (decision === "approve") return "Approved"
  if (decision === "decline") return "Declined"
  return "Redirected"
}

export async function POST(request: NextRequest) {
  if (!isWebhookAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const update = await request.json().catch(() => null)
  const callbackQuery = update?.callback_query
  if (!callbackQuery || typeof callbackQuery !== "object") {
    return NextResponse.json({ ok: true })
  }

  const callbackQueryId = String(callbackQuery.id || "")
  const callbackData = String(callbackQuery.data || "")

  const parsed = CALLBACK_REGEX.exec(callbackData)
  if (!parsed) {
    await answerTelegramCallbackQuery(callbackQueryId, "Invalid approval request")
    return NextResponse.json({ ok: true })
  }

  const decision = parsed[1] as ApprovalDecision
  const token = parsed[2]

  try {
    const result = await updateApproval(token, decision, "telegram")

    if (result.outcome === "updated") {
      await answerTelegramCallbackQuery(callbackQueryId, `${decisionText(decision)} successfully`)
      return NextResponse.json({ ok: true })
    }

    if (result.outcome === "already_finalized") {
      await answerTelegramCallbackQuery(callbackQueryId, "This request is already finalized")
      return NextResponse.json({ ok: true })
    }

    if (result.outcome === "expired") {
      await answerTelegramCallbackQuery(callbackQueryId, "This request has expired")
      return NextResponse.json({ ok: true })
    }

    await answerTelegramCallbackQuery(callbackQueryId, "Unknown request")
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to process Telegram callback", error)
    await answerTelegramCallbackQuery(callbackQueryId, "Failed to process decision")
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
