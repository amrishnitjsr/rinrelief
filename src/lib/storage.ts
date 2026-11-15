import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env.mjs";

export const storage = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  forcePathStyle: true,
  credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
});

export async function createUploadUrl(key: string, contentType: string) {
  return getSignedUrl(
    storage,
    new PutObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn: 900 },
  );
}

export async function createDownloadUrl(key: string) {
  return getSignedUrl(storage, new GetObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: key }), { expiresIn: 900 });
}
