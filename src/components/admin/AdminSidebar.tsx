"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-black text-white min-h-screen p-6">
      <h2 className="text-xl font-bold mb-8">Raawr Admin</h2>

      <nav className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "block px-4 py-2 rounded transition",
              pathname.startsWith(link.href)
                ? "bg-white text-black"
                : "hover:bg-gray-800"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
