"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema } from "@/lib/validators/product"
import { adminService } from "@/lib/api/admin"
import toast from "react-hot-toast"

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function EditProduct() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => adminService.getProductById(id!),
    enabled: !!id,
  })

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, originalPrice: 0, stock: 0, category: "", gender: "",
      sizes: [] as string[], colors: "", tags: "", image: "",
    }
  })

  // --- FIX 1: LOAD IMAGE CORRECTLY ---
  useEffect(() => {
    if (productData) {
      const product = (productData as any).data || productData; 
      
      // LOGIC: If 'image' string is missing, try taking the first item from 'images' array
      const existingImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : "");

      form.reset({
        name: product.name,
        description: product.description || "",
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : 0,
        stock: Number(product.stock) || 0,
        category: product.category || "",
        gender: product.gender || "",
        sizes: product.sizes || [],
        
        image: existingImage, // <--- Set the corrected image URL

        colors: Array.isArray(product.colors) ? product.colors.join(", ") : (product.colors || ""),
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
      })
    }
  }, [productData, form])

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      let imageUrl = data.image; 

      if (selectedFile) {
        const formData = new FormData()
        formData.append("file", selectedFile)
        try {
           const uploadRes = await adminService.uploadImage(formData)
           imageUrl = uploadRes.url
        } catch (err) {
           throw new Error("Image upload failed")
        }
      }

      const payload = {
        ...data,
        image: imageUrl, 
        images: [imageUrl], // Update the array too
        colors: data.colors ? data.colors.split(",").map((c: string) => c.trim()) : [],
        tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()) : [],
      };

      return adminService.updateProduct(id!, payload);
    },
    onSuccess: () => {
      toast.success("Product updated successfully")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      router.push("/admin/products")
    },
    onError: (error) => {
      toast.error("Failed to update product")
      console.error(error)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminService.deleteProduct(id!),
    onSuccess: () => {
      toast.success("Product deleted")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      router.replace("/admin/products")
    },
    onError: () => toast.error("Failed to delete product")
  })

  const handleSizeChange = (size: string) => {
    const currentSizes = form.getValues("sizes") || [];
    if (currentSizes.includes(size)) {
      form.setValue("sizes", currentSizes.filter((s) => s !== size));
    } else {
      form.setValue("sizes", [...currentSizes, size]);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-gray-500">Loading...</div>

  // Helper to determine what image to show
  const currentImage = selectedFile ? URL.createObjectURL(selectedFile) : form.watch("image");

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 my-10">
      
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>
        <button 
            type="button" 
            onClick={() => {
                if(confirm("Delete this product?")) deleteMutation.mutate()
            }}
            disabled={deleteMutation.isPending}
            className="text-red-600 hover:bg-red-50 px-4 py-2 rounded transition font-medium"
        >
            {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
        </button>
      </div>

      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
        
        {/* Name & Desc */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
            <input {...form.register("name")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.name?.message as string}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea {...form.register("description")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" rows={4}/>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price ($)</label>
                <input type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price ($)</label>
                <input type="number" step="0.01" {...form.register("originalPrice", { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                <input type="number" {...form.register("stock", { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input {...form.register("category")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select {...form.register("gender")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
                    <option value="">Select...</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                </select>
            </div>
        </div>

        {/* Tags/Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Colors (Comma separated)</label>
                <input {...form.register("colors")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="e.g. Red, Blue" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (Comma separated)</label>
                <input {...form.register("tags")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="e.g. New, Summer" />
            </div>
        </div>

        {/* Sizes */}
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Sizes</label>
            <div className="flex flex-wrap gap-3">
                {AVAILABLE_SIZES.map((size) => (
                    <label key={size} className="flex items-center space-x-2 cursor-pointer bg-gray-50 border border-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 select-none">
                        <input type="checkbox" checked={form.watch("sizes")?.includes(size)} onChange={() => handleSizeChange(size)} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm font-medium text-gray-700">{size}</span>
                    </label>
                ))}
            </div>
        </div>

        {/* --- FIX 2: ROBUST IMAGE PREVIEW --- */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
           <label className="block text-sm font-bold text-gray-700 mb-3">Product Image</label>
           
           <div className="flex items-start gap-6">
             <div className="relative group shrink-0">
                {currentImage ? (
                    <img 
                        src={currentImage} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm bg-white"
                        onError={(e) => {
                            // If even the real URL fails, fallback to this
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : (
                   /* Fallback DIV if no image exists at all */
                   <div className="w-32 h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 border border-gray-300">
                        <span className="text-xs font-semibold">No Image</span>
                   </div>
                )}
                
                {/* Fallback hidden div for onError */}
                <div className="hidden w-32 h-32 bg-gray-200 rounded-lg flex-col items-center justify-center text-gray-500 border border-gray-300">
                     <span className="text-xs font-semibold">Error Loading</span>
                </div>

                {selectedFile && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow">New</div>
                )}
             </div>
             
             <div className="flex-1">
                <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0])
                        // Dummy value to satisfy validation if needed
                        form.setValue("image", "new-file-selected", { shouldValidate: true })
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition"
                />
                <p className="text-xs text-gray-500 mt-2">Upload a new image to replace the current one.</p>
             </div>
           </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={updateMutation.isPending} className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </form>
    </div>
  )
}