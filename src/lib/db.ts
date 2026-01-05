import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// PrismaClient 싱글톤 패턴
// Next.js의 Hot Reload로 인한 중복 인스턴스 생성 방지
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// PostgreSQL pool 생성 (싱글톤)
const connectionString = process.env.DATABASE_URL!;
const pool = globalForPrisma.pool ?? new Pool({ connectionString });
const adapter = new PrismaPg(pool);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
