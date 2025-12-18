import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-12">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First name</label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last name</label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="How can we help?" className="min-h-[150px]" />
            </div>
            <Button className="w-full">Send Message</Button>
          </div>

          {/* Info */}
          <div className="space-y-8 bg-muted/30 p-8 rounded-xl h-fit">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" /> Email
              </h3>
              <p className="text-sm text-muted-foreground">support@raawr.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" /> Phone
              </h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground mt-1">Mon-Fri 9am-6pm EST</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Office
              </h3>
              <p className="text-sm text-muted-foreground">
                123 Athletic Way<br />
                New York, NY 10001
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}