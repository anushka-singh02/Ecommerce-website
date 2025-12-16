"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation" // Added for search navigation
import { ShoppingCart, Search, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartSidebar } from "@/components/CartSidebar"
// 1. Import your auth store
import { useAuthStore } from "@/store/useAuthStore"

export function Header() {
  const router = useRouter()
  // 2. Get auth state
  const { isAuthenticated, user } = useAuthStore()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Mock cart count (You can replace this later with a real cart store)
  const [cartCount, setCartCount] = useState(2)

  const categories = [
    { name: "New Arrivals", href: "/products?sort=newest" },
    { name: "Men", href: "/products?gender=Men" },
    { name: "Women", href: "/products?gender=Women" },
    { name: "Collections", href: "/products" },
    { name: "Sale", href: "/products?sort=price-low" }, // Adjusted query params to match API
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <div className="relative h-8 w-24">
                        <Image
                          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/raawrlogo-1764828536372.webp?width=8000&height=8000&resize=contain"
                          alt="Raawr"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </Link>
                  </div>
                  <nav className="flex flex-col py-4">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="text-base font-medium py-3 px-6 hover:bg-muted transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-10 w-32">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/raawrlogo-1764828536372.webp?width=8000&height=8000&resize=contain"
                  alt="Raawr"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-9 w-[200px] lg:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* Account Icon Logic */}
              <Link href={isAuthenticated ? "/profile" : "/login"}>
                <Button variant="ghost" size="icon" title={isAuthenticated ? "My Profile" : "Login"}>
                  <User className="h-5 w-5" />
                  {/* Optional: Show small indicator if logged in */}
                  {isAuthenticated && <span className="sr-only">Profile (Logged In)</span>}
                </Button>
              </Link>

              {/* Cart Icon - ONLY SHOW IF LOGGED IN */}
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              )}
              
            </div>
          </div>
        </div>
      </header>

      {/* Only render sidebar if auth (extra safety) */}
      {isAuthenticated && (
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  )
}