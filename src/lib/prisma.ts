import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
    datasources: {
      db: {
        url: process.env.NODE_ENV === "production" 
          ? process.env.DIRECT_URL // 本番環境では接続プーリングを避ける
          : process.env.DATABASE_URL,
      },
    },
  });

// 本番環境ではグローバルでの再利用を避ける（接続プールの問題を防ぐため）
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Vercel環境での適切なクリーンアップ
if (process.env.NODE_ENV === "production") {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
