"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin" // Update path if needed
import { 
  Search, 
  Users, 
  Mail, 
  Calendar, 
  ChevronRight, 
  MoreHorizontal,
  Eye
} from "lucide-react"

export default function CustomersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  // --- FETCH DATA ---
  const { data: customersData, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: () => adminService.getCustomers(),
  })

  // Normalize data (handle if API returns { data: [...] } or just [...])
  const customers = Array.isArray(customersData) 
    ? customersData 
    : (customersData as any)?.data || []

  // Simple Client-side Filter
  const filteredCustomers = customers.filter((c: any) => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper for Initials
  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <div className="max-w-7xl mx-auto p-8 my-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage and view your customer base.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {isLoading && (
            <div className="p-12 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-2" />
                <p>Loading customers...</p>
            </div>
        )}

        {isError && (
            <div className="p-12 text-center text-red-500 bg-red-50">
                Failed to load customers. Please refresh.
            </div>
        )}

        {!isLoading && filteredCustomers.length === 0 && (
            <div className="p-16 text-center text-gray-500">
                <Users className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-lg font-medium text-gray-900">No customers found</p>
                <p className="text-sm">Try adjusting your search terms.</p>
            </div>
        )}

        {/* --- TABLE --- */}
        {!isLoading && filteredCustomers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 tracking-wider">
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold">Orders</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer: any) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    className="hover:bg-gray-50 transition cursor-pointer group"
                  >
                    {/* Name & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name || "Unknown"}</div>
                          {customer.role === 'ADMIN' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {customer.email}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Orders Count (Optional if your API sends it) */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {customer.orders?.length || 0} Orders
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          router.push(`/admin/customers/${customer.id}`);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                      >
                        <Eye className="h-5 w-5" />
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
  )
}