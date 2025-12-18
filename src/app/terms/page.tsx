import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none text-muted-foreground">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-foreground font-semibold text-lg mt-6 mb-2">1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter.</p>

          <h3 className="text-foreground font-semibold text-lg mt-6 mb-2">2. How We Use Your Information</h3>
          <p>We use the information we collect to process your orders, communicate with you, and improve our services.</p>
          
          {/* Add more sections as needed */}
        </div>
      </main>
      <Footer />
    </div>
  )
}