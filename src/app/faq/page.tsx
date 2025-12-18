import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. International orders may take 7-14 days."
    },
    {
      q: "What is your return policy?",
      a: "We offer a 30-day return policy for all unworn items in original packaging. Return shipping is free for all domestic orders."
    },
    {
      q: "Do you ship internationally?",
      a: "Yes, we ship to over 50 countries worldwide. Shipping costs are calculated at checkout based on your location."
    },
    {
      q: "How do I find my size?",
      a: "Check our Size Guide linked in the footer. If you are between sizes, we generally recommend sizing up for a more comfortable fit."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  )
}