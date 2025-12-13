import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  category: z.string(),
})
