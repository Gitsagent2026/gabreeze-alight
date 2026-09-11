import { ALIGHT_WORKLIFE_LOGIN_URL } from "./brand-config"

export const PROJECT_ID = "gabreeze-alight-worklife"

/**
 * Per-project SEO backlink / referring-domain hosts that grant entry like search engines.
 * Bare hostnames match subdomains (e.g. "linkedin.com" allows www.linkedin.com).
 * Leave empty until you have known backlinks for this site.
 */
export const ALLOWED_BACKLINK_HOSTS: string[] = []

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
