"use client"

import { useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Home, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { userService } from "@/lib/api/user"
import toast from "react-hot-toast"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get("payment_id")

  useEffect(() => {
    if (!paymentId) {
      // If someone tries to access this page without a payment ID, kick them out
      router.push("/")
    } else {
      // ✅ OPTIONAL: Clear the cart automatically on success
      const clearCartOnSuccess = async () => {
        try {
          await userService.clearCart()
        } catch (error) {
          console.error("Failed to clear cart", error)
        }
      }
      clearCartOnSuccess()
    }
  }, [paymentId, router])

  if (!paymentId) return null

  return (
    <Card className="w-full max-w-md text-center border-green-200 shadow-lg animate-in fade-in zoom-in duration-300">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-4 shadow-sm">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-green-700">Payment Successful!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        
        <div className="bg-muted/50 p-4 rounded-lg border border-gray-100">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Transaction ID
          </p>
          <p className="font-mono text-sm font-medium text-gray-800 break-all">
            {paymentId}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          You can track your order status in your profile.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Link href="/profile" className="w-full">
          <Button className="w-full" variant="outline">
            <Package className="mr-2 h-4 w-4" />
            View Order
          </Button>
        </Link>
        <Link href="/" className="w-full">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Home className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-green-600" />}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}