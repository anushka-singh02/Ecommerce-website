"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"

export default function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    // 1. If no token is found in the URL
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link.")
      return
    }

    const verify = async () => {
      try {
        // ✅ 2. Use fetcher instead of axios
        // fetcher automatically handles the Base URL
        await fetcher(`/auth/verify-email?token=${token}`, {
          method: "GET" 
        })
        
        setStatus("success")
        setMessage("Email verified successfully!")
      } catch (error: any) {
        console.error("Verification Error:", error)
        setStatus("error")
        // ✅ fetcher throws an Error with the message directly
        setMessage(error.message || "Verification failed or token expired.")
      }
    }

    // Run verification immediately on load
    verify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center shadow-lg border-0 sm:border">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-6 pt-6">
          
          {/* --- LOADING STATE --- */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-blue-50 rounded-full">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-500 text-sm">Please wait while we confirm your email.</p>
            </div>
          )}

          {/* --- SUCCESS STATE --- */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-green-50 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-gray-600">{message}</p>
              <Button 
                onClick={() => router.push("/login")}
                className="w-full bg-black hover:bg-gray-800 text-white transition-all mt-2"
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* --- ERROR STATE --- */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-red-50 rounded-full">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-gray-600">{message}</p>
              <div className="flex flex-col w-full gap-3 mt-2">
                <Button 
                  onClick={() => router.push("/signup")}
                  variant="outline"
                  className="w-full"
                >
                  Create New Account
                </Button>
                <Button 
                  onClick={() => router.push("/login")}
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-black"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}