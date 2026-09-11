import {
  BRAND_EMPLOYER_NAME,
  BRAND_FULL_SITE_NAME,
  BRAND_PORTAL_NAME,
  OPEN_GRAPH_TITLE,
} from "@/lib/brand-config"
import { LAYOUT_DESCRIPTION } from "@/lib/meta-description"
import { OFFICIAL_BACKLINK_URLS } from "@/lib/project-config"
import { SITE_TITLE } from "@/lib/seo-metadata"
import {
  CANONICAL_HOST,
  SITE_DISPLAY_NAME,
  SITE_HOMEPAGE_CANONICAL,
  SITE_ORIGIN,
  ogImageAbsoluteUrl,
} from "@/lib/site-url"

const SCHEMA_ALTERNATE_NAMES = [
  OPEN_GRAPH_TITLE,
  SITE_TITLE,
  BRAND_FULL_SITE_NAME,
  `${BRAND_FULL_SITE_NAME} login`,
  `${BRAND_EMPLOYER_NAME} Flexible Benefits`,
  `${BRAND_EMPLOYER_NAME} State of Georgia`,
  "State of Georgia Alight Worklife",
  `${BRAND_PORTAL_NAME} login`,
  `${BRAND_EMPLOYER_NAME} Alight Worklife`,
  "gabreeze.ga.gov",
  CANONICAL_HOST.toLowerCase(),
] as const

/** JSON-LD structured data for SEO (WebSite + Organization). */
export function SeoJsonLd() {
  const logoUrl = ogImageAbsoluteUrl()
  const sameAs = Array.from(new Set([SITE_ORIGIN, ...OFFICIAL_BACKLINK_URLS]))

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_DISPLAY_NAME,
    alternateName: [...SCHEMA_ALTERNATE_NAMES],
    description: LAYOUT_DESCRIPTION,
    url: SITE_HOMEPAGE_CANONICAL,
    sameAs,
    publisher: {
      "@type": "Organization",
      name: SITE_DISPLAY_NAME,
      url: SITE_ORIGIN,
      logo: logoUrl,
      sameAs,
    },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "LoginAction",
      target: {
        "@type": "EntryPoint",
        url: SITE_HOMEPAGE_CANONICAL,
      },
      name: `Sign in to ${SITE_DISPLAY_NAME}`,
    },
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_DISPLAY_NAME,
    url: SITE_ORIGIN,
    logo: logoUrl,
    sameAs,
    description: LAYOUT_DESCRIPTION,
  }

  const combined = [websiteSchema, organizationSchema]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(combined) }}
    />
  )
}
