"use client"

import { ProtectedRoute } from "./ProtectedRoute"
import { useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-100">

        {/* Sidebar (single source of truth) */}
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 p-8">
            {children}
          </main>
        </div>

      </div>
    </ProtectedRoute>
  )
}
