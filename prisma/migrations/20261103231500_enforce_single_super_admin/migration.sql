-- Keep the earliest seeded super admin as the sole super admin.
WITH keeper AS (
  SELECT "id"
  FROM "User"
  WHERE "role" = 'SUPER_ADMIN'
  ORDER BY "createdAt", "id"
  LIMIT 1
)
UPDATE "User"
SET "role" = 'ADVOCATE'
WHERE "role" = 'SUPER_ADMIN'
  AND "id" NOT IN (SELECT "id" FROM keeper);

CREATE UNIQUE INDEX "User_single_super_admin"
ON "User" ("role")
WHERE "role" = 'SUPER_ADMIN';
