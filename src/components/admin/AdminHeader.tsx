"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore" // ✅ Use Store directly
import { authService } from "@/lib/api/auth"
import { LogOut } from "lucide-react"

export const AdminHeader = memo(function AdminHeader() {
  const { user, logout } = useAuthStore() // ✅ Get state & action
  const router = useRouter()

  const handleLogout = async () => {
    await authService.logout()
    logout() // Clear store
    router.replace("/login")
  }

  // Fallbacks for display
  const displayName = user?.name || user?.email || "Admin"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
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