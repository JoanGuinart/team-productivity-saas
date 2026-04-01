import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDemoReadonly = process.env.DEMO_READONLY === "true";
const databaseUrl =
  process.env.DATABASE_URL ||
  (isDemoReadonly ? "postgresql://demo:demo@localhost:5432/demo" : undefined);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

function normalizeDatabaseUrl(url: string): string {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  const isSupabasePooler =
    parsed.hostname.includes("pooler.supabase.com") || parsed.port === "6543";

  if (!isSupabasePooler) {
    return url;
  }

  // Supabase pooler + Prisma can fail with prepared statement collisions
  // if pgbouncer mode is not explicitly enabled.
  if (!parsed.searchParams.has("pgbouncer")) {
    parsed.searchParams.set("pgbouncer", "true");
  }

  if (!parsed.searchParams.has("connection_limit")) {
    parsed.searchParams.set("connection_limit", "1");
  }

  return parsed.toString();
}

const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: normalizedDatabaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
