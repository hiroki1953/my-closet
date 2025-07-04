import { PrismaClient } from "@prisma/client";

// NODE_ENVが設定されていない場合のデフォルト値
const nodeEnv = process.env.NODE_ENV || "development";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 本番環境用の接続設定
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error("DATABASE_URL is not defined");
  }

  // 本番環境では接続プールの設定を追加
  if (nodeEnv === "production") {
    const url = new URL(baseUrl);
    url.searchParams.set("pgbouncer", "true");
    url.searchParams.set("connection_limit", "10");
    url.searchParams.set("pool_timeout", "30");
    return url.toString();
  }

  // 開発環境では制限を緩くする
  const url = new URL(baseUrl);
  url.searchParams.set("pgbouncer", "true");
  url.searchParams.set("connection_limit", "5");
  return url.toString();
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: nodeEnv === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

// 開発環境でのみ接続を再利用
if (nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

// アプリケーション終了時のクリーンアップ
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
