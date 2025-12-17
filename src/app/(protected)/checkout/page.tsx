"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Lock, CreditCard, Smartphone, Wallet } from "lucide-react"
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/payment"
import { RazorpayPaymentResponse } from "@/lib/razorpay.types"

import { toast } from "sonner"

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })

  // Mock cart items - in real app, get from cart context/state
  const [cartItems] = useState<CartItem[]>([
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 75 ? 0 : 10
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + shipping + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please enter your full name")
      return false
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return false
    }
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number")
      return false
    }
    if (!formData.address) {
      toast.error("Please enter your address")
      return false
    }
    if (!formData.city) {
      toast.error("Please enter your city")
      return false
    }
    if (!formData.state) {
      toast.error("Please enter your state")
      return false
    }
    if (!formData.zipCode || !/^\d{6}$/.test(formData.zipCode)) {
      toast.error("Please enter a valid 6-digit PIN code")
      return false
    }
    return true
  }

  const handlePayment = async () => {
    console.log("🔥 Complete Payment clicked");

  // if (!validateForm()) return

  try {
    setLoading(true)

    const amountInPaise = total * 100

    // 1️⃣ Create order from backend
    const order = await createRazorpayOrder(amountInPaise)
    console.log("✅ Razorpay order:", order);

    // 2️⃣ Razorpay options
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: amountInPaise,
      currency: "INR",
      name: "Raawr",
      description: "Order Payment",
      order_id: order.id,

      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },

      theme: {
        color: "#000000",
      },

      handler: async (response: RazorpayPaymentResponse) => {
        try {
          await verifyRazorpayPayment(response)
          toast.success("Payment successful!")
          router.push(`/payment-success?payment_id=${response.razorpay_payment_id}`)
        } catch {
          toast.error("Payment verification failed")
        }
      },

      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled")
          setLoading(false)
        },
      },
    }
    console.log("window.Razorpay =", window.Razorpay);


    // 3️⃣ Open Razorpay modal
    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  } catch (err) {
    console.error(err)
    toast.error("Payment failed. Please try again.")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address, apartment, suite, etc."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Mumbai"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="Maharashtra"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">PIN Code *</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="400001"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        We accept all major payment methods via Razorpay
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                          <CreditCard className="h-5 w-5" />
                          <span className="text-sm font-medium">Cards</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                          <Smartphone className="h-5 w-5" />
                          <span className="text-sm font-medium">UPI</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                          <Wallet className="h-5 w-5" />
                          <span className="text-sm font-medium">Wallets</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                          <span className="text-sm font-medium">Net Banking</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight mb-1">
                              {item.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-1">
                              {item.color} / {item.size}
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Qty: {item.quantity}</span>
                              <span className="ml-2 font-medium">${item.price * item.quantity}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">${subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? "Free" : `$${shipping}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (GST 18%)</span>
                        <span className="font-medium">${tax}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${total}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePayment}
                      disabled={loading}
                    >
                      {loading ? (
                        "Processing..."
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Complete Payment
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Your payment information is secure and encrypted
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
