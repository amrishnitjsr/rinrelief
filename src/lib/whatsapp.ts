const adminWhatsAppPhone = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE ?? "919876543210").replace(/\D/g, "");

function cleanWhatsAppText(value: string) {
  return value.replace(/\*/g, "").replace(/\s+/g, " ").trim();
}

function formatWhatsAppLines(lines: Array<string | undefined>) {
  return lines.filter((line): line is string => line !== undefined).join("\n");
}

export function openAdminWhatsApp(message: string) {
  const url = `https://wa.me/${adminWhatsAppPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function formatLeadWhatsAppMessage(input: {
  id: string;
  referenceNo: string;
  name: string;
  phone: string;
  category: string;
  issueSummary: string;
}) {
  return formatWhatsAppLines([
    "*NEW LEGAL INQUIRY*",
    `Lead ID: ${cleanWhatsAppText(input.id)}`,
    `Reference: ${cleanWhatsAppText(input.referenceNo)}`,
    `Client: ${cleanWhatsAppText(input.name)}`,
    `Contact: ${cleanWhatsAppText(input.phone)}`,
    `Category: ${cleanWhatsAppText(input.category)}`,
    "",
    "*INQUIRY*",
    cleanWhatsAppText(input.issueSummary),
  ]);
}

export function formatCaseWhatsAppMessage(input: {
  caseNumber: string;
  name: string;
  phone: string;
  matterType: string;
  matterSummary: string;
  lender?: string;
  loanType?: string;
  outstanding?: string;
  overdueMonths?: string;
  city: string;
  inquiry: string;
}) {
  return formatWhatsAppLines([
    "*NEW LEGAL CASE*",
    `Case ID: ${cleanWhatsAppText(input.caseNumber)}`,
    `Client: ${cleanWhatsAppText(input.name)}`,
    `Contact: ${cleanWhatsAppText(input.phone)}`,
    `City: ${cleanWhatsAppText(input.city)}`,
    `Matter type: ${cleanWhatsAppText(input.matterType)}`,
    input.lender ? `Organisation / other party: ${cleanWhatsAppText(input.lender)}` : undefined,
    input.loanType ? `Loan type: ${cleanWhatsAppText(input.loanType)}` : undefined,
    input.outstanding ? `Amount involved: ₹${cleanWhatsAppText(input.outstanding)}` : undefined,
    input.overdueMonths ? `Overdue: ${cleanWhatsAppText(input.overdueMonths)} months` : undefined,
    "",
    "*MATTER SUMMARY*",
    cleanWhatsAppText(input.matterSummary),
    "",
    "*ADDITIONAL DETAILS*",
    cleanWhatsAppText(input.inquiry),
  ]);
}
