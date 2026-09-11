import { ALIGHT_WORKLIFE_LOGIN_URL } from "./brand-config"

export const PROJECT_ID = "gabreeze-alight-worklife"

/**
 * Authority domains / backlink hosts for the GaBreeze / State of Georgia benefits ecosystem.
 * These match the official public-facing benefits and state resources that reinforce the
 * GaBreeze brand and improve trust for search indexing and referral quality.
 */
export const ALLOWED_BACKLINK_HOSTS: string[] = [
  "ga.gov",
  "gabreeze.ga.gov",
  "www.gabreeze.ga.gov",
  "doas.ga.gov",
  "spo.ga.gov",
  "gdc.ga.gov",
  "ers.ga.gov",
  "georgia.gov",
  "www.ers.ga.gov",
  "www.doas.ga.gov",
]

export const OFFICIAL_BACKLINK_URLS = [
  "https://gabreeze.ga.gov/",
  "https://www.gabreeze.ga.gov/",
  "https://doas.ga.gov/",
  "https://www.doas.ga.gov/",
  "https://georgia.gov/",
  "https://www.ers.ga.gov/",
  "https://hrweb.spo.ga.gov/",
  "https://www.gdc.ga.gov/",
] as const

export const PROJECT_DISPLAY_NAME = "GaBreeze Alight Worklife"

export const DEFAULT_PROJECT_ID = PROJECT_ID

export const LOGIN_REDIRECT_URL = ALIGHT_WORKLIFE_LOGIN_URL

export function getApprovalsUrl(): string {
  const adminUrlBase = (process.env.ADMIN_PORTAL_URL || "").trim()
  if (!adminUrlBase) return "/admin/login"
  return adminUrlBase
    .replace(/\/+$/, "")
    .replace(/\/admin\/login.*$/i, "")
    .replace(/\?.*$/, "")
}
