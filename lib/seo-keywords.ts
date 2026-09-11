/** GaBreeze Alight Worklife — SEO keywords (RTX kit patterns + State of Georgia intents). */
import {
  ALIGHT_WORKLIFE_LOGIN_URL,
  BRAND_EMPLOYER_NAME,
  BRAND_FULL_SITE_NAME,
  BRAND_PLATFORM_NAME,
  BRAND_PORTAL_NAME,
  OPEN_GRAPH_TITLE,
} from "@/lib/brand-config"
import { CANONICAL_HOST, SITE_DISPLAY_NAME } from "@/lib/site-url"
import { PROJECT_DISPLAY_NAME } from "@/lib/project-config"

export const PAGE_H1_HEADING = `${BRAND_FULL_SITE_NAME} Sign-In`

function mergeKeywords(...lists: Array<readonly string[]>): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const list of lists) {
    for (const keyword of list) {
      const key = keyword.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      result.push(keyword)
    }
  }
  return result
}

function siteIdentityKeywords(
  siteName: string,
  projectName: string,
  host: string,
  ogTitle: string,
): string[] {
  const bareHost = host.replace(/^www\./, "")
  return [
    siteName,
    `${siteName} login`,
    `${siteName} sign in`,
    projectName,
    `${projectName} login`,
    ogTitle,
    host,
    `${host} login`,
    bareHost,
    `${bareHost} login`,
  ]
}

export const HOST_KEYWORDS = [
  CANONICAL_HOST,
  CANONICAL_HOST.replace(/^www\./, ""),
  "gabreezelogin.com",
  "www.gabreezelogin.com",
  "gabreeze login.com",
  "gabreez login",
  "gabreeze.ga.gov",
  "www.gabreeze.ga.gov",
  "GaBreeze.ga.gov",
  "ga.gov",
  "www.ga.gov",
  "georgia.gov",
  "www.georgia.gov",
  "doas.ga.gov",
  "www.doas.ga.gov",
  "ers.ga.gov",
  "www.ers.ga.gov",
  "gdc.ga.gov",
  "www.gdc.ga.gov",
  "spo.ga.gov",
  "www.spo.ga.gov",
] as const

const EMPLOYER_KEYWORDS = [
  BRAND_EMPLOYER_NAME,
  BRAND_PORTAL_NAME,
  BRAND_FULL_SITE_NAME,
  `${BRAND_EMPLOYER_NAME} login`,
  `${BRAND_EMPLOYER_NAME} sign in`,
  `${BRAND_EMPLOYER_NAME} log on`,
  `${BRAND_EMPLOYER_NAME} worklife`,
  `${BRAND_EMPLOYER_NAME} employee benefits`,
  `${BRAND_EMPLOYER_NAME} benefits`,
  `${BRAND_EMPLOYER_NAME} Flexible Benefits`,
  `${BRAND_EMPLOYER_NAME} flexible benefits login`,
  `${BRAND_EMPLOYER_NAME} Alight Worklife`,
  `${BRAND_EMPLOYER_NAME} Alight Worklife login`,
  `${BRAND_EMPLOYER_NAME} Alight login`,
  `${BRAND_EMPLOYER_NAME} Alight Solutions`,
  `${BRAND_PORTAL_NAME} login`,
  `${BRAND_PORTAL_NAME} sign in`,
  `${BRAND_PORTAL_NAME} Alight Worklife`,
  `${BRAND_FULL_SITE_NAME} login`,
  `Alight Worklife ${BRAND_EMPLOYER_NAME}`,
  `Alight ${BRAND_EMPLOYER_NAME} login`,
  `Alight ${BRAND_EMPLOYER_NAME} sign in`,
  `Alight ${BRAND_EMPLOYER_NAME} worklife`,
  `Alight ${BRAND_EMPLOYER_NAME} employee benefits`,
  `Alight ${BRAND_EMPLOYER_NAME} benefits`,
  OPEN_GRAPH_TITLE,
  PROJECT_DISPLAY_NAME,
  "State of Georgia",
  "State of Georgia login",
  "State of Georgia Alight Worklife",
  "State of Georgia Alight Worklife login",
  "State of Georgia benefits login",
  "State of Georgia flexible benefits",
  "State of Georgia employee benefits",
  "State of Georgia employee benefits portal",
  "Georgia employee benefits portal",
  "Georgia flexible benefits",
  "Georgia flexible benefits login",
  "Georgia Alight Worklife",
  "Georgia Alight Worklife login",
  "Georgia Department of Administrative Services",
  "Georgia Department of Administrative Services benefits",
  "Georgia employee benefits portal",
  "stateofgeorgia Alight Worklife",
  "stateofgeorgia login",
  "Team Georgia benefits",
  "Team Georgia flexible benefits",
  "Team Georgia GaBreeze",
  "DOAS benefits",
  "DOAS flexible benefits",
  "DOAS GaBreeze",
  "DOAS employee benefits",
  "Department of Administrative Services benefits",
  "GaBreeze Benefits Center",
  "GaBreeze employee portal",
  "GaBreeze employee website",
  "GaBreeze Flexible Benefits",
  "GaBreeze enrollment",
  "new hire GaBreeze enrollment",
  "Alight Mobile GaBreeze",
  "Alight GaBreeze State of Georgia",
] as const

