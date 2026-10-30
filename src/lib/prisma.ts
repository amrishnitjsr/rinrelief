import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getRuntimeDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const url = new URL(databaseUrl);
  if (url.hostname.includes("-pooler.")) url.hostname = url.hostname.replace("-pooler.", ".");
  url.searchParams.delete("pgbouncer");
  url.searchParams.set("connect_timeout", "30");
  url.searchParams.set("pool_timeout", "30");
  url.searchParams.set("connection_limit", "5");
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getRuntimeDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
