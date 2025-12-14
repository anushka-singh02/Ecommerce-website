"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin"
import toast from "react-hot-toast"
import { format } from "date-fns" // Optional: standard JS dates work too

// Status Options
const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderDetail() {
  const { id } = useParams()
  // Ensure ID is a string
  const orderId = Array.isArray(id) ? id[0] : (id ?? "");
  
  const router = useRouter()
  const queryClient = useQueryClient()

  // 1. Fetch Order Data
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => adminService.getOrderById(orderId),
    enabled: !!orderId,
  })

  // 2. Status Update Mutation
  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => adminService.updateOrderStatus(orderId, newStatus),
    onSuccess: (_, newStatus) => {
      toast.success(`Order marked as ${newStatus}`)
      queryClient.invalidateQueries({ queryKey: ["order", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders"] }) // Refresh list too
    },
    onError: () => toast.error("Failed to update status")
  })

  if (isLoading) return <div className="p-12 text-center text-gray-500">Loading order details...</div>
  if (!order) return <div className="p-12 text-center text-red-500">Order not found</div>

  // Helper for Badge Colors
  const getStatusColor = (s: string) => {
    switch (s) {
      case "PAID": return "bg-green-100 text-green-700 border-green-200"
      case "PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "SHIPPED": return "bg-blue-100 text-blue-700 border-blue-200"
      case "DELIVERED": return "bg-purple-100 text-purple-700 border-purple-200"
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 my-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition">
                ← Back
             </button>
             <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(0,8)}</h1>
             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                {order.status}
             </span>
           </div>
           <p className="text-gray-500 text-sm ml-12">
             Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
           </p>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm font-semibold text-gray-700 pl-2">Set Status:</span>
            <select 
                value={order.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
                className="border-none bg-gray-50 rounded-md text-sm font-medium py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
                {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: ITEMS --- */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-800">Order Items</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="p-6 flex items-center gap-6">
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                {item.product?.image ? (
                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                )}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{item.product?.name || "Unknown Product"}</h3>
                                <p className="text-sm text-gray-500 mt-1">Unit Price: ${Number(item.price).toFixed(2)}</p>
                            </div>

                            {/* Qty & Total */}
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                <div className="font-bold text-gray-900 mt-1">
                                    ${(Number(item.price) * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Refund / Activity Log Section (Placeholder) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60">
                <h3 className="font-semibold text-gray-800 mb-2">Order Timeline</h3>
                <p className="text-sm text-gray-500">Activity logs and tracking updates will appear here.</p>
            </div>
        </div>

        {/* --- RIGHT COLUMN: CUSTOMER & SUMMARY --- */}
        <div className="space-y-6">
            
            {/* Customer Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Customer</h3>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {order.user?.name?.[0] || "G"}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{order.user?.name || "Guest User"}</p>
                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </div>
                </div>
                
                {/* Mock Address (Since we don't have Address table in seed yet) */}
                <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-700 mb-1">Shipping Address</p>
                    <p>123 Main Street</p>
                    <p>New York, NY 10001</p>
                    <p>United States</p>
                </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Payment Summary</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${Number(order.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>$0.00</span> 
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax (Estimate)</span>
                        <span>$0.00</span>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
                        <span>Total</span>
                        <span>${Number(order.total).toFixed(2)}</span>
                    </div>
                </div>
                
                {order.status === 'PAID' ? (
                     <div className="mt-4 w-full bg-green-50 text-green-700 text-center py-2 rounded text-sm font-medium border border-green-100">
                        Payment Successful
                     </div>
                ) : (
                    <div className="mt-4 w-full bg-yellow-50 text-yellow-700 text-center py-2 rounded text-sm font-medium border border-yellow-100">
                        Payment Pending
                     </div>
                )}
            </div>

        </div>
      </div>
    </div>
  )
}