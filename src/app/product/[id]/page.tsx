"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ShoppingCart, Truck, RotateCcw, Shield, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

// --- SERVICES & LIBS ---
import { useQuery } from "@tanstack/react-query"
import { storeService } from "@/lib/api/store"
import { userService } from "@/lib/api/user"
import { useAuthStore } from "@/store/useAuthStore"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  // ✅ Get Auth Status from Store
  const { isAuthenticated } = useAuthStore()

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // --- 1. FETCH PRODUCT DATA ---
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

  // Loading States
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [isWishlisting, setIsWishlisting] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)

  // --- 3. DATA NORMALIZATION ---
  const rawProduct = fetchedProduct?.data;
  const product = rawProduct ? {
    id: rawProduct.id,
    name: rawProduct.name,
    price: Number(rawProduct.price),
    originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : null,
    description: rawProduct.description || "No description available.",
    images: rawProduct.images?.length > 0 ? rawProduct.images : ["https://placehold.co/600x600?text=No+Image"],
    sizes: rawProduct.sizes || [],
    colors: Array.isArray(rawProduct.colors) ? rawProduct.colors : [],
    features: rawProduct.features || [],
    materials: rawProduct.materials || "Not specified",
    care: rawProduct.care || "Not specified",
  } : null;

  // --- 4. EFFECTS ---

  useEffect(() => {
    if (product) {
      // 1. Set initial Color
      if (product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0].name);
      }

      // 2. Set initial Size
      // Note: 'sizes' are strings, so we use product.sizes[0], not .name
      if (product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]); // ✅ Added 'product' here so it runs when data loads

  // Check Wishlist Status (Only if logged in)
  useEffect(() => {
    const checkWishlist = async () => {
      if (!id || !isAuthenticated) return; // Skip if not logged in
      try {
        const res: any = await userService.checkWishlistStatus(id);
        if (res?.exists) setIsInWishlist(true);
      } catch (error) {
        console.log("Wishlist check skipped");
      }
    };
    checkWishlist();
  }, [id, isAuthenticated]);


  // --- 5. AUTH CHECK HELPER ---
  const checkAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      router.push("/login"); // 👈 Redirect occurs here
      return false;
    }
    return true;
  };

  // --- 6. ACTION HANDLERS ---

  const handleAddToCart = async () => {
    // 1. Check Login First
    if (!checkAuth()) return;

    // 2. Validate Size Selection
    if (product?.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product?.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    setIsAddingToCart(true);

    try {
      await userService.addToCart({
        productId: product!.id,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor
      });


      toast.success("Added to cart");

    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  }

  const handleToggleWishlist = async () => {
    // 1. Check Login First
    if (!checkAuth()) return;

    setIsWishlisting(true);
    try {
      if (isInWishlist) {
        await userService.removeFromWishlist(product!.id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await userService.addToWishlist(product!.id);
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsWishlisting(false);
    }
  }

  const handleBuyNow = async () => {
    if (!checkAuth()) return;

    if (product?.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product?.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    setIsBuyingNow(true);
    try {
      // Create the item object for checkout
      const directItem = {
        id: product!.id,        // needed for display
        productId: product!.id, // needed for backend
        name: product!.name,
        price: product!.price,
        image: product!.images[0],
        size: selectedSize || "N/A",
        color: selectedColor || "N/A",
        quantity: quantity
      };

      // Save to LocalStorage
      localStorage.setItem("directCheckoutItem", JSON.stringify([directItem]));

      // Redirect immediately
      router.push("/checkout?mode=buy_now");
    } catch (err) {
      console.error(err);
      toast.error("Error processing request");
      setIsBuyingNow(false); // Only stop loading if we failed before redirect
    }
  }
  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

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
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border ">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? "border-primary" : "border-transparent"
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
                  <span className="text-3xl font-bold">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                      <Badge variant="destructive">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Color Selection */}
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
                        className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color.name ? "border-primary scale-110" : "border-gray-200"
                          }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
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
                        className={`py-3 rounded-md border-2 font-medium transition-all ${selectedSize === size
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

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => handleAddToCart()}
                  disabled={isAddingToCart || isBuyingNow}
                >
                  {isAddingToCart ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>

                <Button
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => handleBuyNow()}
                  disabled={isAddingToCart || isBuyingNow}
                >
                  {isBuyingNow ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  {isBuyingNow ? "Processing..." : "Buy Now"}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleToggleWishlist}
                  disabled={isWishlisting}
                  className={isInWishlist ? "text-red-500 border-red-200 bg-red-50" : ""}
                >
                  {isWishlisting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                  )}
                </Button>
              </div>

              {product.sizes.length > 0 && !selectedSize && (
                <p className="text-sm text-destructive animate-pulse">Please select a size to continue</p>
              )}

              {/* Static Features (Unchanged) */}
              <div className="grid grid-cols-1 gap-4 pt-6 border-t">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-muted-foreground">On orders over ₹75</p>
                  </div>
                </div>
                {/* ... other features ... */}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="care">Care Instructions</TabsTrigger>
              </TabsList>

              {/* 1. DETAILS TAB */}
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Product Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Materials:</span> {product.materials}</p>
                      <p><span className="font-medium">Gender:</span> {rawProduct?.gender || "Unisex"}</p>
                      <p><span className="font-medium">Category:</span> {rawProduct?.category}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 2. FEATURES TAB */}
              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Product Features</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      {product.features.length > 0 ? (
                        product.features.map((feature: string, i: number) => (
                          <li key={i}>{feature}</li>
                        ))
                      ) : (
                        <li>No features listed.</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 3. CARE TAB */}
              <TabsContent value="care" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Care Instructions</h3>
                    <p className="text-muted-foreground">{product.care}</p>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
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