"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin"
import toast from "react-hot-toast"

// --- STATUS OPTIONS ---
const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default function OrderDetail() {
  const { id } = useParams()
  const orderId = Array.isArray(id) ? id[0] : (id ?? "");
  
  const router = useRouter()
  const queryClient = useQueryClient()

  // 1. Fetch Order Data
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => adminService.getOrderById(orderId),
    enabled: !!orderId,
  })

  // 2. Status Update Mutation (Handles BOTH types)
  const statusMutation = useMutation({
    mutationFn: ({ status, type }: { status: string, type: "ORDER" | "PAYMENT" }) => 
        adminService.updateOrderStatus(orderId, status, type),
    onSuccess: (_, variables) => {
      toast.success(`${variables.type === "PAYMENT" ? "Payment" : "Order"} status updated to ${variables.status}`)
      queryClient.invalidateQueries({ queryKey: ["order", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: () => toast.error("Failed to update status")
  })

  if (isLoading) return <div className="p-12 text-center text-gray-500">Loading order details...</div>
  if (!order) return <div className="p-12 text-center text-red-500">Order not found</div>

  // --- HELPERS ---
  const getOrderColor = (s: string) => {
    switch (s) {
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200"
      case "SHIPPED": return "bg-blue-100 text-blue-700 border-blue-200"
      case "PROCESSING": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getPaymentColor = (s: string) => {
    switch (s) {
      case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200"
      case "FAILED": return "bg-red-100 text-red-700 border-red-200"
      case "REFUNDED": return "bg-purple-100 text-purple-700 border-purple-200"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  // Parse Address safely
  const address = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress || {};

  return (
    <div className="max-w-6xl mx-auto p-1 my-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition">
                ← Back
             </button>
             <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(0,8)}</h1>
           </div>
           <p className="text-gray-500 text-sm ml-12">
             Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
           </p>
        </div>

        {/* STATUS ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3">
            
            {/* 1. Payment Status Control */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-500 uppercase pl-2 tracking-wide">Payment:</span>
                <select 
                    value={order.paymentStatus}
                    onChange={(e) => statusMutation.mutate({ status: e.target.value, type: "PAYMENT" })}
                    disabled={statusMutation.isPending}
                    className={`border-none rounded-md text-sm font-bold py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getPaymentColor(order.paymentStatus)}`}
                >
                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* 2. Order Status Control */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-500 uppercase pl-2 tracking-wide">Order:</span>
                <select 
                    value={order.orderStatus}
                    onChange={(e) => statusMutation.mutate({ status: e.target.value, type: "ORDER" })}
                    disabled={statusMutation.isPending}
                    className={`border-none rounded-md text-sm font-bold py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getOrderColor(order.orderStatus)}`}
                >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: ITEMS --- */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Order Items</h2>
                    <span className="text-sm text-gray-500">{order.items.length} Items</span>
                </div>
                <div className="divide-y divide-gray-100">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="p-6 flex items-center gap-6">
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 relative">
                                {item.product?.image ? (
                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                )}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 text-lg">{item.product?.name || "Unknown Product"}</h3>
                                <div className="text-sm text-gray-500 mt-1 flex gap-3">
                                   {item.size && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">Size: {item.size}</span>}
                                   {item.color && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">Color: {item.color}</span>}
                                </div>
                            </div>

                            {/* Qty & Total */}
                            <div className="text-right">
                                <div className="text-sm text-gray-500 mb-1">{item.quantity} x ₹{Number(item.price).toFixed(2)}</div>
                                <div className="font-bold text-gray-900 text-lg">
                                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-70">
                <h3 className="font-semibold text-gray-800 mb-2">Order Activity</h3>
                <div className="space-y-4 mt-4">
                    <div className="flex gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div>
                            <p className="font-medium text-gray-900">Order Created</p>
                            <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    {/* Real logs will go here later */}
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: DETAILS --- */}
        <div className="space-y-6">
            
            {/* Customer Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Customer</h3>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                        {order.user?.name?.[0] || order.user?.email?.[0] || "?"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.user?.name || "Guest"}</p>
                        <p className="text-xs text-gray-500 truncate" title={order.user?.email}>{order.user?.email}</p>
                    </div>
                </div>
                
                {/* DYNAMIC SHIPPING ADDRESS */}
                <div className="text-sm text-gray-600 space-y-1 mt-4">
                    <p className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span>📍 Shipping Address</span>
                    </p>
                    {Object.keys(address).length > 0 ? (
                        <>
                            <p className="font-medium text-gray-900">{address.fullName}</p>
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.state} {address.postalCode}</p>
                            <p>{address.country}</p>
                            <p className="mt-2 text-gray-500">📞 {address.phone}</p>
                        </>
                    ) : (
                        <p className="italic text-gray-400">No address provided</p>
                    )}
                </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Payment Details</h3>
                
                <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-600 font-medium">Method</span>
                    <span className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded border shadow-sm">
                        {order.paymentMethod}
                    </span>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{Number(order.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600 font-medium">Free</span> 
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-xl text-gray-900">
                        <span>Total</span>
                        <span>₹{Number(order.total).toFixed(2)}</span>
                    </div>
                </div>
                
                {order.paymentStatus === 'PAID' ? (
                     <div className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-3 rounded-lg text-sm font-bold border border-emerald-200">
                        <span>✓</span> Paid Successfully
                     </div>
                ) : (
                    <div className="mt-6 w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 py-3 rounded-lg text-sm font-bold border border-amber-200">
                        <span>⚠</span> Payment Pending
                     </div>
                )}
            </div>

        </div>
      </div>
    </div>
  )
}