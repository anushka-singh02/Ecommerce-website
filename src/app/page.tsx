"use client"

import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore" // The hook we created in Step 1
import { useQuery } from "@tanstack/react-query"
import { storeService } from "@/lib/api/store"

export default function Home() {
  const { isAuthenticated, user , isLoading } = useAuthStore();

  // 1. Fetch Trending Products (Tag: New)
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["home-featured"],
    queryFn: () => storeService.getAllProducts({ tags: "New", limit: 4 }),
  })

  // 2. Fetch Bestseller Products (Tag: Bestseller)
  const { data: bestsellerData, isLoading: bestsellerLoading } = useQuery({
    queryKey: ["home-bestsellers"],
    queryFn: () => storeService.getAllProducts({ tags: "Bestseller", limit: 4 }),
  })

  // Normalize Data Helpers
  const normalizeProducts = (data: any) => {
    const list = data?.data?.products || [];
    return list.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      image: item.images?.[0] || "https://placehold.co/600x600?text=No+Image",
      tag: item.tags?.[0] || "", // Display the first tag
    }));
  };

  const featuredProducts = normalizeProducts(featuredData);
  const bestsellerProducts = normalizeProducts(bestsellerData);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] lg:h-[700px] ">
          <div className="absolute inset-0">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/heroimg-1765447146644.jpg?width=1920&height=1080&resize=cover"
              alt="Hero"
              fill
              className="object-cover "
              priority
            />
          </div>
          <div className="relative container mx-auto px-4 h-full flex items-end lg:items-center pb-12 lg:pb-0">
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 lg:mb-6 drop-shadow-lg">
                Elevate Your Performance
              </h1>
              <p className="text-base md:text-xl lg:text-2xl mb-6 lg:mb-8 drop-shadow-md">
                Premium athletic wear engineered for the modern athlete.
              </p>
              <div className="flex gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-black hover:bg-black/90 text-white border-black">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button size="lg" variant="outline" className="bg-black hover:bg-black/90 text-white border-black">
                    Explore Collections <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="py-20">
          <div className="container mx-auto px-2">
            <div className="md:hidden mb-6">
      <div className="w-full bg-[#e9eaec] py-3 text-center">
        <h2 className="text-black font-bold text-3xl tracking-wide">
          BESTSELLERS
        </h2>
      </div>
    </div>
    <div className="flex justify-between items-end mb-12">
      <div>
        {/* Hide original heading on mobile */}
        <h2 className="hidden md:block text-4xl font-bold mb-4">
          Bestsellers
        </h2>
        <p className="hidden text-xl text-muted-foreground">
          Our most loved products
        </p>
      </div>
      <Link href="/products">
        <Button
          variant="outline"
          className="hidden md:flex items-center gap-2"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
            {bestsellerLoading ? (
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                 {[1,2,3,4].map(i => <div key={i} className="h-[350px] bg-gray-100 rounded-xl animate-pulse" />)}
               </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {bestsellerProducts.map((product: any) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                      <div className="relative h-[250px] md:h-[350px]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        {product.tag && (
                          <div className="absolute top-2 left-2 md:top-4 md:left-4 px-2 py-1 md:px-3 md:py-1 bg-primary text-primary-foreground text-xs md:text-sm font-medium rounded-full">
                            {product.tag}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 md:p-4">
                        <h3 className="font-semibold mb-2 text-sm md:text-base">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-base md:text-lg font-bold">${product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs md:text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            
            <div className="mt-8 text-center md:hidden">
              <Link href="/products">
                <Button variant="outline" className="items-center gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products (Trending Now) */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-2">
            
            <div className="md:hidden mb-6">
      <div className="w-full bg-[#e9eaec] py-3 text-center">
        <h2 className="text-black font-bold text-3xl tracking-wide">
          TRENDING NOW
        </h2>
      </div>
    </div>
    <div className="flex justify-between items-end mb-12">
      <div>
        {/* Hide original heading on mobile */}
        <h2 className="hidden md:block text-4xl font-bold mb-4">
          Bestsellers
        </h2>
        <p className="hidden text-xl text-muted-foreground">
          Our most popular products this season
        </p>
      </div>
              <Link href="/products">
                <Button variant="outline" className="hidden md:flex items-center gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            

            {featuredLoading ? (
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                 {[1,2,3,4].map(i => <div key={i} className="h-[350px] bg-gray-100 rounded-xl animate-pulse" />)}
               </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {featuredProducts.map((product: any) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                      <div className="relative h-[250px] md:h-[350px]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        {product.tag && (
                          <div className="absolute top-2 left-2 md:top-4 md:left-4 px-2 py-1 md:px-3 md:py-1 bg-primary text-primary-foreground text-xs md:text-sm font-medium rounded-full">
                            {product.tag}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 md:p-4">
                        <h3 className="font-semibold mb-2 text-sm md:text-base">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-base md:text-lg font-bold">${product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs md:text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link href="/products">
                <Button variant="outline" className="items-center gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Banner - CONDITIONAL RENDERING */}
        {/* Only show if NOT loading and NOT authenticated */}
        {/* CTA Banner - ALWAYS VISIBLE (Content swaps based on auth) */}
        {!isLoading && (
          <section className="py-20 bg-[#dee2e6] text-[#212529]">
            <div className="container mx-auto px-4 text-center">
              
              {/* CONTENT SWITCHER */}
              {isAuthenticated ? (
                // --- OPTION A: LOGGED IN USER ---
                <>
                  <h2 className="text-4xl font-bold mb-4">
                    Ready to crush your next workout{user?.name ? `, ${user.name}` : ''}?
                  </h2>
                  <p className="text-xl mb-8 opacity-90">
                    Check out the latest drops added just for you.
                  </p>
                  <Link href="/products?sort=newest">
                    <Button size="lg" variant="secondary" className="bg-[#212529] text-primary hover:bg-white/90">
                      Shop New Arrivals
                    </Button>
                  </Link>
                </>
              ) : (
                // --- OPTION B: GUEST USER ---
                <>
                  <h2 className="text-4xl font-bold mb-4">
                    Join the Raawr Community
                  </h2>
                  <p className="text-xl mb-8 opacity-90">
                    Get 15% off your first order when you sign up
                  </p>
                  <Link href="/signup">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                      Sign Up Now
                    </Button>
                  </Link>
                </>
              )}
              
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}