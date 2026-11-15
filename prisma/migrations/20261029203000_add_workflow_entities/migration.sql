CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED');
CREATE TYPE "FeeModel" AS ENUM ('FLAT', 'MILESTONE', 'INSTALLMENT');
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'WAIVED');

ALTER TABLE "CaseDocument"
ADD COLUMN "title" TEXT,
ADD COLUMN "referenceNo" TEXT,
ADD COLUMN "isClientVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "CaseMilestone" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "stageName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "responseNote" TEXT,
  "dueDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CaseMilestone_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CaseMilestone_caseId_status_idx" ON "CaseMilestone"("caseId", "status");
ALTER TABLE "CaseMilestone" ADD CONSTRAINT "CaseMilestone_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DebtCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LegalNotice" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "referenceNo" TEXT NOT NULL,
  "noticeType" TEXT NOT NULL,
  "recipient" TEXT,
  "sentAt" TIMESTAMP(3),
  "trackingNumber" TEXT,
  "replyCount" INTEGER NOT NULL DEFAULT 0,
  "fileUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LegalNotice_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LegalNotice_caseId_referenceNo_idx" ON "LegalNotice"("caseId", "referenceNo");
ALTER TABLE "LegalNotice" ADD CONSTRAINT "LegalNotice_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DebtCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "caseId" TEXT,
  "feeModel" "FeeModel" NOT NULL DEFAULT 'FLAT',
  "totalFee" DOUBLE PRECISION NOT NULL,
  "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Invoice_clientId_createdAt_idx" ON "Invoice"("clientId", "createdAt");
CREATE INDEX "Invoice_caseId_idx" ON "Invoice"("caseId");
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "DebtCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Installment" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
  "paidAt" TIMESTAMP(3),
  "receiptUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Installment_invoiceId_dueDate_idx" ON "Installment"("invoiceId", "dueDate");
CREATE INDEX "Installment_status_dueDate_idx" ON "Installment"("status", "dueDate");
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "referenceNo" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT,
  "category" TEXT NOT NULL,
  "issueSummary" TEXT NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "assignedToId" TEXT,
  "convertedCaseId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Lead_referenceNo_key" ON "Lead"("referenceNo");
CREATE UNIQUE INDEX "Lead_convertedCaseId_key" ON "Lead"("convertedCaseId");
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
CREATE INDEX "Lead_assignedToId_status_idx" ON "Lead"("assignedToId", "status");
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedCaseId_fkey" FOREIGN KEY ("convertedCaseId") REFERENCES "DebtCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
