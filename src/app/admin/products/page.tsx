"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import Link from "next/link"

export default function ProductsPage() {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then(res => res.data),
  })

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/create" className="btn-primary">Create</Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Price</th><th>Stock</th><th></th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((p: any) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>
              <td>
                <Link href={`/admin/products/${p.id}/edit`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
