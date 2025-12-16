"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ShoppingCart, Truck, RotateCcw, Shield } from "lucide-react"
import Link from "next/link"

// --- DYNAMIC IMPORTS ---
import { useQuery } from "@tanstack/react-query"
import { storeService } from "@/lib/api/store"
import toast from "react-hot-toast"

export default function ProductDetailPage() {
  const params = useParams()
  // Handle array vs string ID safely
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // --- 1. FETCH DATA ---
  const { data: fetchedProduct, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => storeService.getProductById(id!),
    enabled: !!id,
  })

  // --- 2. LOCAL STATE ---
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // --- 3. DATA NORMALIZATION ---
  // If data is loading, or failed, fallback to safe defaults to prevent UI crash

const rawProduct = fetchedProduct?.data; 

  const product = rawProduct ? {
    id: rawProduct.id,
    name: rawProduct.name,
    price: Number(rawProduct.price),
    
    // Ensure numbers for calculations
    originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : null,
    
    description: rawProduct.description || "No description available.",
    
    // Ensure array exists
    images: rawProduct.images?.length > 0 ? rawProduct.images : ["https://placehold.co/600x600?text=No+Image"],
    
    sizes: rawProduct.sizes || [],
    
    // Parse colors safely. DB stores JSON, so we expect [{name, hex}]
    colors: Array.isArray(rawProduct.colors) ? rawProduct.colors : [],
    
    features: rawProduct.features || [],
    materials: rawProduct.materials || "Not specified",
    care: rawProduct.care || "Not specified",
  } : null;

  // Auto-select first color/size if available (Optional UX improvement)
  useEffect(() => {
    if (product) {
        if (product.colors.length > 0 && !selectedColor) setSelectedColor(product.colors[0].name);
        // We usually don't auto-select size to force user choice
    }
  }, [product]);


  // Mock Related (You can make this dynamic later by fetching 'category' products)
  const relatedProducts = [
    {
      id: "mock-2",
      name: "Training Shorts",
      price: 40,
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
    },
    {
      id: "mock-3",
      name: "Sports Socks",
      price: 15,
      image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80",
    },
    {
      id: "mock-4",
      name: "Performance Cap",
      price: 25,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
    },
  ]

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes.length > 0) {
        toast.error("Please select a size");
        return;
    }
    // TODO: Connect to your Cart Context here
    toast.success(`Added ${quantity} ${product?.name} to cart`);
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
            <Footer />
        </div>
    )
  }

  // --- ERROR STATE ---
  if (!product) {
     return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Product not found</h2>
                <Link href="/products" className="text-primary hover:underline">Return to Shop</Link>
            </div>
            <Footer />
        </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">Products</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-gray-100">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized // Add this if using external URLs like Unsplash/Cloudinary to avoid config errors
                />
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {product.images.map((image:string, index:number) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? "border-primary" : "border-transparent"
                        }`}
                    >
                        <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                        />
                    </button>
                    ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <Badge variant="destructive">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Color Selection - DYNAMIC */}
              {product.colors.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                    <Label className="font-semibold">Color</Label>
                    <span className="text-sm text-muted-foreground">{selectedColor}</span>
                    </div>
                    <div className="flex gap-3">
                    {product.colors.map((color: any) => (
                        <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${
                            selectedColor === color.name ? "border-primary scale-110" : "border-gray-200"
                        }`}
                        // Use inline style for the specific hex code
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={color.name}
                        />
                    ))}
                    </div>
                </div>
              )}

              {/* Size Selection - DYNAMIC */}
              {product.sizes.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                    <Label className="font-semibold">Size</Label>
                    <Link href="/size-guide" className="text-sm text-primary hover:underline">
                        Size Guide
                    </Link>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                    {product.sizes.map((size: string) => (
                        <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 rounded-md border-2 font-medium transition-all ${
                            selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                        >
                        {size}
                        </button>
                    ))}
                    </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <Label className="font-semibold mb-3 block">Quantity</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={product.sizes.length > 0 && !selectedSize}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    handleAddToCart();
                    // In real app: router.push('/checkout')
                  }}
                  disabled={product.sizes.length > 0 && !selectedSize}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {product.sizes.length > 0 && !selectedSize && (
                <p className="text-sm text-destructive">Please select a size</p>
              )}

              {/* Features - Static for now, can be dynamic if you add boolean flags */}
              <div className="grid grid-cols-1 gap-4 pt-6 border-t">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-muted-foreground">On orders over $75</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Easy Returns</p>
                    <p className="text-sm text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-sm text-muted-foreground">100% secure transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="care">Care Instructions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Product Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Materials:</span> {product.materials}</p>
                      <p><span className="font-medium">Fit:</span> Regular / True to size</p> 
                      {/* ^ Note: 'Fit' is not in DB schema yet, kept hardcoded */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Key Features</h3>
                    {product.features.length > 0 ? (
                        <ul className="space-y-2">
                            {product.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No specific features listed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="care" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Care Instructions</h3>
                    <p>{product.care}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products - STATIC (Mock) for now */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                  <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                    <div className="relative h-[350px]">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                      <span className="text-lg font-bold">${relatedProduct.price}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}