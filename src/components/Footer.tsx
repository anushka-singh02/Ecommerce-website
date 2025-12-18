"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Youtube, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Ensure you have this component

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Socials */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block relative h-10 w-32 mb-4">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/raawrlogo-1764828536372.webp?width=8000&height=8000&resize=contain"
                alt="Raawr"
                fill
                className="object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Premium athletic wear designed for performance and style. Elevate your workout experience with Raawr.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <Button key={i} variant="ghost" size="icon" className="h-9 w-9 hover:text-primary hover:bg-primary/10">
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products?gender=Men" className="text-muted-foreground hover:text-primary transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/products?gender=Women" className="text-muted-foreground hover:text-primary transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="text-muted-foreground hover:text-primary transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?sort=price-low" className="text-muted-foreground hover:text-primary transition-colors">
                  Sale Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping Info
                </Link>
              </li>
              {/* <li>
                <Link href="/returns" className="text-muted-foreground hover:text-primary transition-colors">
                  Returns & Exchanges
                </Link>
              </li> */}
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-muted-foreground hover:text-primary transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-background"
              />
              <Button type="submit" size="icon">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Raawr. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              {/* <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}