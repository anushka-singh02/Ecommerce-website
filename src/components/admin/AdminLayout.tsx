"use client"

import { ProtectedRoute } from "./ProtectedRoute"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-100">
        <aside className="w-64 bg-black text-white p-6">
          <h2 className="text-xl font-bold mb-6">Admin</h2>
          <nav className="space-y-3">
            <a href="/admin/dashboard">Dashboard</a>
            <a href="/admin/orders">Orders</a>
            <a href="/admin/products">Products</a>
            <a href="/admin/customers">Customers</a>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
