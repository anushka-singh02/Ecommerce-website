"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin"

// ✅ 1. Update Interface to match new Schema
interface Order {
  id: string
  total: number
  orderStatus: string      // New Field
  paymentStatus: string    // New Field
  paymentMethod: string    // New Field
  createdAt: string
  user: {
    email: string
    name?: string
  }
}

// ✅ 2. Update Tabs to track Order Journey
const TABS = [
  { label: "All Orders", value: "" },
  { label: "Pending", value: "PENDING" },       // Just created
  { label: "Processing", value: "PROCESSING" }, // Confirmed/Packing
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returned", value: "RETURNED" },
]

export default function OrdersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("")
  const [page, setPage] = useState(1)

  // Fetch Orders
  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ["orders", activeTab, page],
    queryFn: () => adminService.getOrders({
      status: activeTab === "" ? undefined : activeTab, // Assumes backend filters by 'orderStatus'
      page
    }),
  })

  const orders: Order[] = Array.isArray(ordersData)
    ? ordersData
    : (ordersData as any)?.data || []

  // ✅ Helper: Logistics Color (Order Status)
  const getOrderColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200"
      case "SHIPPED": return "bg-blue-100 text-blue-700 border-blue-200"
      case "PROCESSING": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "PENDING": return "bg-gray-100 text-gray-700 border-gray-200"
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200"
      case "RETURNED": return "bg-orange-50 text-orange-700 border-orange-200"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  // ✅ Helper: Money Color (Payment Status)
  const getPaymentColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200"
      case "FAILED": return "bg-red-100 text-red-700 border-red-200"
      case "REFUNDED": return "bg-purple-100 text-purple-700 border-purple-200"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-2 py-4 md:p-2 my-4 md:my-2"> {/* Increased width for more columns */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage logistics and payment statuses.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              setActiveTab(tab.value)
              setPage(1)
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${activeTab === tab.value
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {isLoading && (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-2" />
            <p>Loading orders...</p>
          </div>
        )}

        {isError && (
          <div className="p-12 text-center text-red-500 bg-red-50">
            Failed to load orders.
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="p-16 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-900 mb-1">No orders found</p>
            <p className="text-sm">There are no orders with this status yet.</p>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <>
            {/* Desktop Table (unchanged) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 tracking-wider">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Total</th>

                    {/* ✅ Split Columns */}
                    <th className="px-6 py-4 font-semibold">Payment</th>
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

                      {/* ✅ Payment Status Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide pl-1">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* ✅ Order Status Column */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-blue-600 text-sm font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                          View &rarr;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (NEW) */}
            <div className="md:hidden divide-y divide-gray-100">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className="p-4 bg-white hover:bg-gray-50 transition cursor-pointer"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      #{order.id.slice(0, 8)}...
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderColor(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {order.user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.user?.email}
                    </p>
                  </div>

                  {/* Date + Total */}
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{Number(order.total).toFixed(2)}
                    </span>
                  </div>

                  {/* Payment */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentColor(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
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



