import { Resend } from "resend";
import { env } from "@/env.mjs";

const resend = new Resend(env.RESEND_API_KEY);

export async function notifyAdminOfNewCase(input: { id: string; clientName: string; lender: string; phone: string }) {
  if (env.RESEND_API_KEY.startsWith("re_local_") || env.RESEND_API_KEY === "replace-with-resend-api-key") {
    console.warn("Admin case email skipped because RESEND_API_KEY is not configured.");
    return;
  }
  const { error } = await resend.emails.send({
    from: "Rinrelife Alerts <alerts@nyayashield.in>",
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `New debt case ${input.id}`,
    text: `New inquiry from ${input.clientName} (${input.phone}) regarding ${input.lender}. Case ID: ${input.id}`,
  });
  if (error) throw new Error(`Admin notification failed: ${error.message}`);
}

export async function sendPasswordResetEmail(input: { email: string; resetUrl: string }) {
  const { error } = await resend.emails.send({
    from: "Rinrelife Support <alerts@nyayashield.in>",
    to: input.email,
    subject: "Reset your Rinrelife password",
    text: `Use this link to reset your Rinrelife password: ${input.resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
  });
  if (error) throw new Error(`Password reset email failed: ${error.message}`);
}
