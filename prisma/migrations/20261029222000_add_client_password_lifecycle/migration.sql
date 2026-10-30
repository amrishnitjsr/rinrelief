ALTER TABLE "User"
ADD COLUMN "temporaryPasswordCiphertext" TEXT,
ADD COLUMN "temporaryPasswordIssuedAt" TIMESTAMP(3),
ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
