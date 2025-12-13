"use client"

import { AuthUser } from "@/lib/types"
import { memo } from "react"

interface Props {
  user: AuthUser
  onLogout: () => void
}

export const AdminHeader = memo(function AdminHeader({ user, onLogout }: Props) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div>
        <h1 className="font-semibold text-lg">Admin Panel</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      <button
        onClick={onLogout}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Logout
      </button>
    </header>
  )
})
