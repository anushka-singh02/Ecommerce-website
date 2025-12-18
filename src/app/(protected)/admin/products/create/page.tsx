"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { adminService } from "@/lib/api/admin"
import toast from "react-hot-toast"
import { Plus, X, Upload } from "lucide-react"
import * as z from "zod"

// --- 1. ZOD SCHEMA (Matches your new Prisma Schema) ---
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    originalPrice: z.coerce.number().optional(),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    category: z.string().min(1, "Category is required"),
    gender: z.string().optional(),
    
    // Arrays
    tags: z.array(z.string()).default([]),
    sizes: z.array(z.string()).default([]),
    features: z.array(z.string()).default([]),
    
    // Complex Objects
    colors: z.array(z.object({ name: z.string(), hex: z.string() })).default([]),
    
    // Details
    materials: z.string().optional(),
    care: z.string().optional(),
})

type ProductFormValues = z.infer<typeof formSchema>

// Standard sizes
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export default function CreateProduct() {
    const router = useRouter()
    const queryClient = useQueryClient()
    
    // State for File Uploads
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    
    // Temp states for adding dynamic items
    const [tempTag, setTempTag] = useState("")
    const [tempFeature, setTempFeature] = useState("")
    const [tempColorName, setTempColorName] = useState("")
    const [tempColorHex, setTempColorHex] = useState("#000000")

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "", description: "", price: 0, originalPrice: 0, stock: 0,
            category: "", gender: "", materials: "", care: "",
            tags: [], sizes: [], features: [], colors: [],
        }
    })

    // --- 2. MUTATION (Handles Uploads + Creation) ---
    const createMutation = useMutation({
        mutationFn: async (data: ProductFormValues) => {
            let imageUrls: string[] = [];

            // Step A: Upload Images (if any)
            if (selectedFiles.length > 0) {
                try {
                    // Upload files in parallel
                    const uploadPromises = selectedFiles.map(file => {
                        const formData = new FormData()
                        formData.append("file", file)
                        return adminService.uploadImage(formData)
                    })

                    const results = await Promise.all(uploadPromises)
                    imageUrls = results.map(res => res.url)
                } catch (err) {
                    throw new Error("Image upload failed. Please try again.")
                }
            } else {
                throw new Error("Please select at least one image")
            }

            // Step B: Create Payload
            const payload = {
                ...data,
                images: imageUrls,
                colorNames: data.colors.map(c => c.name) // Sync the simple array field
            };

            // Step C: Call API
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

    // --- HANDLERS ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setSelectedFiles(prev => [...prev, ...newFiles])
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    // Dynamic Field Handlers
    const addTag = () => {
        if (!tempTag.trim()) return
        const current = form.getValues("tags") || []
        form.setValue("tags", [...current, tempTag])
        setTempTag("")
    }

    const addFeature = () => {
        if (!tempFeature.trim()) return
        const current = form.getValues("features") || []
        form.setValue("features", [...current, tempFeature])
        setTempFeature("")
    }

    const addColor = () => {
        if (!tempColorName.trim()) return
        const current = form.getValues("colors") || []
        form.setValue("colors", [...current, { name: tempColorName, hex: tempColorHex }])
        setTempColorName("")
        setTempColorHex("#000000")
    }

    const removeItem = (field: any, index: number) => {
        const current = form.getValues(field)
        form.setValue(field, current.filter((_: any, i: number) => i !== index))
    }

    const handleSizeChange = (size: string) => {
        const currentSizes = form.getValues("sizes") || [];
        if (currentSizes.includes(size)) {
            form.setValue("sizes", currentSizes.filter((s) => s !== size));
        } else {
            form.setValue("sizes", [...currentSizes, size]);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 my-10">
            <div className="mb-8 pb-4 border-b border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
                <p className="text-gray-500 mt-1">Add a new item with images, colors, and inventory details.</p>
            </div>

            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- LEFT COLUMN: Main Info --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Name & Desc */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                            <input {...form.register("name")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" placeholder="Product Title" />
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.name?.message}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea {...form.register("description")} rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" placeholder="Product description..." />
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.description?.message}</p>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                                <input type="number" step="0.01" {...form.register("price")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price</label>
                                <input type="number" step="0.01" {...form.register("originalPrice")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                                <input type="number" {...form.register("stock")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        {/* Category & Gender */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <input {...form.register("category")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" placeholder="e.g. T-Shirts" />
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.category?.message}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                                <select {...form.register("gender")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="">Select...</option>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Unisex">Unisex</option>
                                    <option value="Kids">Kids</option>
                                </select>
                            </div>
                        </div>

                        {/* Materials & Care */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Materials</label>
                                <input {...form.register("materials")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="e.g. 100% Cotton" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Care</label>
                                <input {...form.register("care")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="e.g. Machine Wash" />
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Key Features</label>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    value={tempFeature} 
                                    onChange={(e) => setTempFeature(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                                    placeholder="Add a feature..." 
                                />
                                <button type="button" onClick={addFeature} className="p-2 bg-black text-white rounded-lg hover:bg-gray-800"><Plus className="w-4 h-4"/></button>
                            </div>
                            <ul className="space-y-1">
                                {form.watch("features")?.map((feat, i) => (
                                    <li key={i} className="flex justify-between items-center bg-white px-3 py-1.5 rounded border text-sm">
                                        {feat}
                                        <button type="button" onClick={() => removeItem("features", i)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3"/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: Visuals --- */}
                    <div className="space-y-6">
                        
                        {/* Image Upload (Multiple) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                            <div className="flex items-center justify-center w-full mb-4">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload images</p>
                                    </div>
                                    <input type="file" className="hidden" multiple onChange={handleFileSelect} />
                                </label>
                            </div>
                            {/* Previews */}
                            <div className="grid grid-cols-3 gap-2">
                                {selectedFiles.map((file, i) => (
                                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {selectedFiles.length === 0 && <p className="text-red-500 text-xs mt-1">At least 1 image required</p>}
                        </div>

                        {/* Colors */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Colors</label>
                            <div className="flex gap-2 items-end mb-3">
                                <div className="flex-1">
                                    <span className="text-xs text-gray-500">Name</span>
                                    <input value={tempColorName} onChange={(e) => setTempColorName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" placeholder="Red" />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Hex</span>
                                    <div className="flex gap-2">
                                        <input type="color" value={tempColorHex} onChange={(e) => setTempColorHex(e.target.value)} className="w-9 h-9 p-0.5 border rounded cursor-pointer" />
                                        <button type="button" onClick={addColor} className="p-2 bg-black text-white rounded-lg hover:bg-gray-800"><Plus className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {form.watch("colors")?.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border text-sm shadow-sm">
                                        <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.hex }} />
                                        {c.name}
                                        <button type="button" onClick={() => removeItem("colors", i)}><X className="w-3 h-3 text-red-500"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                            <div className="flex gap-2 mb-2">
                                <input value={tempTag} onChange={(e) => setTempTag(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="New Arrival" />
                                <button type="button" onClick={addTag} className="p-2 bg-black text-white rounded-lg"><Plus className="w-4 h-4"/></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {form.watch("tags")?.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {tag}
                                        <button type="button" onClick={() => removeItem("tags", i)} className="ml-1 text-gray-500 hover:text-red-600"><X className="w-3 h-3"/></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Sizes</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SIZES.map((size) => (
                                    <div 
                                        key={size} 
                                        onClick={() => handleSizeChange(size)}
                                        className={`cursor-pointer px-3 py-1.5 rounded-md border text-sm font-medium transition-all select-none ${
                                            form.watch("sizes")?.includes(size) ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50 border-gray-200"
                                        }`}
                                    >
                                        {size}
                                    </div>
                                ))}
                            </div>
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
                        className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:shadow-lg flex items-center gap-2"
                    >
                        {createMutation.isPending ? "Uploading..." : "Create Product"}
                    </button>
                </div>
            </form>
        </div>
    )
}