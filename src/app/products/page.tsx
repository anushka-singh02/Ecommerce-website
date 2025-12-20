import { Suspense } from "react"
import ProductsContent from "@/components/ProductsContent"
import { Loader2 } from "lucide-react" // Optional: for a nice loading icon

export default function ProductsPage() {
  return (
 
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}