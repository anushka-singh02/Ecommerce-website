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

export function AdminSidebar({
  open,
  setOpen,
}: {
  open?: boolean
  setOpen?: (v: boolean) => void
}) {
  const pathname = usePathname()

  const isOpen = open ?? false

  return (
    <>
      <aside
        className={clsx(
          "w-64 bg-black text-white p-6",
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0 lg:min-h-screen"
        )}
      >
        <h2 className="text-xl font-bold mb-8">Raawr Admin</h2>

        <nav className="space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen?.(false)} // guarded
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

      {/* Overlay — mobile only */}
      {isOpen && (
        <div
          onClick={() => setOpen?.(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}
    </>
  )
}
