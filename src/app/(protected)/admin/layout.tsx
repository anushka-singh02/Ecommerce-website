"use client"

import { useEffect, useState } from "react" // ✅ Added useState
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Spinner } from "@/components/admin/Spinner"
import { useAuthStore } from "@/store/useAuthStore"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()
  // ✅ Gatekeeper state: Starts closed (false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Wait until global auth loading is finished
    if (!isLoading) {
      // 1. Check if Logged In
      if (!isAuthenticated) {
        router.replace("/login")
        return
      }

      // 2. Check if Admin
      if (user?.role !== "ADMIN") {
        router.replace("/") // Redirect customers to Home
        return
      }

      // 3. If passed both, open the gate
      setIsAuthorized(true)
    }
  }, [isLoading, isAuthenticated, user, router])

  // Show loading while checking Auth OR while verifying Role
  // This prevents the "Flash" of admin content for non-admins
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    )
  }

  // Render Admin UI only after authorized
  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader /> 
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}