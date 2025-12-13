"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"

export default function CustomerDetail() {
  const { id } = useParams()

  const { data } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => api.get(`/customers/${id}`).then(r => r.data),
  })

  if (!data) return null

  return (
    <div>
      <h1 className="text-2xl font-bold">{data.name}</h1>
      <p>{data.email}</p>

      <h2 className="mt-6 font-semibold">Orders</h2>
      {data.orders.map((o: any) => (
        <div key={o.id}>#{o.id} – ${o.total}</div>
      ))}
    </div>
  )
}
