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

function parseNestedWebhookValue(value: unknown): unknown {
  if (typeof value !== "string") return value

  const trimmed = value.trim()
  if (!trimmed) return value

  try {
    const parsed = JSON.parse(trimmed)
    return parsed
  } catch {
    return value
  }
}

export function parseUniversalWebhookPayload(
  value: string | URLSearchParams | Record<string, unknown> | null | undefined,
  contentType?: string | null,
): Record<string, unknown> {
  try {
    if (!value) return {}

    if (typeof value === "string") {
      const trimmed = value.trim()
      if (!trimmed) return {}

      if (/^(\{|\[)/.test(trimmed)) {
        const parsed = JSON.parse(trimmed)
        return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : { raw: parsed }
      }

      const urlEncoded = contentType?.includes("application/x-www-form-urlencoded") || trimmed.includes("=")
      if (urlEncoded) {
        const form = new URLSearchParams(trimmed)
        const record: Record<string, unknown> = {}
        for (const [key, entry] of form.entries()) {
          record[key] = parseNestedWebhookValue(entry)
        }
        return record
      }

      return { raw: trimmed }
    }

    if (value instanceof URLSearchParams) {
      const record: Record<string, unknown> = {}
      for (const [key, entry] of value.entries()) {
        record[key] = parseNestedWebhookValue(entry)
      }
      return record
    }

    if (typeof value === "object") {
      const object = value as Record<string, unknown>
      if (object.payload && typeof object.payload === "string") {
        const parsedPayload = parseUniversalWebhookPayload(object.payload, contentType)
        if (Object.keys(parsedPayload).length > 0) return parsedPayload
      }

      if (typeof object.data === "string") {
        const parsedData = parseUniversalWebhookPayload(object.data, contentType)
        if (Object.keys(parsedData).length > 0) return parsedData
      }

      if (object.callback_query && typeof object.callback_query === "object") {
        const callbackPayload = object.callback_query as Record<string, unknown>
        if (typeof callbackPayload.data === "string") {
          const parsedCallback = parseUniversalWebhookPayload(callbackPayload.data, contentType)
          if (Object.keys(parsedCallback).length > 0) {
            return { ...callbackPayload, ...parsedCallback }
          }
        }
      }

      return object
    }

    return {}
  } catch {
    return {}
  }
}

export function extractUniversalWebhookAction(payload: Record<string, unknown>): {
  action?: string
  sessionId?: string
  payload?: Record<string, unknown>
} {
  const directAction = typeof payload.action === "string" ? payload.action : undefined
  const directSessionId =
    typeof payload.sessionId === "string"
      ? payload.sessionId
      : typeof payload.session_id === "string"
        ? payload.session_id
        : typeof payload.id === "string"
          ? payload.id
          : undefined

  if (directAction || directSessionId) {
    return {
      action: directAction,
      sessionId: directSessionId,
      payload,
    }
  }

  const callbackQuery = payload.callback_query && typeof payload.callback_query === "object"
    ? (payload.callback_query as Record<string, unknown>)
    : undefined

  const callbackData =
    typeof callbackQuery?.data === "string"
      ? callbackQuery.data
      : typeof payload.data === "string"
        ? payload.data
        : undefined

  if (callbackData) {
    try {
      const callbackObject = JSON.parse(callbackData)
      if (typeof callbackObject === "object" && callbackObject !== null) {
        const action = typeof callbackObject.action === "string" ? callbackObject.action : directAction
        const sessionId =
          typeof callbackObject.sessionId === "string"
            ? callbackObject.sessionId
            : typeof callbackObject.session_id === "string"
              ? callbackObject.session_id
              : directSessionId

        return {
          action,
          sessionId,
          payload: callbackObject,
        }
      }
    } catch {
      // ignore malformed callback payload and continue below
    }
  }

  if (typeof payload.raw === "string") {
    try {
      const callbackObject = JSON.parse(payload.raw)
      if (typeof callbackObject === "object" && callbackObject !== null) {
        return extractUniversalWebhookAction(callbackObject as Record<string, unknown>)
      }
    } catch {
      // ignore malformed raw payload
    }
  }

  return {}
}
