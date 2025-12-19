"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/lib/api/auth"
import { LogOut, Menu } from "lucide-react"

export const AdminHeader = memo(function AdminHeader({
  setSidebarOpen,
}: {
  setSidebarOpen?: (v: boolean) => void
}) {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await authService.logout()
    logout()
    router.replace("/login")
  }

  const displayName = user?.name || user?.email || "Admin"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
      
      <div className="flex items-center gap-3">
        {/* ☰ Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setSidebarOpen?.(true)}
        >
          <Menu className="h-6 w-6 text-black" />
        </button>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
          <span className="text-xs font-bold text-gray-700">{initials}</span>
        </div>

        <div className="hidden md:block">
          <h1 className="font-semibold text-sm text-gray-900">{displayName}</h1>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  )
})
