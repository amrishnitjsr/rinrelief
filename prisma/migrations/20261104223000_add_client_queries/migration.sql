CREATE TABLE "ClientQuery" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientQuery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClientQuery_clientId_createdAt_idx" ON "ClientQuery"("clientId", "createdAt");
CREATE INDEX "ClientQuery_status_createdAt_idx" ON "ClientQuery"("status", "createdAt");

ALTER TABLE "ClientQuery" ADD CONSTRAINT "ClientQuery_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
