import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 * Prevents multiple instances of Prisma Client in development
 * Optimized for Neon Postgres (serverless PostgreSQL)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Optimize for serverless/Neon Postgres
    // Connection pooling is handled by Neon's pooler or pgbouncer
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
