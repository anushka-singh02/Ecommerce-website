"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import toast from "react-hot-toast"

export default function OrderDetail() {
  const { id } = useParams()

  const { data } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      api.patch(`/orders/${id}`, { status }),
    onSuccess: () => toast.success("Order updated"),
  })

  if (!data) return null

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Order #{data.id}</h1>

      <p>Status: {data.status}</p>

      <button
        onClick={() => updateStatus.mutate("shipped")}
        className="btn-primary mt-4"
      >
        Mark as Shipped
      </button>

      <h2 className="mt-6 font-semibold">Items</h2>
      {data.items.map((item: any) => (
        <div key={item.id}>{item.name} × {item.quantity}</div>
      ))}
    </div>
  )
}
