"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin"
import {
  ArrowLeft,
  Mail,
  Calendar,
  ShoppingBag,
  CreditCard,
  Package,
  Banknote,
  User
} from "lucide-react"

interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  orders: {
    id: string;
    total: number;
    createdAt: string;
    orderStatus: string;
    paymentStatus: string;
  }[];
}
export default function CustomerDetail() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()

  // 1. Fetch Customer Data
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await adminService.getCustomerById(id!)
      return res as unknown as CustomerDetails 
     
    },
    enabled: !!id,
  })

  // 2. Loading / Error States
  if (isLoading) return <div className="p-12 text-center text-gray-500">Loading profile...</div>
  if (!customer) return <div className="p-12 text-center text-red-500">Customer not found</div>

  // 3. Helpers
  const getInitials = (name: string) => {
    return (name || "??").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }

  // Calculate Stats
  const totalOrders = customer.orders?.length || 0;
  const totalSpent = customer.orders?.reduce((sum: number, order: any) => sum + Number(order.total), 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Status Badge Colors (Consistent with Order Page)
  const getOrderColor = (s: string) => {
    switch (s) {
      case "DELIVERED": return "bg-green-50 text-green-700 border-green-200"
      case "SHIPPED": return "bg-blue-50 text-blue-700 border-blue-200"
      case "PROCESSING": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPaymentColor = (s: string) => {
    switch (s) {
      case "PAID": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200"
      case "FAILED": return "bg-red-50 text-red-700 border-red-200"
      case "REFUNDED": return "bg-purple-50 text-purple-700 border-purple-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8 my-8">

      {/* --- HEADER --- */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-900 transition mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Customers
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- LEFT SIDEBAR: PROFILE & STATS --- */}
        <div className="space-y-6">

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md mx-auto mb-4">
              {getInitials(customer.name)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-1 mb-6">
              <Mail className="h-3 w-3" /> {customer.email}
            </div>

            <div className="border-t border-gray-100 pt-6 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <User className="h-4 w-4" /> Role
                </span>
                <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">{customer.role || "CUSTOMER"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joined
                </span>
                <span className="font-medium">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Lifetime Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded shadow-sm text-blue-600"><ShoppingBag className="h-4 w-4" /></div>
                  <span className="text-sm font-medium text-gray-600">Total Orders</span>
                </div>
                <span className="font-bold text-gray-900">{totalOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded shadow-sm text-green-600"><CreditCard className="h-4 w-4" /></div>
                  <span className="text-sm font-medium text-gray-600">Total Spent</span>
                </div>
                <span className="font-bold text-gray-900">${totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded shadow-sm text-purple-600"><Banknote className="h-4 w-4" /></div>
                  <span className="text-sm font-medium text-gray-600">Avg. Order</span>
                </div>
                <span className="font-bold text-gray-900">${avgOrderValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: ORDER HISTORY --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-800">Order History</h2>
            </div>

            {!customer.orders || customer.orders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <ShoppingBag className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p>No orders placed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 font-medium">Order ID</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Total</th>
                      <th className="px-6 py-3 font-medium">Payment</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customer.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition group">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          ${Number(order.total).toFixed(2)}
                        </td>

                        {/* Payment Status Badge */}
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentColor(order.paymentStatus)}`}>
                            <Banknote className="h-3 w-3" /> {order.paymentStatus}
                          </span>
                        </td>

                        {/* Order Status Badge */}
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${getOrderColor(order.orderStatus)}`}>
                            <Package className="h-3 w-3" /> {order.orderStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="text-blue-600 hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}