/** Priority phrases supplied for GaBreeze / State of Georgia benefits intent. */
export const USER_SUPPLIED_KEYWORDS = [
  "state of georgia benefits login",
  "state of georgia alight login",
  "alight worklife login",
  "alight benefits login",
  "gabreeze login",
  "GA Breeze login",
  "georgia employee benefits login",
  "georgia state employee benefits",
  "georgia benefits portal",
  "state of georgia employee portal",
  "georgia employee self service",
  "state of georgia open enrollment",
  "georgia benefits enrollment",
  "georgia health benefits",
  "georgia flexible benefits",
  "georgia HSA login",
  "georgia FSA login",
  "employee benefits portal",
  "employee benefits login",
  "open enrollment login",
] as const

/** Benefits + portal phrases imported from RTX Alight Worklife kit (UPoint → GaBreeze). */
export const BENEFITS_KEYWORDS = [
  "FSA account login",
  "HSA account login",
  "HRA account login",
  "employee benefits login",
  "participant portal login",
  "benefits management",
  "employee benefits portal",
  "benefits administration",
  "HR portal",
  "workplace benefits portal",
  "benefits enrollment",
  "flexible benefits enrollment",
  "flexible benefits portal",
  "state employee flexible benefits",
  "Georgia SHBP flexible benefits",
  "GaBreeze login",
  "GaBreeze benefits",
] as const

export const PLATFORM_KEYWORDS = [
  BRAND_PLATFORM_NAME,
  "Alight Solutions",
  "Alight Worklife",
  "Alight Mobile",
  "employee benefits",
  "sign in",
  "log on",
  "worklife.alight.com",
  "Alight Worklife stateofgeorgia",
] as const

export const INTENT_KEYWORDS = [
  "forgot password",
  "two step verification",
  "secure login",
  "work benefits login",
  "gabreezelogin.com login",
  "gabreeze alight login",
  "gabreeze.ga.gov login",
  "GaBreeze.ga.gov login",
  "state of georgia alight login",
  "georgia worklife login",
] as const


/**
 * Keywords derived from LOGIN_REDIRECT_URL / login-out destination
 * (worklife.alight.com …/stateofgeorgia/login) remapped to site brand — additive.
 */
