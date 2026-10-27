import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "@/env.mjs";

export const CURRENT_PAYMENT_AMOUNT = 1;

const razorpay = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });

function encodeTokenPart(value: string) {
  return Buffer.from(value).toString("base64url");
}

export function createPaymentAccessToken(caseId: string) {
  const payload = `${caseId}.${Date.now() + 30 * 60 * 1000}`;
  const signature = crypto.createHmac("sha256", env.NEXTAUTH_SECRET).update(payload).digest("base64url");
  return `${encodeTokenPart(payload)}.${signature}`;
}

export function verifyPaymentAccessToken(token: string | null, caseId: string) {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;
  const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const [tokenCaseId, expiresAt] = payload.split(".");
  if (tokenCaseId !== caseId || !expiresAt || Number(expiresAt) < Date.now()) return false;
  const expectedSignature = crypto.createHmac("sha256", env.NEXTAUTH_SECRET).update(payload).digest("base64url");
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  return provided.length === expected.length && crypto.timingSafeEqual(expected, provided);
}

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
