"use client"


import { api } from "@/lib/axios"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Spinner } from "@/components/admin/Spinner"
import { useAuth } from "@/hooks/useAuth"
import { authService } from "@/lib/api/auth"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = () => {

    authService.logout()
  }



  if (isLoading) return <Spinner />
  if (!data) return null

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader user={data} onLogout={handleLogout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
