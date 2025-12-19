"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Spinner } from "@/components/admin/Spinner"
import { useAuthStore } from "@/store/useAuthStore"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  // 🔐 Gatekeeper
  const [isAuthorized, setIsAuthorized] = useState(false)

  // 📱 Mobile sidebar state (NEW — this fixes everything)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login")
        return
      }
      if (user?.role !== "ADMIN") {
        router.replace("/")
        return
      }
      setIsAuthorized(true)
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* ✅ ONE sidebar, controlled */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* ✅ ONE header, same state */}
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  )
}
