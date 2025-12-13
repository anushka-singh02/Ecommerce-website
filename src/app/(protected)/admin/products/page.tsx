"use client"

import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/lib/api/admin"
import Link from "next/link"

// --- DUMMY DATA START ---
const DUMMY_DATA = {
  data :{
  items: [
    { id: "p1", name: "Wireless Headphones", price: 129.99, stock: 45 },
    { id: "p2", name: "Ergonomic Office Chair", price: 250.00, stock: 12 },
    { id: "p3", name: "Gaming Mouse", price: 59.99, stock: 0 }, // Out of stock example
    { id: "p4", name: "Mechanical Keyboard", price: 110.50, stock: 25 },
    { id: "p5", name: "USB-C Hub", price: 35.00, stock: 150 },
    { id: "p6", name: "27-inch Monitor", price: 320.00, stock: 8 },
  ]
}};
// --- DUMMY DATA END ---

export default function ProductsPage() {
 // 1. Real API Call (Commented out for testing)
  const { data }  = useQuery({
    queryKey: ["products"],
    queryFn: () => adminService.getProducts(),
  }) 
  

  // 2. Use Dummy Data
  // const data = DUMMY_DATA;
  
  // Safe access to items
  console.log(data)
  const products = data?.data?.products || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">
          + Create Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 text-gray-600">${Number(p.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    p.stock > 0 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/admin/products/${p.id}/edit`} 
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  )
}