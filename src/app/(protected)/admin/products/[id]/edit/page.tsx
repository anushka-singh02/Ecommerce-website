"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { adminService } from "@/lib/api/admin"
import toast from "react-hot-toast"
import { Plus, X, Upload, Trash2 } from "lucide-react"
import * as z from "zod"

// --- 1. SAME SCHEMA AS CREATE PAGE ---
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0),
    originalPrice: z.coerce.number().optional(),
    stock: z.coerce.number().min(0),
    category: z.string().min(1, "Category is required"),
    gender: z.string().optional(),
    
    // Arrays
    images: z.array(z.string()).default([]), // Stores EXISTING URLs
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

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export default function EditProduct() {
    const params = useParams()
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    
    const router = useRouter()
    const queryClient = useQueryClient()
    
    // State for NEW File Uploads
    const [newFiles, setNewFiles] = useState<File[]>([])
    
    // Temp states for inputs
    const [tempTag, setTempTag] = useState("")
    const [tempFeature, setTempFeature] = useState("")
    const [tempColorName, setTempColorName] = useState("")
    const [tempColorHex, setTempColorHex] = useState("#000000")

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "", description: "", price: 0, originalPrice: 0, stock: 0,
            category: "", gender: "", materials: "", care: "",
            images: [], tags: [], sizes: [], features: [], colors: [],
        }
    })

    // --- 2. FETCH PRODUCT DATA ---
    const { data: productData, isLoading } = useQuery({
        queryKey: ["product", id],
        queryFn: () => adminService.getProductById(id!),
        enabled: !!id,
    })

    // --- 3. POPULATE FORM ---
    useEffect(() => {
        if (productData) {
            const p = (productData as any).data || productData;

            // Handle Colors: might come as JSON string or object from DB
            let parsedColors = [];
            if (Array.isArray(p.colors)) parsedColors = p.colors;
            else if (typeof p.colors === "string") {
                try { parsedColors = JSON.parse(p.colors); } catch(e) { parsedColors = [] }
            }

            form.reset({
                name: p.name,
                description: p.description,
                price: Number(p.price),
                originalPrice: p.originalPrice ? Number(p.originalPrice) : 0,
                stock: Number(p.stock),
                category: p.category,
                gender: p.gender || "",
                materials: p.materials || "",
                care: p.care || "",
                
                // Arrays
                images: p.images || [],
                tags: p.tags || [],
                sizes: p.sizes || [],
                features: p.features || [],
                colors: parsedColors,
            })
        }
    }, [productData, form])

    // --- 4. UPDATE MUTATION ---
    const updateMutation = useMutation({
        mutationFn: async (data: ProductFormValues) => {
            let finalImageUrls = [...data.images]; // Start with existing URLs

            // A. Upload NEW files if any
            if (newFiles.length > 0) {
                try {
                    const uploadPromises = newFiles.map(file => {
                        const formData = new FormData()
                        formData.append("file", file)
                        return adminService.uploadImage(formData)
                    })
                    const results = await Promise.all(uploadPromises)
                    const newUrls = results.map(res => res.url)
                    
                    // Merge new URLs with existing ones
                    finalImageUrls = [...finalImageUrls, ...newUrls]
                } catch (err) {
                    throw new Error("Image upload failed")
                }
            }

            // Validation: Ensure at least one image exists
            if (finalImageUrls.length === 0) {
                throw new Error("Product must have at least one image")
            }

            // B. Construct Payload
            const payload = {
                ...data,
                images: finalImageUrls,
                colorNames: data.colors.map(c => c.name) // Sync string array
            };

            return adminService.updateProduct(id!, payload);
        },
        onSuccess: () => {
            toast.success("Product updated successfully")
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["product", id] })
            router.push("/admin/products")
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Update failed")
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

    // --- HANDLERS ---
    
    // 1. Existing Images (Remove URL)
    const removeExistingImage = (index: number) => {
        const current = form.getValues("images")||[]
        form.setValue("images", current.filter((_, i) => i !== index))
    }

    // 2. New Files (Add/Remove)
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }
    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
    }

    // 3. Dynamic Arrays
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
        const current = form.getValues(field) || []
        form.setValue(field, current.filter((_: any, i: number) => i !== index))
    }

    const handleSizeChange = (size: string) => {
        const current = form.getValues("sizes") || [];
        if (current.includes(size)) {
            form.setValue("sizes", current.filter((s) => s !== size));
        } else {
            form.setValue("sizes", [...current, size]);
        }
    };

    if (isLoading) return <div className="p-12 text-center">Loading product data...</div>

    return (
        <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 my-10">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-gray-500 mt-1">Update product details and inventory.</p>
                </div>
                <button 
                    type="button" 
                    onClick={() => { if(confirm("Are you sure?")) deleteMutation.mutate() }}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded transition font-medium border border-red-200"
                >
                    <Trash2 className="w-4 h-4" />
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
            </div>

            <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                            <input {...form.register("name")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" />
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.name?.message}</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea {...form.register("description")} rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                                <input type="number" step="0.01" {...form.register("price")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price</label>
                                <input type="number" step="0.01" {...form.register("originalPrice")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                                <input type="number" {...form.register("stock")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Materials</label>
                                <input {...form.register("materials")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Care</label>
                                <input {...form.register("care")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Key Features</label>
                            <div className="flex gap-2 mb-3">
                                <input value={tempFeature} onChange={(e) => setTempFeature(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Add a feature..." />
                                <button type="button" onClick={addFeature} className="p-2 bg-black text-white rounded-lg"><Plus className="w-4 h-4"/></button>
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

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        
                        {/* Images Management */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                            
                            {/* 1. Existing Images */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {form.watch("images")?.map((url, i) => (
                                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100">
                                        <img src={url} alt="Existing" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* 2. New Uploads */}
                            <div className="flex items-center justify-center w-full mb-4">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        <p className="text-xs text-gray-500 mt-1">Add new images</p>
                                    </div>
                                    <input type="file" className="hidden" multiple onChange={handleFileSelect} />
                                </label>
                            </div>
                            
                            {/* 3. New File Previews */}
                            {newFiles.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {newFiles.map((file, i) => (
                                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
                                            <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover opacity-80" />
                                            <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1 rounded">New</div>
                                            <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                        <button type="button" onClick={addColor} className="p-2 bg-black text-white rounded-lg"><Plus className="w-4 h-4"/></button>
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

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={updateMutation.isPending} className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    )
}