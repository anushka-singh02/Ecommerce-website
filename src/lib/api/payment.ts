// ✅ Import your specific fetcher
import { fetcher } from "@/lib/fetcher";

/**
 * STEP 1: Create Order
 * Supports "Buy Now" (directItems) or "Cart Checkout" (default).
 */
export async function createRazorpayOrder(data: { 
  directItems?: any[]; 
  address?: any; 
  paymentMethod?: "ONLINE" | "COD" 
} = {}) {
  
  // Your fetcher handles Base URL + Auth Headers
  // We MUST stringify the body because your fetcher passes options directly to native fetch
  return fetcher("/payment/create-order", {
    method: "POST",
    body: JSON.stringify(data), 
  });
}

/**
 * STEP 2: Verify Razorpay payment
 */
export async function verifyRazorpayPayment(payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) {
  
  return fetcher("/payment/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}