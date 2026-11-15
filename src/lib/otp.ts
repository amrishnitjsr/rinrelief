import crypto from "node:crypto";

export function createOtp() {
  const code = crypto.randomInt(100000, 1000000).toString();
  return {
    code,
    hash: crypto.createHash("sha256").update(code).digest("hex"),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
}

export function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
