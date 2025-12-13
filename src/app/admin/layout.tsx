"use client"

import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/axios"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Spinner } from "@/components/admin/Spinner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useAuth()
  const router = useRouter()

  async function logout() {
    await api.post("/auth/logout")
    router.replace("/admin/login")
  }

  if (isLoading) return <Spinner />
  if (!data) return null

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader user={data} onLogout={logout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
