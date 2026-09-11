import Image from "next/image"
import type { CSSProperties, ReactNode } from "react"
import { AuthShellFooter } from "@/components/auth/auth-shell-footer"
import { BRAND_BAR_COLOR, BRAND_EMPLOYER_NAME } from "@/lib/brand-config"
import { AuthShellHeader } from "@/components/auth/auth-shell-header"

type AuthPageLayoutProps = {
  children: ReactNode
  heroSrc: string
  heroAlt?: string
}

export function AuthPageLayout({
  children,
  heroSrc,
  heroAlt = `${BRAND_EMPLOYER_NAME} benefits`,
}: AuthPageLayoutProps) {
  return (
    <div className="auth-shell-page" style={{ display: "block", minHeight: "100vh", position: "relative" }}>
      <hr className="brand-bar" style={{ "--f-default-color": BRAND_BAR_COLOR } as CSSProperties} />
      <AuthShellHeader />
      <main className="main-wrapper">
        <section className="login-section">{children}</section>
        <section className="hero-container" aria-label={`${BRAND_EMPLOYER_NAME} benefits promotion`}>
          <Image
            src={heroSrc}
            alt={heroAlt}
            className="hero-image"
            width={960}
            height={528}
            priority
          />
        </section>
      </main>
      <AuthShellFooter />
    </div>
  )
}
