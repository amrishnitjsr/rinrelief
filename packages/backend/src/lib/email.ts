import { Resend } from "resend";
import { env } from "@/env.mjs";

const resend = new Resend(env.RESEND_API_KEY);

export async function notifyAdminOfNewCase(input: { id: string; clientName: string; lender: string; phone: string }) {
  const { error } = await resend.emails.send({
    from: "Rinrelife Alerts <alerts@nyayashield.in>",
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `New debt case ${input.id}`,
    text: `New inquiry from ${input.clientName} (${input.phone}) regarding ${input.lender}. Case ID: ${input.id}`,
  });
  if (error) throw new Error(`Admin notification failed: ${error.message}`);
}
