"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Spinner } from "@/components/admin/Spinner"
import { useAuthStore } from "@/store/useAuthStore" // ✅ Switch to Store

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Use the store for checking auth status
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  // 1. Protection Check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    )
  }

  // 3. Prevent flash of protected content
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* ✅ No props needed anymore! */}
        <AdminHeader /> 
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}