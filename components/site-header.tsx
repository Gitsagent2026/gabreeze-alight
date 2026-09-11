"use client"

import Link from "next/link"
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand-config"
import { restartFromGate } from "@/lib/restart-gate"

export function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-8 lg:px-12 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center" onClick={restartFromGate}>
            <img src={BRAND_LOGO_SRC} alt={BRAND_LOGO_ALT} className="h-10 w-auto object-contain" />
          </Link>
        </div>
      </div>
    </header>
  )
}
