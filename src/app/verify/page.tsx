import { Suspense } from "react"
import VerifyContent from "@/components/VerifyContent"
import { Loader2 } from "lucide-react"

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}