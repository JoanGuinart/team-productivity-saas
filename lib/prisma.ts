import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

if (!directUrl) {
  throw new Error("DIRECT_URL is not set");
}

const createClient = () => {
  // Prisma Accelerate / Data Proxy
  if (
    directUrl.startsWith("prisma://") ||
    directUrl.startsWith("prisma+postgres://")
  ) {
    return new PrismaClient({
      datasourceUrl: directUrl,
    });
  }

  // Supabase / Postgres (NO pooler)
  if (
    directUrl.startsWith("postgresql://") ||
    directUrl.startsWith("postgres://")
  ) {
    const shouldUseSsl =
      !directUrl.includes("localhost") && !directUrl.includes("127.0.0.1");

    const pool =
      globalForPrisma.pgPool ??
      new Pool({
        connectionString: directUrl,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.pgPool = pool;
    }

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  throw new Error("Unsupported DIRECT_URL protocol");
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
