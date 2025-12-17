// src/lib/payment.ts

const BACKEND_URL = "http://localhost:8000/api";

/**
 * STEP 1: Create Razorpay order from NestJS backend
 */
export async function createRazorpayOrder(amountInPaise: number) {
  console.log("📤 Sending order request to backend...");

  const res = await fetch(`${BACKEND_URL}/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // backend expects amount in rupees
      amount: amountInPaise / 100,
    }),
  });

  if (!res.ok) {
    throw new Error("❌ Failed to create Razorpay order");
  }

  const data = await res.json();
  console.log("📥 Order received from backend:", data);

  return data;
}

/**
 * STEP 2: Verify Razorpay payment
 */
export async function verifyRazorpayPayment(payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) {
  console.log("📤 Sending verification request to backend...");

  const res = await fetch(`${BACKEND_URL}/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("❌ Payment verification failed");
  }

  return res.json();
}
