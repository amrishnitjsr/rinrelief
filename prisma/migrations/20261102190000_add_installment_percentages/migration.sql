ALTER TABLE "Installment"
ADD COLUMN "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Installment" AS installment
SET "percentage" = CASE
  WHEN invoice."totalFee" > 0 THEN ROUND(((installment."amount" / invoice."totalFee") * 100)::numeric, 2)::double precision
  ELSE 0
END
FROM "Invoice" AS invoice
WHERE installment."invoiceId" = invoice."id";
