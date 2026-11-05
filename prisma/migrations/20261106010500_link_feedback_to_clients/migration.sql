ALTER TABLE "Feedback" ADD COLUMN "clientId" TEXT;

CREATE INDEX "Feedback_clientId_createdAt_idx" ON "Feedback"("clientId", "createdAt");

ALTER TABLE "Feedback"
ADD CONSTRAINT "Feedback_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
