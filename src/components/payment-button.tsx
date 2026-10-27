"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load payment checkout"));
    document.body.appendChild(script);
  });
}

export function PaymentButton({ caseId, amount }: { caseId: string; amount: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startPayment = async () => {
    setLoading(true);
    setError("");
    try {
      const orderResponse = await fetch(`/api/cases/${caseId}/payment`, { method: "POST" });
      const responseText = await orderResponse.text();
      const order = responseText ? (JSON.parse(responseText) as { orderId?: string; keyId?: string; amount?: number; currency?: string; error?: string }) : {};
      if (!orderResponse.ok || !order.orderId || !order.keyId) throw new Error(order.error ?? "Unable to start payment");
      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Payment checkout is unavailable");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: Math.round((order.amount ?? amount) * 100),
        currency: order.currency ?? "INR",
        name: "Rinrelife",
        description: "Initial legal consultation",
        order_id: order.orderId,
        theme: { color: "#12233f" },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                caseId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const result = (await verifyResponse.json()) as { error?: string };
            if (!verifyResponse.ok) throw new Error(result.error ?? "Payment verification failed");
            window.location.reload();
          } catch (verificationError) {
            setError(verificationError instanceof Error ? verificationError.message : "Payment verification failed");
            setLoading(false);
          }
        },
      });
      checkout.open();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Unable to complete payment");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button type="button" onClick={startPayment} disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        {loading ? "Opening checkout..." : `Pay consultation · ₹${amount.toLocaleString("en-IN")}`}
      </Button>
      {error && <p className="max-w-xs text-right text-xs font-semibold text-red-600" role="alert">{error}</p>}
    </div>
  );
}