"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, Plus, Minus, ShoppingBag, Sparkles, Truck, Shield } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

interface CartSidebarProps {
  open: boolean
  onClose: () => void
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const router = useRouter()
  // Mock cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Flex Performance Tee",
      price: 35,
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&q=80",
      size: "M",
      color: "Black",
      quantity: 1,
    },
    {
      id: 2,
      name: "Training Shorts",
      price: 40,
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200&q=80",
      size: "L",
      color: "Navy",
      quantity: 2,
    },
  ])

  const updateQuantity = (id: number, change: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const handleCheckout = () => {
    onClose()
    router.push("/checkout")
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 75 ? 0 : 10
  const total = subtotal + shipping
  const freeShippingProgress = Math.min((subtotal / 75) * 100, 100)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header - Enhanced for mobile */}
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-background via-muted/30 to-background">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="p-2 sm:p-2.5 rounded-full bg-primary/10">
                <ShoppingBag className="h-5 w-5 sm:h-5 sm:w-5 text-primary" />
              </div>
              <span>Your Cart</span>
              <span className="ml-auto text-sm font-normal text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </SheetTitle>
          </SheetHeader>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-muted to-muted/50">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl sm:text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-8 sm:mb-6 text-sm max-w-[200px]">
              Discover amazing products and add them to your cart
            </p>
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90 px-8 py-6 sm:py-4 text-base sm:text-sm rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress - Enhanced for mobile */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10">
              {subtotal >= 75 ? (
                <div className="flex items-center gap-3 text-emerald-600">
                  <div className="p-1.5 rounded-full bg-emerald-500/20">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">You&apos;ve unlocked FREE shipping!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Add <span className="font-semibold text-foreground">${(75 - subtotal).toFixed(2)}</span> for free shipping
                    </span>
                  </div>
                  <div className="h-2 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 sm:px-6 space-y-4 sm:space-y-4">
                {cartItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 p-3 sm:p-0 rounded-2xl sm:rounded-none bg-muted/30 sm:bg-transparent"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative w-24 h-28 sm:w-24 sm:h-24 rounded-xl sm:rounded-md overflow-hidden bg-muted flex-shrink-0 shadow-sm">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1 sm:py-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm sm:text-sm leading-tight pr-2">
                          {item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 -mt-1 -mr-1 sm:-mr-2 rounded-full hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-2">
                        {item.color} / {item.size}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0 bg-background sm:bg-transparent border rounded-full sm:rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 rounded-full sm:rounded-md"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 rounded-full sm:rounded-md"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-base sm:text-base">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer - Enhanced for mobile */}
            <div className="p-4 sm:p-6 border-t bg-gradient-to-t from-muted/50 to-background space-y-4">
              {/* Order Summary */}
              <div className="space-y-3 sm:space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : ''}`}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-xl sm:text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust badges - Mobile only */}
              <div className="flex items-center justify-center gap-4 py-2 sm:hidden">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Secure</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  <span>Fast Delivery</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 sm:space-y-2">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 h-14 sm:h-11 text-base sm:text-sm font-semibold rounded-full sm:rounded-md shadow-lg shadow-primary/25 sm:shadow-none" 
                  size="lg" 
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 sm:h-10 text-sm rounded-full sm:rounded-md" 
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}