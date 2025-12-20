"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag, Lock, CreditCard, Banknote, Loader2, Truck } from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "@/store/useAuthStore"
import { userService } from "@/lib/api/user"
import { paymentService } from "@/lib/api/payment" // ✅ UPDATED IMPORT

// --- PAYU CONFIG ---
const PAYU_ACTION_URL = "https://test.payu.in/_payment"; // Use https://secure.payu.in/_payment for Prod

// --- TYPES ---
interface CartItem { id: string; name: string; price: number; image: string; size: string; color: string; quantity: number; }
interface Address { id: string; name: string; phone: string; tag: string; street: string; city: string; state: string; zip: string; }
interface CheckoutFormData {
  firstName: string; lastName: string; email: string; phone: string; address: string; city: string; state: string; zipCode: string; country: string;
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isBuyNowMode = searchParams.get("mode") === "buy_now"

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE")

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zipCode: "", country: "India",
  })
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login")
      return
    }
    if (isAuthenticated) fetchCheckoutData()
  }, [isAuthenticated, authLoading, router, isBuyNowMode])

  const fetchCheckoutData = async () => {
    setDataLoading(true)
    try {
      const addressData = await userService.getAddresses().catch(() => [])
      setSavedAddresses(addressData as Address[])

      if (isBuyNowMode) {
        const storedItem = localStorage.getItem("directCheckoutItem")
        if (storedItem) {
          setCartItems(JSON.parse(storedItem))
        } else {
          toast.error("Session expired")
          router.replace("/products")
          return
        }
      } else {
        const cartData = await userService.getCart()
        // @ts-ignore
        const mappedCart = (cartData?.items || []).map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          price: Number(item.product.price),
          image: item.product.images?.[0] || "",
          size: item.size,
          color: item.color,
          quantity: item.quantity
        }))
        setCartItems(mappedCart)
      }

      if (user) {
        const nameParts = user.name.split(" ")
        setFormData(prev => ({
          ...prev,
          firstName: prev.firstName || nameParts[0] || "",
          lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
          email: prev.email || user.email || ""
        }))
      }
    } catch (error) {
      toast.error("Failed to load details")
    } finally {
      setDataLoading(false)
    }
  }

  const handleSelectAddress = (addressId: string) => {
    const selected = savedAddresses.find(addr => addr.id === addressId)
    if (selected) {
      const nameParts = selected.name.split(" ")
      setFormData(prev => ({
        ...prev, firstName: nameParts[0] || "", lastName: nameParts.slice(1).join(" ") || "", phone: selected.phone || "", address: selected.street || "", city: selected.city || "", state: selected.state || "", zipCode: selected.zip || "",
      }))
      setErrors({})
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<CheckoutFormData> = {}
    let isValid = true

    if (!formData.firstName.trim()) { newErrors.firstName = "Required"; isValid = false; }
    if (!formData.lastName.trim()) { newErrors.lastName = "Required"; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "Required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Invalid email"; isValid = false; }
    if (!formData.phone.trim()) { newErrors.phone = "Required"; isValid = false; }
    else if (!/^\d{10}$/.test(formData.phone)) { newErrors.phone = "10 digits req"; isValid = false; }
    if (!formData.address.trim()) { newErrors.address = "Required"; isValid = false; }
    if (!formData.city.trim()) { newErrors.city = "Required"; isValid = false; }
    if (!formData.state.trim()) { newErrors.state = "Required"; isValid = false; }
    if (!formData.zipCode.trim()) { newErrors.zipCode = "Required"; isValid = false; }
    else if (!/^\d{6}$/.test(formData.zipCode)) { newErrors.zipCode = "6 digits req"; isValid = false; }

    setErrors(newErrors)
    return isValid
  }

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error("Please fix form errors")
      return
    }

    try {
      setLoading(true)

      let payload: any = {
        address: formData,
        paymentMethod: paymentMethod
      };

      if (isBuyNowMode) {
        payload.directItems = cartItems.map(item => ({
          productId: (item as any).productId || item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }));
      }

      // ✅ 1. Call API using Payment Service
      // The fetcher returns the parsed JSON directly (e.g., { success: true, ... })
      const data = await paymentService.createOrder(payload);

      if (!data || !data.success) {
        throw new Error("Failed to create order")
      }

      // ✅ CLEAR STORAGE
      if (isBuyNowMode) localStorage.removeItem("directCheckoutItem");

      // === SCENARIO A: CASH ON DELIVERY ===
      if (paymentMethod === "COD") {
        toast.success("Order Placed Successfully!")
        router.push(`/payment/success?orderId=${data.orderId}`)
        return
      }

      // === SCENARIO B: ONLINE PAYMENT (PAYU) ===
      else if (data.mode === 'ONLINE' && data.payuParams) {
        const params = data.payuParams;

        // Create hidden form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = PAYU_ACTION_URL;

        // Add inputs
        Object.keys(params).forEach(key => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = params[key];
          form.appendChild(input);
        });

        // Submit
        document.body.appendChild(form);
        form.submit();
      }

    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  if (authLoading || dataLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

  if (!dataLoading && cartItems.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><ShoppingBag className="h-16 w-16 text-muted-foreground" /><h2 className="text-2xl font-bold">Checkout is empty</h2><Button onClick={() => router.push("/products")}>Go Shopping</Button></div>

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 75 ? 0 : 10
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              {isBuyNowMode ? "Buy Now Checkout" : "Checkout"}
            </h1>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* LEFT COLUMN: FORMS */}
              <div className="lg:col-span-2 space-y-6">

                {/* ADDRESS */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Shipping Information</CardTitle>
                    {savedAddresses.length > 0 && (
                      <div className="w-[200px]">
                        <Select onValueChange={handleSelectAddress}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Load Saved Address" /></SelectTrigger>
                          <SelectContent>{savedAddresses.map(addr => <SelectItem key={addr.id} value={addr.id}>{addr.tag} - {addr.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input name="firstName" value={formData.firstName} onChange={handleInputChange} className={errors.firstName ? "border-red-500" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input name="lastName" value={formData.lastName} onChange={handleInputChange} className={errors.lastName ? "border-red-500" : ""} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input name="email" value={formData.email} onChange={handleInputChange} className={errors.email ? "border-red-500" : ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} className={errors.phone ? "border-red-500" : ""} maxLength={10} placeholder="10 digits" />
                    </div>
                    <div className="space-y-2">
                      <Label>Address *</Label>
                      <Input name="address" value={formData.address} onChange={handleInputChange} className={errors.address ? "border-red-500" : ""} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City *</Label>
                        <Input name="city" value={formData.city} onChange={handleInputChange} className={errors.city ? "border-red-500" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label>State *</Label>
                        <Input name="state" value={formData.state} onChange={handleInputChange} className={errors.state ? "border-red-500" : ""} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>PIN Code *</Label>
                        <Input name="zipCode" value={formData.zipCode} onChange={handleInputChange} className={errors.zipCode ? "border-red-500" : ""} maxLength={6} />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input name="country" value={formData.country} disabled />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PAYMENT METHOD */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("ONLINE")}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg border transition-all text-sm font-medium ${paymentMethod === "ONLINE"
                          ? "border-black bg-black text-white shadow-md"
                          : "border-input hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Online Payment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("COD")}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg border transition-all text-sm font-medium ${paymentMethod === "COD"
                          ? "border-black bg-black text-white shadow-md"
                          : "border-input hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <Banknote className="h-4 w-4" />
                        <span>Cash on Delivery</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN: SUMMARY */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader><CardTitle className="flex gap-2"><ShoppingBag className="h-5 w-5" /> Order Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-16 h-16 rounded bg-muted overflow-hidden border">
                            {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">{item.color} / {item.size}</p>
                            <p className="text-sm flex justify-between mt-1"><span className="text-muted-foreground">Qty: {item.quantity}</span><span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                    </div>

                    <Button className="w-full" size="lg" onClick={handlePayment} disabled={loading}>
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                      ) : (
                        paymentMethod === "COD"
                          ? <><Truck className="mr-2 h-4 w-4" /> Place Order (COD)</>
                          : <><Lock className="mr-2 h-4 w-4" /> Pay ₹{total.toFixed(2)}</>
                      )}
                    </Button>
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