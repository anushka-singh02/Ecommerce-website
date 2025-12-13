"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["overview"],
    queryFn: () => api.get("/stats/overview").then(res => res.data),
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats && Object.entries(stats.cards).map(([k, v]: any) => (
          <div key={k} className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">{k}</p>
            <p className="text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded shadow">
        <LineChart width={600} height={300} data={stats?.sales}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line dataKey="revenue" stroke="#000" />
        </LineChart>
      </div>
    </div>
  )
}
