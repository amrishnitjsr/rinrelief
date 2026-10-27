import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "@/env.mjs";

export const CURRENT_PAYMENT_AMOUNT = 1;

const razorpay = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });

export async function createRazorpayOrder(amountInRupees: number, receipt: string) {
  if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) throw new Error("Invalid payment amount");
  return razorpay.orders.create({ amount: Math.round(amountInRupees * 100), currency: "INR", receipt, notes: { product: "legal-consultation" } });
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, provided);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, provided);
}
