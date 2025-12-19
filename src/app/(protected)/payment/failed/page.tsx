"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { XCircle, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  // Capture the reason sent from the backend (e.g. ?reason=hash_mismatch)
  const reason = searchParams.get("reason")

  const getErrorMessage = (code: string | null) => {
    switch (code) {
      case "hash_mismatch": return "Security verification failed. Please try again.";
      case "transaction_failed": return "The transaction was declined by the bank.";
      case "order_not_found": return "Order session expired or invalid.";
      default: return "Something went wrong while processing your payment.";
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 bg-red-50/30">
        <Card className="w-full max-w-md text-center border-red-200 shadow-lg animate-in fade-in zoom-in duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-4 shadow-sm">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We couldn't process your payment. No money was deducted.
            </p>
            
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-800 font-medium">
              Error: {getErrorMessage(reason)}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/checkout" className="w-full">
              <Button className="w-full" variant="default">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button className="w-full" variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}