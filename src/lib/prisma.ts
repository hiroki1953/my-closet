import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 開発環境では prepared statement の競合を避けるため、統一された設定を使用
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // 開発環境でのprepared statement競合を回避
    datasources: {
      db: {
        url: process.env.NODE_ENV === "development" 
          ? process.env.DATABASE_URL + "?pgbouncer=true&connection_limit=1"
          : process.env.NODE_ENV === "production" 
            ? process.env.DIRECT_URL 
            : process.env.DATABASE_URL,
      },
    },
  });

// 開発環境では接続を再利用、本番環境では避ける
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // 本番環境でのクリーンアップ
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
