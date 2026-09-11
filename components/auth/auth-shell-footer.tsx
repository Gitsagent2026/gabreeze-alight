import Image from "next/image"

const FOOTER_NAV_COLUMN_A = [
  { id: "contact", label: "Contact Us", href: "/api/login-out", title: "Contact Us" },
  { id: "feedback", label: "Feedback", href: "/api/login-out", title: "Choose this link to review this site's feedback information." },
  {
    id: "fraud",
    label: "Protect Yourself From Website Fraud",
    href: "/api/login-out",
    title: "Choose this link to review this site's protect yourself from website fraud information.",
  },
] as const

const FOOTER_LEGAL_LINKS = [
  { id: "privacy", label: "Privacy Policy", href: "/api/login-out" },
  { id: "terms", label: "Terms Of Use", href: "/api/login-out" },
  { id: "cookies", label: "Cookie Notice", href: "/api/login-out" },
  {
    id: "cookie-settings",
    label: "Cookie Settings [Do Not Sell or Share My Personal Information]",
    href: "/api/login-out",
  },
] as const

function FooterNavColumn({
  items,
}: {
  items: readonly { id: string; label: string; href: string; title?: string }[]
}) {
  return (
    <div className="f-footer-nav-column">
      <ul className="f-footer-nav-list">
        {items.map((item) => (
          <li key={item.id} className="f-footer-nav-item">
            <div className="wlf-footer-listitem">
              <a href={item.href} className="f-footer-nav-link" title={item.title}>
                {item.label}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AuthShellFooter() {
  return (
    <footer className="f-global-footer" role="contentinfo">
      <div className="f-global-footer-inner">
        <div className="f-footer-row f-footer-row-main">
          <div className="f-footer-nav-columns" style={{ display: 'flex', gap: '32px' }}>
            <FooterNavColumn items={FOOTER_NAV_COLUMN_A} />
          </div>

          <div className="f-footer-brand-block">
            <a href="#" className="f-footer-logo-link" aria-label="Alight.com home">
              <Image
                src="/alight_worklife__logo_black_2x.png"
                alt="Alight Worklife"
                className="f-footer-logo"
                width={230}
                height={40}
              />
            </a>
            <div className="f-footer-app-badges">
              <a href="#" className="f-footer-app-link" aria-label="Download on the App Store">
                <Image
                  src="/app-store-badge.png"
                  alt="Download on the App Store"
                  className="f-footer-app-badge"
                  width={135}
                  height={40}
                />
              </a>
              <a href="#" className="f-footer-app-link" aria-label="Get it on Google Play">
                <Image
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  className="f-footer-app-badge"
                  width={135}
                  height={40}
                />
              </a>
            </div>
          </div>
        </div>

        <div className="f-footer-divider-wrap">
          <hr className="f-divider f-divider-horizontal f-divider-neutral-mountain-mist" />
        </div>

        <div className="f-footer-row f-footer-row-legal">
          <div className="f-footer-legal-links">
            {FOOTER_LEGAL_LINKS.map((item) => (
              <span key={item.id} className="f-footer-legal-item">
                <a href={item.href} className="f-footer-legal-link">
                  {item.label}
                </a>
              </span>
            ))}
          </div>
          <p className="f-footer-copyright">©2026 Alight Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
