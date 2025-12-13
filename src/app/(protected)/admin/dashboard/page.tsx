"use client"

import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

// --- DUMMY DATA START ---
const DUMMY_STATS = {
  data: {
    revenue: 45231.89,
    totalOrders: 1250,
    lowStockCount: 14,
  }
};

const DUMMY_METRICS = {
  data: {
    data: [
      // Simulating raw orders over a few days
      { createdAt: "2025-12-08T10:00:00Z", total: 120 },
      { createdAt: "2025-12-08T14:00:00Z", total: 80 },
      { createdAt: "2025-12-09T09:00:00Z", total: 400 },
      { createdAt: "2025-12-10T11:00:00Z", total: 150 },
      { createdAt: "2025-12-11T16:00:00Z", total: 800 },
      { createdAt: "2025-12-12T10:30:00Z", total: 450 },
      { createdAt: "2025-12-12T12:00:00Z", total: 200 },
      { createdAt: "2025-12-13T09:15:00Z", total: 600 },
      { createdAt: "2025-12-14T14:20:00Z", total: 950 },
    ]
  }
};
// --- DUMMY DATA END ---

// Helper to make the chart data look like what Recharts expects
const processChartData = (data: any[]) => {
  if (!data) return [];
  
  const grouped = data.reduce((acc: any, order: any) => {
    // Note: Ensure your local environment matches the date format logic
    const date = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    acc[date] = (acc[date] || 0) + (order.total || 0);
    return acc;
  }, {});

  return Object.keys(grouped).map((date) => ({ date, revenue: grouped[date] }));
};

export default function Dashboard() {
  // 1. Commented out real hooks for testing
  
  // const { data: statsData } = useQuery({
  //   queryKey: ["dashboard-stats"],
  //   queryFn: () => adminService.getDashboardStats(),
  // })

  // const { data: metricsData } = useQuery({
  //   queryKey: ["dashboard-metrics"],
  //   queryFn: () => adminService.getMetrics("30d"),
  // })
  

  // 2. Assign Dummy Data
  const statsData = DUMMY_STATS;
  const metricsData = DUMMY_METRICS;

  // Prepare the data to match your UI's expected format
  const stats = statsData?.data ? {
    cards: {
      "Total Revenue": `$${statsData.data.revenue.toLocaleString()}`, // Added formatting for nicer look
      "Total Orders": statsData.data.totalOrders,
      "Low Stock Items": statsData.data.lowStockCount,
    },
    sales: processChartData(metricsData?.data?.data || [])
  } : null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Dynamic Cards Loop */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"> {/* Added responsive grid-cols-1 */}
        {stats && Object.entries(stats.cards).map(([k, v]: any) => (
          <div key={k} className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-sm text-gray-500 uppercase tracking-wide">{k}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{v}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded shadow border border-gray-100">
        <h3 className="text-lg font-semibold mb-6">Revenue Overview</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={stats?.sales}>
              <XAxis 
                dataKey="date" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10} // Moves text down slightly
              />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value}`} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" // Changed to a nice blue
                strokeWidth={3} 
                dot={{ r: 4, fill: "#2563eb" }} // Added dots for better visibility
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}