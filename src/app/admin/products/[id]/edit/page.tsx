"use client"

import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema } from "@/lib/validators/product"
import { api } from "@/lib/axios"
import toast from "react-hot-toast"

export default function EditProduct() {
  const { id } = useParams()
  const router = useRouter()

  const form = useForm({ resolver: zodResolver(productSchema) })

  async function onSubmit(data: any) {
    await api.put(`/products/${id}`, data)
    toast.success("Product updated")
  }

  async function uploadImage(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    const res = await api.post("/products/upload", formData)
    return res.data.url
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <h1 className="text-xl font-bold mb-4">Edit Product</h1>

      <input {...form.register("name")} className="input" />
      <input type="number" {...form.register("price")} className="input mt-3" />

      <input
        type="file"
        onChange={async (e) => {
          const url = await uploadImage(e.target.files![0])
        //   form.setValue("image", url)   error was coming in this line , thus commented , ig null value ja rhi thi abhi isiliye dikkat aa rha tha
        }}
        className="mt-3"
      />

      <button className="btn-primary mt-6">Save</button>
    </form>
  )
}
