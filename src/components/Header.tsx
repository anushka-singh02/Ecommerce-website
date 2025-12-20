"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCart, Search, Menu, User, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartSidebar } from "@/components/CartSidebar"
import { useAuthStore } from "@/store/useAuthStore"
import { storeService } from "@/lib/api/store" // ✅ Import API service
import { userService } from "@/lib/api/user" // ✅ Import User Service
import { useQuery } from "@tanstack/react-query" // ✅ Import React Query
import whitelogo from "../../public/whitelogo.png"
import blacklogo from "../../public/logo.jpg"
// Helper to format currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function Header() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)


  const { data: cartData} = useQuery({
    queryKey: ["cart"],
    queryFn: () => userService.getCart(),
    enabled: isAuthenticated, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // Optional: Cache for 5 mins
  })

 
  const cartCount = (cartData as any)?.items?.reduce((total: number, item: any) => total + (item.quantity || 1), 0) || 0

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([]) // Store product suggestions
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null) // To detect clicks outside

  const categories = [
    { name: "New Arrivals", href: "/products?sort=newest" },
    { name: "Men", href: "/products?gender=Men" },
    { name: "Women", href: "/products?gender=Women" },
    { name: "Collections", href: "/products" },
    { name: "Sale", href: "/products?sort=price-low" },
  ]

  // --- 1. SEARCH LOGIC (Debounced) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) { // Only search if > 1 char
        setIsSearching(true)
        try {
          // Re-use your existing API, limiting to 5 items for the dropdown
          const res = await storeService.getAllProducts({ 
            search: searchQuery, 
            limit: 5 
          });
          
          // Handle backend response structure
          // Your backend returns: { data: { products: [...] } }
          const products = res.data?.products || []; 
          setSuggestions(products);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search error", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300) // Wait 300ms after typing stops

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // --- 2. CLOSE DROPDOWN ON CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // --- 3. HANDLE SUBMIT (Enter Key) ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
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
                          src={whitelogo}
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
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <div className="relative h-10 w-32">

                {/* Visible on mobile, hidden on desktop */}
                <Image
                  src={whitelogo}
                  alt="Raawr"
                  fill
                  className="object-contain md:hidden"
                  priority
                />
                {/* Hidden on mobile, visible on desktop */}
                <Image
                  src={blacklogo}
                  alt="Raawr"
                  fill
                  className="object-contain hidden md:block"
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
              
              {/* --- LIVE SEARCH BAR --- */}
              <div className="hidden md:block relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-9 w-[200px] lg:w-[300px] transition-all focus:w-[350px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        if(suggestions.length > 0) setShowSuggestions(true);
                    }}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </form>

                {/* --- SUGGESTIONS DROPDOWN --- */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {suggestions.length > 0 ? (
                      <>
                        <div className="py-2">
                          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Products
                          </p>
                          {suggestions.map((product) => (
                            <Link 
                              key={product.id} 
                              href={`/product/${product.id}`}
                              onClick={() => setShowSuggestions(false)}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group"
                            >
                              <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                {product.images?.[0] ? (
                                    <Image 
                                      src={product.images[0]} 
                                      alt={product.name} 
                                      fill 
                                      className="object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="border-t bg-gray-50">
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
                          >
                            View all {suggestions.length === 5 ? "results" : `${suggestions.length} results`} for "{searchQuery}"
                          </button>
                        </div>
                      </>
                    ) : (
                      !isSearching && (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No products found for "{searchQuery}"
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Account Icon */}
              <Link href={isAuthenticated ? "/profile" : "/login"}>
                <Button variant="ghost" size="icon" title={isAuthenticated ? "My Profile" : "Login"}>
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              {/* Cart Icon */}
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

      {isAuthenticated && (
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  )
}