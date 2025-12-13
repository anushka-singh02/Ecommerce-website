"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema } from "@/lib/validators/signup"
// import { api } from "@/lib/axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import { publicApi } from "@/lib/axios-public"
import Image from "next/image"


export default function SignupPage() {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: any) {
    try {
      await publicApi.post("/auth/signup", data)
      toast.success("Account created")
      router.replace("/login")
    } catch {
      toast.error("Something went wrong")
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
          <h2 className="text-xl font-semibold mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Join the Raawr community.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...form.register("name")}
              placeholder="Full name"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />

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
              Create account
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
