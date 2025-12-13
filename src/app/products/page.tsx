"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal, ShoppingBag, ArrowRight } from "lucide-react"

export default function ProductsPage() {
  const [priceRange, setPriceRange] = useState([0, 200])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const products = [
    {
      id: 1,
      name: "Flex Performance Tee",
      price: 35,
      originalPrice: 45,
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      category: "Tops",
      gender: "Men",
      colors: ["Black", "White", "Navy"],
    },
    {
      id: 2,
      name: "Power Seamless Leggings",
      price: 55,
      originalPrice: 70,
      image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
      category: "Bottoms",
      gender: "Women",
      colors: ["Black", "Teal", "Purple"],
    },
    {
      id: 3,
      name: "Training Shorts",
      price: 40,
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
      category: "Bottoms",
      gender: "Men",
      colors: ["Black", "Grey", "Navy"],
    },
    {
      id: 4,
      name: "Lightweight Hoodie",
      price: 65,
      originalPrice: 80,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
      category: "Outerwear",
      gender: "Unisex",
      colors: ["Black", "Grey", "Teal"],
    },
    {
      id: 5,
      name: "Sports Bra Pro",
      price: 45,
      image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80",
      category: "Tops",
      gender: "Women",
      colors: ["Black", "White", "Teal"],
    },
    {
      id: 6,
      name: "Compression Tights",
      price: 60,
      image: "https://images.unsplash.com/photo-1605289355680-75fb41239154?w=600&q=80",
      category: "Bottoms",
      gender: "Men",
      colors: ["Black", "Navy"],
    },
    {
      id: 7,
      name: "Tank Top Essential",
      price: 28,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      category: "Tops",
      gender: "Women",
      colors: ["White", "Black", "Pink"],
    },
    {
      id: 8,
      name: "Performance Jacket",
      price: 85,
      originalPrice: 110,
      image: "https://images.unsplash.com/photo-1544441892-794166f1e3be?w=600&q=80",
      category: "Outerwear",
      gender: "Unisex",
      colors: ["Black", "Navy", "Teal"],
    },
  ]

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-bold mb-4">Category</h3>
        <div className="space-y-3">
          {["All", "Tops", "Bottoms", "Outerwear", "Accessories"].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={`category-${category}`} />
              <Label htmlFor={`category-${category}`} className="cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div>
        <h3 className="font-bold mb-4">Gender</h3>
        <div className="space-y-3">
          {["All", "Men", "Women", "Unisex"].map((gender) => (
            <div key={gender} className="flex items-center space-x-2">
              <Checkbox id={`gender-${gender}`} />
              <Label htmlFor={`gender-${gender}`} className="cursor-pointer">
                {gender}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            min={0}
            max={200}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="font-bold mb-4">Color</h3>
        <div className="space-y-3">
          {["Black", "White", "Grey", "Navy", "Teal", "Purple", "Pink"].map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox id={`color-${color}`} />
              <Label htmlFor={`color-${color}`} className="cursor-pointer">
                {color}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="font-bold mb-4">Size</h3>
        <div className="space-y-3">
          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox id={`size-${size}`} />
              <Label htmlFor={`size-${size}`} className="cursor-pointer">
                {size}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-36 lg:pb-0">
        {/* Page Header */}
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">All Products</h1>
            <p className="text-muted-foreground">Discover our full range of premium athletic wear</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing {products.length} products
                </p>

                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select defaultValue="featured">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                      <div className="relative h-[250px] md:h-[400px]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.originalPrice && (
                          <div className="absolute top-2 left-2 md:top-4 md:left-4 px-2 py-1 md:px-3 md:py-1 bg-destructive text-white text-xs md:text-sm font-medium rounded-full">
                            Sale
                          </div>
                        )}
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                          <Button size="sm" variant="secondary">
                            Quick View
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3 md:p-4">
                        <p className="text-xs md:text-sm text-muted-foreground mb-1">{product.category}</p>
                        <h3 className="font-semibold mb-2 text-sm md:text-base">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base md:text-lg font-bold">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-xs md:text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {product.colors.slice(0, 3).map((color, index) => (
                            <div
                              key={index}
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-border"
                              style={{
                                backgroundColor: color.toLowerCase() === "teal" ? "#38B2AC" : color.toLowerCase(),
                              }}
                            />
                          ))}
                          {product.colors.length > 3 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              +{product.colors.length - 3}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      

      <Footer />
    </div>
  )
}