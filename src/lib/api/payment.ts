// src/lib/api/payment.ts
import { fetcher } from "@/lib/fetcher";

export const paymentService = {
  /**
   * Create Order (Supports both PayU and COD)
   * Payload includes: address, paymentMethod, and optionally directItems (for Buy Now)
   */
  createOrder: async (data: { 
    directItems?: any[]; 
    address?: any; 
    paymentMethod?: "ONLINE" | "COD" 
  }) => {
    return fetcher<any>("/payment/create-order", {
      method: "POST",
      body: JSON.stringify(data), 
    });
  },

  // Note: We don't need a verify function here anymore because 
  // PayU handles verification via a server-side redirect (Callback).
};