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
import { SlidersHorizontal, Loader2 } from "lucide-react" // Added Loader2 for button state

import { useQuery } from "@tanstack/react-query"
import { storeService } from "@/lib/api/store"

export default function ProductsPage() {
  // --- 1. DRAFT STATE (Updates instantly as user clicks, NO API call) ---
  const [priceRange, setPriceRange] = useState([0, 200])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("featured") // Sort usually stays instant, but can be moved if desired
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // --- 2. ACTIVE STATE (Passed to API, updates ONLY on button click) ---
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    gender: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    priceRange: [0, 200],
  })

  // --- 3. APPLY FUNCTION ---
  const handleApplyFilters = () => {
    setActiveFilters({
      categories: selectedCategories,
      gender: selectedGenders,
      colors: selectedColors,
      sizes: selectedSizes,
      priceRange: priceRange,
    })
    // Close mobile menu if open
    setMobileFiltersOpen(false) 
  }

  // --- 4. DATA FETCHING (Depends on ACTIVE STATE) ---
  const { data: rawData, isLoading, isFetching } = useQuery({
    // Only refetch when 'activeFilters' or 'sortBy' changes
    queryKey: ["products-page", activeFilters, sortBy], 
    queryFn: () => storeService.getAllProducts({
      category: activeFilters.categories.length ? activeFilters.categories.join(",") : undefined,
      gender: activeFilters.gender.length ? activeFilters.gender.join(",") : undefined,
      colors: activeFilters.colors.length ? activeFilters.colors.join(",") : undefined,
      sizes: activeFilters.sizes.length ? activeFilters.sizes.join(",") : undefined,
      minPrice: activeFilters.priceRange[0],
      maxPrice: activeFilters.priceRange[1],
      sort: sortBy,
    }),
  })

  // --- DATA NORMALIZATION ---
  const productList = rawData?.data?.products || []; 
  const products = Array.isArray(productList) ? productList.map((item: any) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
    image: item.images?.[0] || item.image || "https://placehold.co/600x800/png?text=No+Image",
    category: item.category || "Uncategorized",
    gender: item.gender || "Unisex",
    colors: Array.isArray(item.colors) ? item.colors.map((c: any) => c.hex || c.name || c) : [],
  })) : [];

  // --- FILTER HANDLERS ---
  const toggleFilter = (item: string, currentList: string[], setList: (l: string[]) => void) => {
    if (currentList.includes(item)) {
      setList(currentList.filter((i) => i !== item))
    } else {
      setList([...currentList, item])
    }
  }

  const FilterSidebar = () => (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex-1 space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="font-bold mb-4">Category</h3>
          <div className="space-y-3">
            {["Tops", "Bottoms", "Outerwear", "Accessories"].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category}`} 
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleFilter(category, selectedCategories, setSelectedCategories)}
                />
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
            {["Men", "Women", "Unisex"].map((gender) => (
              <div key={gender} className="flex items-center space-x-2">
                <Checkbox 
                  id={`gender-${gender}`} 
                  checked={selectedGenders.includes(gender)}
                  onCheckedChange={() => toggleFilter(gender, selectedGenders, setSelectedGenders)}
                />
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
                <Checkbox 
                  id={`color-${color}`} 
                  checked={selectedColors.includes(color)}
                  onCheckedChange={() => toggleFilter(color, selectedColors, setSelectedColors)}
                />
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
                <Checkbox 
                  id={`size-${size}`} 
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                />
                <Label htmlFor={`size-${size}`} className="cursor-pointer">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- NEW APPLY BUTTON --- */}
      <div className="pt-6 mt-4 border-t sticky bottom-0 bg-white pb-4">
        <Button 
            className="w-full" 
            onClick={handleApplyFilters}
            disabled={isFetching} // Show disabled state while loading
        >
            {isFetching ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                </>
            ) : (
                "Apply Filters"
            )}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-36 lg:pb-0">
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">All Products</h1>
            <p className="text-muted-foreground">Discover our full range of premium athletic wear</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
                <FilterSidebar />
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing {products.length} products
                </p>

                <div className="flex items-center gap-4">
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] flex flex-col">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 flex-1 overflow-y-auto">
                        <FilterSidebar />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">No products found matching your filters.</p>
                    <Button variant="link" onClick={() => {
                        // Clear draft state
                        setSelectedCategories([]);
                        setSelectedGenders([]);
                        setPriceRange([0, 200]);
                        setSelectedColors([]);
                        setSelectedSizes([]);
                        
                        // Clear active state (triggers refetch)
                        setActiveFilters({
                            categories: [],
                            gender: [],
                            colors: [],
                            sizes: [],
                            priceRange: [0, 200]
                        });
                    }}>Clear all filters</Button>
                </div>
              ) : (
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
                            unoptimized
                          />
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="absolute top-2 left-2 md:top-4 md:left-4 px-2 py-1 md:px-3 md:py-1 bg-destructive text-white text-xs md:text-sm font-medium rounded-full">
                              Sale
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 md:p-4">
                          <p className="text-xs md:text-sm text-muted-foreground mb-1">{product.category}</p>
                          <h3 className="font-semibold mb-2 text-sm md:text-base">{product.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base md:text-lg font-bold">${product.price.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-1">
                            {product.colors.slice(0, 3).map((color: string, index: number) => (
                              <div
                                key={index}
                                className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-border"
                                style={{
                                  backgroundColor: color.startsWith("#") ? color : (color.toLowerCase() === "teal" ? "#38B2AC" : color.toLowerCase()),
                                }}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}