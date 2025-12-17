"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema } from "@/lib/validators/signup"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/lib/api/auth"

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  })

  async function onSubmit(data: any) {
    try {
      const response = await authService.register(data)
      const { user, accessToken } = response.data;
      
      if (user && accessToken) {
        login(user, accessToken)
        toast.success("Account created successfully")
        router.replace("/profile")
      } else {
        router.replace("/login")
      }

    } catch (error: any) {
      console.error(error)
      const msg = error.message || "Something went wrong"

      
      if (msg.toLowerCase().includes("exists")) {
        // Show error on specific fields instead of just a toast
        form.setError("email", { 
          type: "manual", 
          message: "Email is already taken." 
        })
  
        
        
        toast.error("Account already exists. Try logging in.")
      } else {
        // Generic error
        toast.error(msg)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">
          raawr
        </h1>

        <div className="border rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Join the Raawr community.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <input
                {...form.register("name")}
                placeholder="Full name"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black ${
                  form.formState.errors.name ? "border-red-500 focus:ring-red-200" : ""
                }`}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message as string}</p>
              )}
            </div>

       

            {/* Email */}
            <div>
              <input
                {...form.register("email")}
                placeholder="Email address"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black ${
                  form.formState.errors.email ? "border-red-500 focus:ring-red-200" : ""
                }`}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message as string}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                {...form.register("password")}
                type="password"
                placeholder="Password"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black ${
                  form.formState.errors.password ? "border-red-500 focus:ring-red-200" : ""
                }`}
              />
               {form.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message as string}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            >
              {form.formState.isSubmitting ? "Creating..." : "Create account"}
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