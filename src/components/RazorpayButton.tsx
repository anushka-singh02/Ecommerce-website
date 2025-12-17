import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/payment"

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton() {

  const handlePayment = async () => {
    // Step 1: Create order from backend
    const order = await createRazorpayOrder(499);

    // Step 2: Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // CLIENT key (public)
      amount: order.amount,
      currency: order.currency,
      name: 'Client Website',
      description: 'Order Payment',
      order_id: order.id,

      handler: async function (response: any) {
        // Step 3: Verify payment on backend
        await verifyRazorpayPayment(response);
        alert('Payment successful!');
      },

      theme: {
        color: '#3399cc',
      },
    };

    // Step 4: Open Razorpay modal
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return <button onClick={handlePayment}>Pay ₹499</button>;
}
