"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin"
import { format } from "date-fns" // Optional: run 'npm install date-fns' for better dates, or use native JS

// Define the Order Interface (match your Prisma schema)
interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  user: {
    email: string
    name?: string
  }
}

// Status Tabs Configuration
const TABS = [
  { label: "All Orders", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
]

export default function OrdersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("") // Empty string = All
  const [page, setPage] = useState(1)

  // Fetch Orders
  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ["orders", activeTab, page],
    queryFn: () => adminService.getOrders({ 
        status: activeTab === "" ? undefined : activeTab, 
        page 
    }),
  })

  // Handle Data: It might be an array directly or wrapped in { data: [...] }
  // Adjust this line based on exactly what your backend returns
  const orders: Order[] = Array.isArray(ordersData) 
      ? ordersData 
      : (ordersData as any)?.data || []

  // Helper: Status Badge Color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-700 border-green-200"
      case "PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "SHIPPED": return "bg-blue-100 text-blue-700 border-blue-200"
      case "DELIVERED": return "bg-purple-100 text-purple-700 border-purple-200"
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 my-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage and track all customer orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
                setActiveTab(tab.value)
                setPage(1) // Reset to page 1 on tab switch
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === tab.value
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Loading State */}
        {isLoading && (
            <div className="p-12 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-2" />
                <p>Loading orders...</p>
            </div>
        )}

        {/* Error State */}
        {isError && (
            <div className="p-12 text-center text-red-500 bg-red-50">
                Failed to load orders. Please try refreshing.
            </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && orders.length === 0 && (
            <div className="p-16 text-center text-gray-500">
                <p className="text-lg font-medium text-gray-900 mb-1">No orders found</p>
                <p className="text-sm">There are no orders with this status yet.</p>
            </div>
        )}

        {/* Data Table */}
        {!isLoading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 tracking-wider">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="hover:bg-gray-50 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{order.user?.name || "Guest"}</span>
                            <span className="text-xs text-gray-400">{order.user?.email}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="text-blue-600 text-sm font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details &rarr;
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Footer */}
        {!isLoading && orders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600 font-medium">Page {page}</span>
                <button 
                     // Simple pagination logic: if we got less than 20 items (limit), we are likely at the end
                    onClick={() => setPage(p => p + 1)}
                    disabled={orders.length < 20} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Next
                </button>
            </div>
        )}
      </div>
    </div>
  )
}