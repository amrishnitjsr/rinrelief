import { z } from "zod";

export const createCaseSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientEmail: z.string().trim().email().max(320),
  clientPhone: z.string().trim().regex(/^\+?[0-9\s-]{10,18}$/),
  city: z.string().trim().min(2).max(80),
  matterType: z.enum(["DEBT_SETTLEMENT", "BANKING", "CIVIL_DISPUTE", "CONSUMER", "FAMILY", "CRIMINAL", "PROPERTY", "EMPLOYMENT", "BUSINESS", "CYBERCRIME", "OTHER"]).default("DEBT_SETTLEMENT"),
  matterSummary: z.string().trim().min(10).max(10_000),
  matterDetails: z.record(z.string(), z.string()).optional(),
  bankOrLenderName: z.string().trim().min(2).max(120).optional(),
  loanType: z.enum(["CREDIT_CARD", "PERSONAL_LOAN", "APP_LOAN_INSTANT", "BUSINESS_LOAN", "HOME_OR_AUTO_LOAN"]).optional(),
  totalOutstanding: z.number().finite().positive().max(100_000_000).optional(),
  principalAmount: z.number().finite().positive().optional(),
  overdueDurationDays: z.number().int().nonnegative().max(36500).default(0),
  settlementBudget: z.number().finite().positive().optional(),
  facingHarassment: z.boolean().default(false),
  harassmentType: z.enum(["ABUSIVE_CALLS", "HOME_OFFICE_VISITS", "THREATENING_MESSAGES", "DEFAMATION_CONTACTS_CALLING", "MULTIPLE_VIOLATIONS", "NONE"]).optional(),
  harassmentDetails: z.string().trim().max(10_000).optional(),
  receivedLegalNotice: z.boolean().default(false),
});


export const createDocumentSchema = z.object({
  caseId: z.string().cuid(),
  category: z.enum(["HARASSMENT_AUDIO", "SCREENSHOT_CHAT", "LEGAL_NOTICE_COPY", "LOAN_STATEMENT", "SETTLEMENT_LETTER"]),
  fileName: z.string().trim().min(1).max(255),
  fileMimeType: z.enum(["audio/mpeg", "audio/mp4", "image/jpeg", "image/png", "application/pdf"]),
  fileSize: z.number().int().positive().max(25 * 1024 * 1024),
  title: z.string().trim().max(255).optional(),
  referenceNo: z.string().trim().max(120).optional(),
  isClientVisible: z.boolean().default(true),
});

export const createLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{10,18}$/),
  email: z.string().trim().email().max(320),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().max(80).optional(),
  category: z.enum(["DEBT_SETTLEMENT", "BANKING", "CIVIL_DISPUTE", "CONSUMER", "FAMILY", "CRIMINAL", "PROPERTY", "EMPLOYMENT", "BUSINESS", "CYBERCRIME", "OTHER"]),
  issueSummary: z.string().trim().min(10).max(5_000),
});
