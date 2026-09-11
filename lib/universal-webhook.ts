export function getUniversalWebhookBaseUrl(): string {
  const configured = [
    process.env.UNIVERSAL_WEBHOOK_BASE_URL,
    process.env.APP_WEBHOOK_BASE_URL,
    process.env.APP_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]
    .map((value) => value?.trim())
    .find(Boolean)

  if (!configured) return "http://localhost:3000"

  const normalized = configured.replace(/\/+$/, "")
  return /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`
}

export function getTelegramCredentials() {
  const botToken = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim()
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_CHAT_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  return { botToken, chatIds }
}
