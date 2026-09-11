"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthPageLayout } from "@/components/auth/auth-page-layout"
import { PasswordStep } from "@/components/auth/password-step"
import { AUTH_HERO_IMAGES } from "@/lib/brand-config"
import {
  readStoredUsername,
  storeUsername,
} from "@/lib/login-flow-storage"

const heroImages = AUTH_HERO_IMAGES

function PasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState("")
  const heroSrc = useMemo(
    () => heroImages[Math.floor(Math.random() * heroImages.length)],
    [],
  )

  useEffect(() => {
    const userIdParam = searchParams.get("userId")
    if (userIdParam) {
      setUserId(userIdParam)
      storeUsername(userIdParam)
    } else if (readStoredUsername()) {
      setUserId(readStoredUsername())
    } else {
      router.replace("/")
    }
  }, [searchParams, router])

  if (!userId) {
    return null
  }

  return (
    <AuthPageLayout heroSrc={heroSrc}>
      <PasswordStep userId={userId} />
    </AuthPageLayout>
  )
}

export default function PasswordPage() {
  return (
    <Suspense fallback={null}>
      <PasswordPageContent />
    </Suspense>
  )
}
