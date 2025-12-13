"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/validators/login"
import { api } from "@/lib/axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const form = useForm({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: any) {
    try {
      await api.post("/auth/login", data)
      router.replace("/admin/dashboard")
    } catch {
      toast.error("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-8 w-96 shadow">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <input {...form.register("email")} placeholder="Email" className="input" />
        <input {...form.register("password")} type="password" className="input mt-3" />
        <button className="btn-primary mt-6 w-full">Login</button>
      </form>
    </div>
  )
}
