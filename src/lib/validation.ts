import { z } from "zod";

export const createCaseSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientEmail: z.string().trim().email().max(320),
  clientPhone: z.string().trim().regex(/^\+?[0-9\s-]{10,18}$/),
  city: z.string().trim().min(2).max(80),
  bankOrLenderName: z.string().trim().min(2).max(120),
  loanType: z.enum(["CREDIT_CARD", "PERSONAL_LOAN", "APP_LOAN_INSTANT", "BUSINESS_LOAN", "HOME_OR_AUTO_LOAN"]),
  totalOutstanding: z.number().finite().positive().max(100_000_000),
  principalAmount: z.number().finite().positive().optional(),
  overdueDurationDays: z.number().int().nonnegative().max(36500),
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
});