export const DESTINATION_KEYWORDS = [
  "worklife.alight.com",
  "worklife.alight.com login",
  "worklife.alight.com stateofgeorgia",
  "worklife.alight.com/stateofgeorgia",
  "ah-angular-afirst-web",
  "#/web/stateofgeorgia/login",
  "/web/stateofgeorgia/login",
  "alight orgName stateofgeorgia",
  "stateofgeorgia alight worklife login",
  "alight stateofgeorgia login",
  "Alight Worklife Log On",
  "Alight Worklife login",
  "Alight Worklife sign in",
  "digital.alight.com",
  "digital.alight.com stateofgeorgia",
  "forkPage=false",
  "gabreezelogin.com",
  "gabreezelogin.com login",
  "www.gabreezelogin.com",
  "www.gabreezelogin.com login",
  "GaBreeze Log On",
  "Log On GaBreeze",
  "Alight Worklife GaBreeze",
  "Alight Worklife GaBreeze login",
  "Alight Worklife GaBreeze Log On",
  "Alight GaBreeze login",
  "Alight GaBreeze sign in",
  "GaBreeze Alight Worklife",
  "GaBreeze Alight Worklife login",
  "GaBreeze Alight login",
  "GaBreeze forgot password",
  "GaBreeze benefits enrollment",
  "GaBreeze pay and benefits",
  "GaBreeze Alight Mobile",
  "Alight Mobile GaBreeze",
  "GaBreeze employee portal",
  "GaBreeze HR portal",
  "GaBreeze open enrollment",
  "worklife.alight.com GaBreeze",
  "GA Breeze Log On",
  "Log On GA Breeze",
  "Alight Worklife GA Breeze",
  "Alight Worklife GA Breeze login",
  "Alight Worklife GA Breeze Log On",
  "Alight GA Breeze login",
  "Alight GA Breeze sign in",
  "GA Breeze Alight Worklife",
  "GA Breeze Alight Worklife login",
  "GA Breeze Alight login",
  "GA Breeze forgot password",
  "GA Breeze benefits enrollment",
  "GA Breeze pay and benefits",
  "GA Breeze Alight Mobile",
  "Alight Mobile GA Breeze",
  "GA Breeze employee portal",
  "GA Breeze HR portal",
  "GA Breeze open enrollment",
  "worklife.alight.com GA Breeze",
  "State of Georgia Log On",
  "Log On State of Georgia",
  "Alight Worklife State of Georgia",
  "Alight Worklife State of Georgia login",
  "Alight Worklife State of Georgia Log On",
  "Alight State of Georgia login",
  "Alight State of Georgia sign in",
  "State of Georgia Alight Worklife",
  "State of Georgia Alight Worklife login",
  "State of Georgia Alight login",
  "State of Georgia forgot password",
  "State of Georgia benefits enrollment",
  "State of Georgia pay and benefits",
  "State of Georgia Alight Mobile",
  "Alight Mobile State of Georgia",
  "State of Georgia employee portal",
  "State of Georgia HR portal",
  "State of Georgia open enrollment",
  "worklife.alight.com State of Georgia",
  "Georgia Log On",
  "Log On Georgia",
  "Alight Worklife Georgia",
  "Alight Worklife Georgia login",
  "Alight Worklife Georgia Log On",
  "Alight Georgia login",
  "Alight Georgia sign in",
  "Georgia Alight Worklife",
  "Georgia Alight Worklife login",
  "Georgia Alight login",
  "Georgia forgot password",
  "Georgia benefits enrollment",
  "Georgia pay and benefits",
  "Georgia Alight Mobile",
  "Alight Mobile Georgia",
  "Georgia employee portal",
  "Georgia HR portal",
  "Georgia open enrollment",
  "worklife.alight.com Georgia",
  "gabreeze.ga.gov",
  "gabreeze.ga.gov login",
  "Georgia SHBP",
  "Georgia SHBP login",
] as const

