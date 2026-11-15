import { readFileSync } from "node:fs";
import path from "node:path";
import { Resend } from "resend";
import { env } from "@/env.mjs";

const resend = new Resend(env.RESEND_API_KEY);
const sender = `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`;
const logoContent = readFileSync(path.join(process.cwd(), "public", "logos", "gmail-svg light.png"));
const logoContentId = "rinrelief-logo";
const inlineLogo = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%2265%2022%20275%20220%22%20width%3D%22190%22%20height%3D%2288%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M75%2030H105V52C122%2033%20145%2026%20170%2028C215%2031%20245%2065%20245%20108C245%20145%20220%20175%20185%20186C212%20215%20255%20226%20315%20196C265%20238%20205%20244%20162%20210C140%20192%20124%20168%20105%20152V225H75V30ZM158%2062C130%2062%20108%2083%20108%20110C108%20137%20130%20158%20158%20158C186%20158%20208%20137%20208%20110C208%2083%20186%2062%20158%2062Z%22%20fill%3D%22%232B251B%22%2F%3E%3Cpath%20d%3D%22M118%2082C134%2055%20172%2048%20198%2068C224%2088%20228%20130%20202%20158C192%20169%20178%20176%20164%20179C192%20204%20248%20218%20315%20196C258%20226%20196%20222%20154%20185C145%20177%20138%20168%20132%20160C141%20163%20150%20165%20160%20165C192%20165%20216%20140%20216%20109C216%2078%20191%2055%20160%2055C142%2055%20127%2065%20118%2082Z%22%20fill%3D%22%23B08D26%22%2F%3E%3Ctext%20x%3D%22157%22%20y%3D%22123%22%20text-anchor%3D%22middle%22%20font-family%3D%22%27Noto%20Sans%20Devanagari%27%2C%20sans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2238%22%20fill%3D%22%232B251B%22%3E%E0%A4%8B%E0%A4%A3%3C%2Ftext%3E%3Ctext%20x%3D%22232%22%20y%3D%22176%22%20font-family%3D%22system-ui%2C%20-apple-system%2C%20sans-serif%22%20font-weight%3D%22700%22%20font-size%3D%2240%22%20fill%3D%22%23B08D26%22%3ERelief%3C%2Ftext%3E%3C%2Fsvg%3E";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function verificationEmailHtml(input: { code: string; purpose: "admin" | "password" }) {
  const code = escapeHtml(input.code);
  const description = input.purpose === "admin"
    ? "Use the one-time password (OTP) below to verify your identity and continue with your confidential session on RinRelief."
    : "Use the one-time password (OTP) below to confirm your password change on RinRelief.";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RinRelief OTP Verification</title>
  </head>
  <body style="margin:0;padding:0;background:#f9f6ee;font-family:Arial,Helvetica,sans-serif;color:#29241f;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F9F6EE;padding:40px 16px;">
      <tr><td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#FFFFFF;border:1px solid #E6E0D2;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background-color:#F9F6EE;border-bottom:1px solid #E6E0D2;padding:24px 32px;text-align:left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle"><img src="cid:${logoContentId}" alt="RinRelief - Confidential Legal Consultancy" width="250" height="155" style="display:block;width:250px;height:155px;border:0;" /></td>
                  <td valign="middle" align="right"><span style="display:inline-block;font-size:10px;font-weight:600;color:#6E6659;letter-spacing:1.4px;text-transform:uppercase;">Confidential Legal<br />Consultancy</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 28px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#2B251B;">Verify your email address</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#575043;">${description}</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                <tr><td align="center" style="background-color:#F9F6EE;border:1.5px dashed #B08D26;border-radius:10px;padding:20px;">
                  <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#2B251B;font-family:'Courier New',Courier,monospace;">${code}</span>
                </td></tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#6E6659;">This verification code is valid for <strong>10 minutes</strong>. For your privacy and security, never share this code with anyone.</p>
            </td>
          </tr>
          <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #EFECE4;margin:0;" /></td></tr>
          <tr><td style="padding:20px 32px 28px;font-size:12px;line-height:1.5;color:#8C8476;">If you did not request this verification code, you can safely ignore this email.<br /><br />&copy; 2026 RinRelief. All rights reserved.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export async function notifyAdminOfNewCase(input: { id: string; clientName: string; lender: string; phone: string }) {
  if (env.RESEND_API_KEY.startsWith("re_local_") || env.RESEND_API_KEY === "replace-with-resend-api-key") {
    console.warn("Admin case email skipped because RESEND_API_KEY is not configured.");
    return;
  }
  const { error } = await resend.emails.send({
    from: sender,
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `New debt case ${input.id}`,
    text: `New inquiry from ${input.clientName} (${input.phone}) regarding ${input.lender}. Case ID: ${input.id}`,
  });
  if (error) throw new Error(`Admin notification failed: ${error.message}`);
}

export async function sendPasswordResetEmail(input: { email: string; resetUrl: string }) {
  const { error } = await resend.emails.send({
    from: sender,
    to: input.email,
    subject: "Reset your Rinrelife password",
    text: `Use this link to reset your Rinrelife password: ${input.resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
  });
  if (error) throw new Error(`Password reset email failed: ${error.message}`);
}

export async function sendVerificationCodeEmail(input: { email: string; code: string; purpose: "admin" | "password" }) {
  const subject = input.purpose === "admin" ? "Verify your Rinrelife admin account" : "Confirm your Rinrelife password change";
  const purpose = input.purpose === "admin" ? "verify your admin account" : "confirm your password change";
  const { error } = await resend.emails.send({
    from: sender,
    to: input.email,
    subject,
    text: `Your Rinrelife verification code is ${input.code}. Use it to ${purpose}. This code expires in 10 minutes. If you did not request this, contact your super admin immediately.`,
    html: verificationEmailHtml(input),
    attachments: [{
      filename: "rinrelief-logo.png",
      content: logoContent,
      contentType: "image/png",
      contentId: logoContentId,
    }],
  });
  if (error) throw new Error(`Verification email failed: ${error.message}`);
}
