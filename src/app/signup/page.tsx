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
      // 1. Register User
      const response = await authService.register(data)

      // ✅ 2. Show Success Message (Hard Verification)
      // The backend returns: { message: "Registration successful! Please check your email...", success: true }

      toast.success("Account created! Please verify your email to login.", {
        duration: 5000, // Show longer so they read it
      });

      // 3. Redirect to Login (So they can login AFTER verifying)
      router.replace("/login");

    } catch (error: any) {
      console.error("SIGNUP ERROR:", error)
      const msg = error.response?.data?.message || error.message || "Something went wrong";

      if (msg.toLowerCase().includes("exists")) {
        form.setError("email", {
          type: "manual",
          message: "Email is already registered."
        })
        toast.error("Account already exists.")
      } else {
        toast.error(msg)
      }
    }
  }

  return (
  <div
    className="
      min-h-screen flex items-center justify-center px-4
      bg-black md:bg-white
    "
  >
    <div className="w-full max-w-md">

      <h1
        className="
          text-3xl font-bold text-center mb-8 tracking-wide
          text-white md:text-black
        "
      >
        raawr
      </h1>

      <div
        className="
          rounded-xl p-6 sm:p-8 shadow-sm
          bg-[#121212] border border-gray-700
          md:bg-white md:border
        "
      >
        <h2 className="text-xl font-semibold mb-1 text-white md:text-black">
          Create account
        </h2>

        <p className="text-sm mb-6 text-gray-400 md:text-gray-500">
          Join the Raawr community.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Full Name */}
          <div>
            <input
              {...form.register("name")}
              placeholder="Full name"
              className={`
                w-full rounded-md px-3 py-2
                bg-black border border-gray-600 text-white
                focus:outline-none focus:ring-2 focus:ring-white
                md:bg-white md:border md:text-black md:focus:ring-black
                ${form.formState.errors.name ? "border-red-500 focus:ring-red-200" : ""}
              `}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.name.message as string}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              {...form.register("email")}
              placeholder="Email address"
              className={`
                w-full rounded-md px-3 py-2
                bg-black border border-gray-600 text-white
                focus:outline-none focus:ring-2 focus:ring-white
                md:bg-white md:border md:text-black md:focus:ring-black
                ${form.formState.errors.email ? "border-red-500 focus:ring-red-200" : ""}
              `}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.email.message as string}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              {...form.register("password")}
              type="password"
              placeholder="Password"
              className={`
                w-full rounded-md px-3 py-2
                bg-black border border-gray-600 text-white
                focus:outline-none focus:ring-2 focus:ring-white
                md:bg-white md:border md:text-black md:focus:ring-black
                ${form.formState.errors.password ? "border-red-500 focus:ring-red-200" : ""}
              `}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.password.message as string}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="
              w-full py-2 rounded-md transition disabled:opacity-50
              bg-white text-black hover:bg-gray-200
              md:bg-black md:text-white md:hover:bg-gray-800
            "
          >
            {form.formState.isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-400 md:text-black">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline font-medium text-white md:text-black"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>
)

}