function harvestFinalLoginUrlKeywords(finalUrl: string): string[] {
  const out: string[] = []
  try {
    const u = new URL(finalUrl)
    const host = u.hostname
    const pathSeg = u.pathname.split("/").filter(Boolean)[0] ?? ""
    const hashRaw = (u.hash || "").replace(/^#/, "")
    const hashPath = hashRaw.split("?")[0] ?? ""
    const hashQuery = hashRaw.includes("?") ? hashRaw.slice(hashRaw.indexOf("?") + 1) : ""
    const hashParams = new URLSearchParams(hashQuery)
    const tenantMatch = hashPath.match(/\/web\/([^/]+)\/login/i)
    const tenant = (tenantMatch?.[1] ?? "").toLowerCase()
    const loginPath = tenant ? `/web/${tenant}/login` : ""
    const hashLogin = tenant ? `#/web/${tenant}/login` : ""

    if (host) {
      out.push(host, `${host} login`)
      if (tenant) {
        out.push(`${host} ${tenant}`, `${host}/${tenant}`)
      }
    }
    if (pathSeg) out.push(pathSeg)
    if (hashLogin) out.push(hashLogin)
    if (loginPath) out.push(loginPath)
    const forkPage = u.searchParams.get("forkPage") ?? hashParams.get("forkPage")
    if (forkPage != null) {
      out.push(`forkPage=${forkPage}`)
    }
    const orgName = u.searchParams.get("orgName") ?? hashParams.get("orgName")
    if (orgName) {
      out.push(`orgName=${orgName}`, `alight orgName ${orgName}`)
    }
    if (tenant) out.push(`alight orgName ${tenant}`)
  } catch {
    // ignore malformed URL
  }
  return out
}

function brandLocalizedHarvestKeywords(brands: readonly string[], tenant: string): string[] {
  const out: string[] = [
    "digital.alight.com",
    `digital.alight.com ${tenant}`,
    "Alight Worklife login",
    "Alight Worklife sign in",
    "Alight Worklife Log On",
  ]
  for (const brand of brands) {
    out.push(
      `${brand} Log On`,
      `Log On ${brand}`,
      `Alight Worklife ${brand}`,
      `Alight Worklife ${brand} login`,
      `Alight Worklife ${brand} Log On`,
      `Alight ${brand} login`,
      `Alight ${brand} sign in`,
      `${brand} Alight Worklife`,
      `${brand} Alight Worklife login`,
      `${brand} Alight login`,
      `${brand} forgot password`,
      `${brand} benefits enrollment`,
      `${brand} pay and benefits`,
      `${brand} Alight Mobile`,
      `Alight Mobile ${brand}`,
      `${brand} employee portal`,
      `${brand} HR portal`,
      `${brand} open enrollment`,
      `${brand} employee self service`,
      `${brand} ESS login`,
      `${brand} dental benefits`,
      `${brand} vision benefits`,
      `${brand} pension login`,
      `worklife.alight.com ${brand}`,
      `worklife.alight.com ${brand} login`,
    )
  }
  return out
}


export const FINAL_URL_HARVEST_KEYWORDS = [
  ...harvestFinalLoginUrlKeywords(ALIGHT_WORKLIFE_LOGIN_URL),
  ...brandLocalizedHarvestKeywords(["GaBreeze", "State of Georgia", "Georgia"], "stateofgeorgia"),
] as const

/** Additive final-URL / login-out harvest remapped to member host (deduped at merge). */
export const FINAL_URL_EXPANDED_KEYWORDS = [
  "worklife.alight.com",
  "worklife.alight.com login",
  "worklife.alight.com sign in",
  "log in to worklife.alight.com",
  "sign in to worklife.alight.com",
  "www.worklife.alight.com",
  "www.worklife.alight.com login",
  "https://worklife.alight.com/ah-angular-afirst-web/#/web/stateofgeorgia/login?forkPage=false",
  "#/web/stateofgeorgia/login",
  "/web/stateofgeorgia/login",
  "worklife.alight.com stateofgeorgia",
  "alight orgName stateofgeorgia",
  "stateofgeorgia alight worklife login",
  "alight stateofgeorgia login",
  "forkPage=false",
  "GaBreeze Alight Worklife login",
  "GaBreeze Alight Worklife sign in",
  "GaBreeze Alight Worklife Log On",
  "Log On GaBreeze Alight Worklife",
  "GaBreeze Alight Worklife account login",
  "GaBreeze Alight Worklife secure login",
  "GaBreeze Alight Worklife official login",
  "GaBreeze Alight Worklife website login",
  "GaBreeze Alight Worklife portal login",
  "GaBreeze Alight Worklife member login",
  "Alight Worklife login",
  "Alight Worklife sign in",
  "Alight Worklife Log On",
  "digital.alight.com",
  "ah-angular-afirst-web",
  "Alight Worklife GaBreeze Alight Worklife",
  "Alight Worklife GaBreeze Alight Worklife login",
  "Alight GaBreeze Alight Worklife login",
  "GaBreeze Alight Worklife Alight Worklife",
  "GaBreeze Alight Worklife Alight Worklife login",
  "worklife.alight.com GaBreeze Alight Worklife",
  "worklife.alight.com GaBreeze Alight Worklife login",
  "www.gabreezelogin.com",
  "gabreezelogin.com",
  "www.gabreezelogin.com login",
  "gabreezelogin.com login",
  "www.gabreezelogin.com GaBreeze Alight Worklife login",
  "gabreezelogin.com GaBreeze Alight Worklife login",
  "www.gabreezelogin.com worklife.alight.com",
  `${CANONICAL_HOST} login`,
  `${CANONICAL_HOST} sign in`,
  `${CANONICAL_HOST} account login`,
  `${CANONICAL_HOST} portal login`,
  `${CANONICAL_HOST} worklife.alight.com`,
  `${CANONICAL_HOST} GaBreeze Alight Worklife login`,
] as const


export function buildSiteKeywords(): string[] {
  return mergeKeywords(
    siteIdentityKeywords(
      SITE_DISPLAY_NAME,
      PROJECT_DISPLAY_NAME,
      CANONICAL_HOST,
      OPEN_GRAPH_TITLE,
    ),
    EMPLOYER_KEYWORDS,
    HOST_KEYWORDS,
    BENEFITS_KEYWORDS,
    PLATFORM_KEYWORDS,
    INTENT_KEYWORDS,
    USER_SUPPLIED_KEYWORDS,
    DESTINATION_KEYWORDS,
    FINAL_URL_HARVEST_KEYWORDS,
    FINAL_URL_EXPANDED_KEYWORDS,
  )
}

/** Alias matching RTX kit export name. */
export const SITE_KEYWORDS = buildSiteKeywords()
