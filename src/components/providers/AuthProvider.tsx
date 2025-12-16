"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
    console.log("Auth provider running")
  }, [checkAuth])

  return <>{children}</>
}