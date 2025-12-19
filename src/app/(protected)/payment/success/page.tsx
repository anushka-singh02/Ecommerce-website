"use client"

import { useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Home, Package, Loader2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import toast from "react-hot-toast"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // ✅ 1. Handle all possible param names (PayU uses 'id', COD uses 'orderId')
  const referenceId = searchParams.get("id") || searchParams.get("orderId") || searchParams.get("payment_id")

  useEffect(() => {
    if (!referenceId) {
      // If accessed without an ID, redirect home
      router.push("/")
    } 
    // Note: We removed the clearCart() call here because the Backend now handles it 
    // automatically upon successful payment or COD order creation.
  }, [referenceId, router])

  const copyToClipboard = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId)
      toast.success("Order ID copied!")
    }
  }

  if (!referenceId) return null

  return (
    <Card className="w-full max-w-md text-center border-green-200 shadow-lg animate-in fade-in zoom-in duration-300">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-4 shadow-sm animate-bounce-slow">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-green-700">Order Placed Successfully!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Thank you for your purchase. We have received your order and it is being processed.
        </p>
        
        <div className="bg-muted/50 p-4 rounded-lg border border-gray-100 relative group">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Order Reference
          </p>
          <div className="flex items-center justify-center gap-2">
            <p className="font-mono text-sm font-medium text-gray-800 break-all">
              {referenceId}
            </p>
            <button 
              onClick={copyToClipboard}
              className="p-1 hover:bg-gray-200 rounded transition text-gray-500"
              title="Copy ID"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          You will receive an email confirmation shortly.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Link href={`/profile`} className="w-full">
          <Button className="w-full" variant="outline">
            <Package className="mr-2 h-4 w-4" />
            View Order Details
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