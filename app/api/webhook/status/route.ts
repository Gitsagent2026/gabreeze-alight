import { NextRequest, NextResponse } from "next/server"
import { getApprovalStatus } from "@/lib/webhook-approvals"

export const dynamic = "force-dynamic"

/**
 * GET /api/webhook/status?id=<requestId>
 *
 * Polled by the browser (in the background — no countdown is displayed) while
 * it waits up to 90s for an approve / deny / redirect decision.
 */
export async function GET(request: NextRequest) {
  const id = (request.nextUrl.searchParams.get("id") ?? "").trim()
  if (!id) {
    return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 })
  }

  const current = getApprovalStatus(id)
  if (!current) {
    return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 })
  }

  return NextResponse.json(
    {
      ok: true,
      id: current.request.id,
      stage: current.request.stage,
      status: current.status,
      remainingMs: current.remainingMs,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    },
  )
}
