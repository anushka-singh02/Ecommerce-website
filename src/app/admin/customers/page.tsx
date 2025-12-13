"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import Link from "next/link"

export default function Customers() {
  const { data } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers").then(res => res.data),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <table className="table">
        <tbody>
          {data?.items.map((c: any) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>
                <Link href={`/admin/customers/${c.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
