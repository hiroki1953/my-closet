#!/usr/bin/env tsx

import "dotenv/config";
import { supabaseAdmin } from "../src/lib/supabase";

async function setupDevelopmentEnvironment() {
  console.log("🛠️ 開発環境のセットアップを開始します...");

  try {
    // 1. Supabase接続テスト
    console.log("🔌 Supabase接続をテスト中...");
    const { data: buckets, error: testError } =
      await supabaseAdmin.storage.listBuckets();

    if (testError) {
      console.error("❌ Supabase接続に失敗しました:", testError);
      console.log("💡 .envファイルの設定を確認してください");
      return;
    }

    console.log("✅ Supabase接続成功");

    // 2. データベースマイグレーション
    console.log("📚 データベースマイグレーションを実行中...");

    // 3. ストレージバケットの設定
    console.log("📦 ストレージバケットをセットアップ中...");

    const requiredBuckets = [
      {
        name: "profile-images",
        description: "プロフィール画像用バケット",
      },
      {
        name: "clothing-items",
        description: "服のアイテム画像用バケット",
      },
    ];

    for (const bucket of requiredBuckets) {
      const bucketExists = buckets?.some((b) => b.name === bucket.name);

      if (!bucketExists) {
        console.log(`📁 ${bucket.name} バケットを作成中...`);

        const { error: createError } = await supabaseAdmin.storage.createBucket(
          bucket.name,
          {
            public: true,
            allowedMimeTypes: [
              "image/jpeg",
              "image/png",
              "image/webp",
              "image/jpg",
            ],
            fileSizeLimit: 10485760, // 10MB
          }
        );

        if (createError) {
          console.error(`❌ ${bucket.name} バケットの作成に失敗:`, createError);
          continue;
        }

        console.log(`✅ ${bucket.name} バケットを作成しました`);
      } else {
        console.log(`✅ ${bucket.name} バケットは既に存在します`);
      }
    }

    // 4. 開発用シードデータの投入
    console.log("🌱 開発用データを準備中...");

    // 最終確認
    const { data: finalBuckets } = await supabaseAdmin.storage.listBuckets();
    console.log("🎉 開発環境のセットアップが完了しました!");
    console.log("📦 利用可能なバケット:");
    finalBuckets?.forEach((bucket) => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });

    console.log("\n📝 次の手順:");
    console.log("1. Prismaマイグレーションを実行: npm run db:push");
    console.log("2. シードデータを投入: npm run db:seed");
    console.log("3. 開発サーバーを起動: npm run dev");
  } catch (error) {
    console.error("💥 開発環境セットアップ中にエラーが発生:", error);
  }
}

// メイン実行
setupDevelopmentEnvironment();
