"use client"

import Image from "next/image"
import Link from "next/link"
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand-config"
import { restartFromGate } from "@/lib/restart-gate"

export function AuthShellHeader() {
  return (
    <header className="global-header" role="banner">
      <div className="header-content">
        <div className="header-left">
          {/* Mobile menu hidden — restore via docs/HIDDEN-auth-shell-header-mobile-menu.md */}
          <div className="brand-container">
            <Link href="/" aria-label={`${BRAND_LOGO_ALT} benefits home`} onClick={restartFromGate}>
              <Image
                src={BRAND_LOGO_SRC}
                alt={BRAND_LOGO_ALT}
                className="brand-logo"
                width={246}
                height={113}
                priority
              />
            </Link>
          </div>
        </div>
        {/* Header search hidden — restore via docs/HIDDEN-auth-shell-header-search.md */}
      </div>
    </header>
  )
}
