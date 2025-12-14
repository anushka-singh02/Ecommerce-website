import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  originalPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, "Stock must be a positive integer"),
  category: z.string().min(1, "Category is required"),
  
  // CHANGED: Now Optional
  gender: z.string().optional(), 
  
  // CHANGED: Now Optional (defaults to empty array if nothing selected)
  sizes: z.array(z.string()).optional(), 
  
  colors: z.string().optional(),
  tags: z.string().optional(),
  image: z.string().min(1, "Main image is required"), 
})