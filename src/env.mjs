import { z } from "zod";

const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
const required = (name, fallback) => process.env[name] ?? (isProductionBuild ? fallback : undefined);

const schema = z.object({
  MONGODB_DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_GSC_VERIFICATION: z.string().min(1).optional(),
  NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE: z.string().regex(/^\d{10,15}$/),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  RESEND_FROM_NAME: z.string().min(1).max(120),
  EMAIL_LOGO_URL: z.string().url().optional(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

export const env = schema.parse({
  MONGODB_DATABASE_URL: required("MONGODB_DATABASE_URL", "mongodb://build.invalid/rinrelief"),
  NEXTAUTH_SECRET: required("NEXTAUTH_SECRET", "build-only-secret-that-is-never-used-at-runtime"),
  NEXTAUTH_URL: required("NEXTAUTH_URL", "http://localhost:3000"),
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GSC_VERIFICATION: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE: required("NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE", "0000000000"),
  S3_ENDPOINT: required("S3_ENDPOINT", "https://build.invalid"),
  S3_REGION: required("S3_REGION", "auto"),
  S3_ACCESS_KEY_ID: required("S3_ACCESS_KEY_ID", "build-only-access-key"),
  S3_SECRET_ACCESS_KEY: required("S3_SECRET_ACCESS_KEY", "build-only-secret-key"),
  S3_BUCKET_NAME: required("S3_BUCKET_NAME", "build-only-bucket"),
  RESEND_API_KEY: required("RESEND_API_KEY", "re_build_only"),
  RESEND_FROM_EMAIL: required("RESEND_FROM_EMAIL", "build@example.invalid"),
  RESEND_FROM_NAME: required("RESEND_FROM_NAME", "RinRelief"),
  EMAIL_LOGO_URL: process.env.EMAIL_LOGO_URL,
  ADMIN_NOTIFICATION_EMAIL: required("ADMIN_NOTIFICATION_EMAIL", "build@example.invalid"),
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
});
