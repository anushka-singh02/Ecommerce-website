"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query" // Added useMutation for cleaner actions
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema } from "@/lib/validators/product"
import { adminService } from "@/lib/api/admin"
import toast from "react-hot-toast"
import { authService } from "@/lib/api/auth"

// --- DUMMY DATA FOR TESTING (Remove when backend is ready) ---
const DUMMY_PRODUCT = {
  id: "123",
  name: "Gaming Mouse",
  price: 59.99,
  description: "High precision gaming mouse",
  image: "https://via.placeholder.com/150"
}

export default function EditProduct() {
  const params = useParams()
  // safely handle id whether it's string or array
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const router = useRouter()
  const queryClient = useQueryClient()

  // 1. Fetch Existing Product Data
  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", id],
    // If you don't have the backend endpoint yet, swap this line with: queryFn: async () => DUMMY_PRODUCT
    queryFn: () => adminService.getProductById(id!).then(res => res), 
    enabled: !!id, // Only fetch if ID exists
  })

  // 2. Setup Form
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      image: "", // Ensure this exists in your defaults
      // description: "" 
    }
  })

  // 3. Pre-fill Form when data arrives
  useEffect(() => {
    if (productData) {
      // Assuming productData might be wrapped in .data or is the direct object
      // Adjust 'productData' to 'productData.data' if your API wraps it
      const product = (productData as any).data || productData; 
      
      form.reset({
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
  }, [productData, form])

  // 4. Update Handler
  const updateMutation = useMutation({
    mutationFn: (data: any) => adminService.updateProduct(id!, data),
    onSuccess: () => {
      toast.success("Product updated successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] }) // Refresh the list page
      router.push("/admin/products") // Go back to list
    },
    onError: (error) => {
      toast.error("Failed to update product")
      console.error(error)
    }
  })

  // 5. Delete Handler
  const deleteMutation = useMutation({
    mutationFn: () => adminService.deleteProduct(id!),
    onSuccess: () => {
      toast.success("Product deleted")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      router.replace("/admin/products")
    }
  })

  async function uploadImage(file: File) {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await adminService.uploadImage(formData)
      
      // FIX: Ensure 'image' is in your Zod schema and registered!
      form.setValue("image", res.url, { shouldValidate: true }) 
      toast.success("Image uploaded")
    } catch (e) {
      toast.error("Image upload failed")
    }
  }

  if (isLoading) return <div className="p-8">Loading product...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <button 
            type="button" 
            onClick={() => {
                if(confirm("Are you sure you want to delete this product?")) {
                    deleteMutation.mutate()
                }
            }}
            className="text-red-600 text-sm hover:underline"
        >
            Delete Product
        </button>
      </div>

      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}>
        
        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input 
            {...form.register("name")} 
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {form.formState.errors.name && (
             <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message as string}</p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input 
            type="number" 
            step="0.01"
            {...form.register("price", { valueAsNumber: true })} 
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
           {form.formState.errors.price && (
             <p className="text-red-500 text-xs mt-1">{form.formState.errors.price.message as string}</p>
          )}
        </div>

        {/* Image Upload */}
        <div className="mb-6">
           <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
           <input
            type="file"
            onChange={async (e) => {
              if (e.target.files?.[0]) {
                await uploadImage(e.target.files[0])
              }
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="flex gap-3">
            <button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button 
                type="button"
                onClick={() => router.back()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded font-medium"
            >
                Cancel
            </button>
        </div>
      </form>
    </div>
  )
}