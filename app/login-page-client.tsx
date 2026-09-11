"use client"

import { useMemo } from "react"
import { AuthPageLayout } from "@/components/auth/auth-page-layout"
import { UserIdStep } from "@/components/auth/user-id-step"
import { AUTH_HERO_IMAGES } from "@/lib/brand-config"
import { clearLoginFlowStorage } from "@/lib/login-flow-storage"

const heroImages = AUTH_HERO_IMAGES

export function LoginPageClient() {
  const heroSrc = useMemo(
    () => heroImages[Math.floor(Math.random() * heroImages.length)],
    [],
  )

  return (
    <AuthPageLayout heroSrc={heroSrc}>
      <UserIdStep />
    </AuthPageLayout>
  )
}

export function resetLoginLandingState() {
  clearLoginFlowStorage()
}
