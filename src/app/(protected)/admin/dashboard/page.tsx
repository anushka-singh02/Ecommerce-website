"use client"

import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

// Helper to format chart data
// Helper to format chart data
const processChartData = (data: any[]) => {
  if (!data || !Array.isArray(data)) return []; 
  
  // 1. Sort by Date first
  const sortedData = [...data].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const grouped = sortedData.reduce((acc: any, order: any) => {
    const date = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // 🚨 THE FIX: Wrapped in Number() to prevent string concatenation
    const orderAmount = Number(order.total) || 0;
    
    acc[date] = (acc[date] || 0) + orderAmount;
    return acc;
  }, {});

  return Object.keys(grouped).map((date) => ({ date, revenue: grouped[date] }));
};

export default function Dashboard() {
  // 1. Fetch Real Data
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => adminService.getDashboardStats(),
  })

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: () => adminService.getMetrics("30d"),
  })

  // 2. Prepare Data
  const stats = statsData ? {
    cards: {
      // FIX 2: Changed 'en-US' to 'en-IN' for correct Indian numbering (e.g., 1,50,000 instead of 150,000)
      "Total Revenue": `₹${(statsData.revenue || 0).toLocaleString('en-IN', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
      })}`,
      "Total Orders": statsData.totalOrders || 0,
      "Low Stock Items": statsData.lowStockCount || 0,
    },
    sales: processChartData(metricsData?.data || []) 
  } : null;

  if (statsLoading || metricsLoading) {
    return <div className="p-12 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black">Dashboard</h1>

      {/* Dynamic Cards Loop */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
        
        {/* Check if we actually have sales data */}
        {stats?.sales && stats.sales.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={stats.sales}>
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₹${value}`} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value: any) => [`₹${value}`, "Revenue"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#2563eb" }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded">
            No revenue data available for this period.
          </div>
        )}
      </div>
    </div>
  )
}