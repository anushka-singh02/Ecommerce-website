"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/validators/login"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import { authService } from '@/lib/api/auth';
// 1. Import the store
import { useAuthStore } from "@/store/useAuthStore"

export default function LoginPage() {
  const router = useRouter()
  // 2. Get the login action from the store
  const login = useAuthStore((state) => state.login)

  const form = useForm({
    resolver: zodResolver(loginSchema),
  })

async function onSubmit(data: any) {
    try {
      const response = await authService.login(data)
      
      const user = response.user || response;
      const token = response.accessToken || response.token;

      if (!token) throw new Error("No access token received");

      login(user, token);
      toast.success("Welcome back!");
      router.refresh();

      if (user.role === 'ADMIN') {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/");
      }

    } catch (error: any) {
      console.error("LOGIN ERROR:", error)

      
      const serverMessage = error.message;

      if (serverMessage) {
        toast.error(serverMessage);
      } else {
        
        toast.error("Invalid email or password");
      }
    }
  }

  return (
  <div className="
    min-h-screen flex items-center justify-center px-4
    bg-black md:bg-white
  ">
    <div className="w-full max-w-md">
      
      {/* Brand */}
      <h1 className="
        text-3xl font-bold text-center mb-8 tracking-wide
        text-white md:text-black
      ">
        raawr
      </h1>

      {/* Card */}
      <div className="
        rounded-xl p-6 sm:p-8 shadow-sm
        bg-[#121212] border border-gray-700
        md:bg-white md:border
      ">
        <h2 className="text-xl font-semibold mb-1 text-white md:text-black">
          Sign in
        </h2>

        <p className="text-sm mb-6 text-gray-400 md:text-gray-500">
          Welcome back. Please enter your details.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...form.register("email")}
            placeholder="Email address"
            className="
              w-full rounded-md px-3 py-2
              bg-black border border-gray-600 text-white
              focus:outline-none focus:ring-2 focus:ring-white
              md:bg-white md:border md:text-black md:focus:ring-black
            "
          />

          <input
            {...form.register("password")}
            type="password"
            placeholder="Password"
            className="
              w-full rounded-md px-3 py-2
              bg-black border border-gray-600 text-white
              focus:outline-none focus:ring-2 focus:ring-white
              md:bg-white md:border md:text-black md:focus:ring-black
            "
          />

          <button
            type="submit"
            className="
              w-full py-2 rounded-md transition
              bg-white text-black hover:bg-gray-200
              md:bg-black md:text-white md:hover:bg-gray-800
            "
          >
            Sign in
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-400 md:text-black">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="underline font-medium text-white md:text-black"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>
)

}