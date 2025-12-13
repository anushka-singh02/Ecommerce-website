"use client"
import { publicApi } from "@/lib/axios-public"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/validators/login"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import { authService } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: any) {
    try {
      
      const response = await authService.login(data)
      console.log("Full Response:", response) 
      router.refresh()
      
      if(response.role == 'ADMIN')
      router.replace("/admin/dashboard")
    else
      router.replace("/")
    } catch(error) {
      console.error("LOGIN FAILED ON FRONTEND:", error)
      toast.error("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md">
        {/* Brand */}
        <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">
          raawr
        </h1>

        {/* Card */}
        <div className="border rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">
            Welcome back. Please enter your details.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...form.register("email")}
              placeholder="Email address"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <input
              {...form.register("password")}
              type="password"
              placeholder="Password"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
              Sign in
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Don’t have an account?{" "}
            <Link href="/signup" className="underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
