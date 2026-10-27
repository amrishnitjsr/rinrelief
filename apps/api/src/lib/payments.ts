import Razorpay from "razorpay";
import { env } from "@/env.mjs";
export {
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from "./razorpay-signatures";

const razorpay = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });

export async function createRazorpayOrder(amountInRupees: number, receipt: string) {
  if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
    throw new Error("Invalid payment amount");
  }

  return razorpay.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
    notes: { product: "legal-consultation" },
  });
}
