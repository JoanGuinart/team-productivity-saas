import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Check .env.local / .env");
}

const createClient = () => {
  // Prisma Postgres / Accelerate style URLs
  if (
    databaseUrl.startsWith("prisma://") ||
    databaseUrl.startsWith("prisma+postgres://")
  ) {
    return new PrismaClient({
      datasourceUrl: databaseUrl,
    });
  }

  // Direct Postgres connection strings (e.g. Supabase)
  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    const shouldUseSsl =
      !databaseUrl.includes("localhost") &&
      !databaseUrl.includes("127.0.0.1");

    const pool =
      globalForPrisma.pgPool ??
      new Pool({
        connectionString: databaseUrl,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.pgPool = pool;
    }

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  throw new Error(
    "Unsupported DATABASE_URL protocol. Expected prisma://, prisma+postgres://, postgresql:// or postgres://",
  );
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
