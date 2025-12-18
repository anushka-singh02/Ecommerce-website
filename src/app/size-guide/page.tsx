import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Size Guide</h1>
        <p className="text-muted-foreground mb-8">Use the charts below to determine your size. If you're on the borderline between two sizes, order the smaller size for a tighter fit or the larger size for a looser fit.</p>

        <div className="space-y-12">
          {/* Tops Table */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tops & Tees</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Size</th>
                    <th className="px-6 py-3 font-medium">Chest (in)</th>
                    <th className="px-6 py-3 font-medium">Waist (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="bg-white"><td className="px-6 py-4 font-medium">S</td><td className="px-6 py-4">34-36</td><td className="px-6 py-4">28-30</td></tr>
                  <tr className="bg-white"><td className="px-6 py-4 font-medium">M</td><td className="px-6 py-4">38-40</td><td className="px-6 py-4">31-33</td></tr>
                  <tr className="bg-white"><td className="px-6 py-4 font-medium">L</td><td className="px-6 py-4">42-44</td><td className="px-6 py-4">34-36</td></tr>
                  <tr className="bg-white"><td className="px-6 py-4 font-medium">XL</td><td className="px-6 py-4">46-48</td><td className="px-6 py-4">38-40</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}