"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema } from "@/lib/validators/product"
import { adminService } from "@/lib/api/admin"
import toast from "react-hot-toast"

// Standard sizes to choose from
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function CreateProduct() {
    const router = useRouter()
    const queryClient = useQueryClient()
    
    // 1. State to hold the raw file before uploading
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            originalPrice: 0,
            stock: 0,
            category: "",
            gender: "",
            sizes: [] as string[],
            colors: "", 
            tags: "",   
            image: "", // Will be filled with a dummy value to satisfy validator
        }
    })

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            let imageUrl = "";

            // 2. Perform the Upload HERE (inside the submit action)
            if (selectedFile) {
                const formData = new FormData()
                formData.append("file", selectedFile)
                
                try {
                    const uploadRes = await adminService.uploadImage(formData)
                    imageUrl = uploadRes.url
                } catch (err) {
                    throw new Error("Image upload failed. Please try again.")
                }
            } else {
                throw new Error("Please select an image")
            }

            // 3. Create Product with the returned URL
            const payload = {
                ...data,
                image: imageUrl, // Use the real server URL
                // Convert comma-separated strings to arrays
                colors: data.colors ? data.colors.split(",").map((c: string) => c.trim()) : [],
                tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()) : [],
                // Match DB Schema (array of images)
                images: [imageUrl]
            };
            return adminService.createProduct(payload);
        },
        onSuccess: () => {
            toast.success("Product created successfully")
            queryClient.invalidateQueries({ queryKey: ["products"] })
            router.push("/admin/products")
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to create product")
        }
    })

    // Helper for checkboxes
    const handleSizeChange = (size: string) => {
        const currentSizes = form.getValues("sizes") || [];
        if (currentSizes.includes(size)) {
            form.setValue("sizes", currentSizes.filter((s) => s !== size));
        } else {
            form.setValue("sizes", [...currentSizes, size]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 my-10">

            <div className="mb-8 pb-4 border-b border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
                <p className="text-gray-500 mt-1">Fill in the details to add a new item to your store.</p>
            </div>

            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">

                {/* Row 1: Basic Info */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                        <input
                            {...form.register("name")}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="e.g. Premium Cotton T-Shirt"
                        />
                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.name?.message as string}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            {...form.register("description")}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            rows={4}
                            placeholder="Describe the product material, fit, and features..."
                        />
                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.description?.message as string}</p>
                    </div>
                </div>

                {/* Row 2: Pricing & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price ($)</label>
                        <input
                            type="number" step="0.01"
                            {...form.register("price", { valueAsNumber: true })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.price?.message as string}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price ($) <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input
                            type="number" step="0.01"
                            {...form.register("originalPrice", { valueAsNumber: true })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 120.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                        <input
                            type="number"
                            {...form.register("stock", { valueAsNumber: true })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.stock?.message as string}</p>
                    </div>
                </div>

                {/* Row 3: Categories & Attributes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <input
                            {...form.register("category")}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Hoodies"
                        />
                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.category?.message as string}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <select
                            {...form.register("gender")}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Select (or leave blank)...</option>
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Unisex">Unisex</option>
                            <option value="Kids">Kids</option>
                        </select>
                    </div>
                </div>

                {/* Row 4: Colors & Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Colors (Comma separated)</label>
                        <input
                            {...form.register("colors")}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Red, Blue, Matte Black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (Comma separated)</label>
                        <input
                            {...form.register("tags")}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. New Arrival, Bestseller, Summer"
                        />
                    </div>
                </div>

                {/* Row 5: Sizes */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Available Sizes <span className="text-gray-400 font-normal">(Optional - Skip for accessories)</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {AVAILABLE_SIZES.map((size) => (
                            <label key={size} className="flex items-center space-x-2 cursor-pointer bg-gray-50 border border-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 transition select-none">
                                <input
                                    type="checkbox"
                                    value={size}
                                    checked={form.watch("sizes")?.includes(size)}
                                    onChange={() => handleSizeChange(size)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{size}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Row 6: Image Upload */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                    <div className="flex items-start gap-6">
                        
                        {/* Preview Logic: Use local file object URL */}
                        {selectedFile ? (
                            <div className="relative group">
                                <img
                                    src={URL.createObjectURL(selectedFile)} 
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center text-white text-xs">
                                    Change
                                </div>
                            </div>
                        ) : (
                            <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                No Image
                            </div>
                        )}

                        <div className="flex-1">
                            <input
                                type="file"
                                onChange={(e) => {
                                    // 4. Store file locally, do NOT upload yet
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        setSelectedFile(file);
                                        // Set a dummy string to satisfy "required" validation
                                        form.setValue("image", file.name, { shouldValidate: true });
                                    }
                                }}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-2">Recommended: 800x800px or larger. JPG, PNG supported.</p>
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.image?.message as string}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:shadow-lg"
                    >
                        {createMutation.isPending ? "Creating..." : "Create Product"}
                    </button>
                </div>
            </form>
        </div>
    )
}