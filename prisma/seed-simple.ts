import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("🌱 シードデータを作成中...");

    // 既存データをクリア
    await prisma.purchaseRecommendation.deleteMany();
    await prisma.message.deleteMany();
    await prisma.outfitClothingItem.deleteMany();
    await prisma.outfit.deleteMany();
    await prisma.itemEvaluation.deleteMany();
    await prisma.clothingItem.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 通常ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        passwordHash: hashedPassword,
        name: "太郎",
        role: "USER",
      },
    });

    console.log(`✅ ユーザー作成: ${user.email}`);

    // スタイリスト（うーちゃん）の作成
    const stylist = await prisma.user.create({
      data: {
        email: "stylist@senseup.com",
        passwordHash: hashedPassword,
        name: "うーちゃん",
        role: "STYLIST",
      },
    });

    console.log(`✅ スタイリスト作成: ${stylist.email}`);

    // 2番目のスタイリストを作成
    const stylist2 = await prisma.user.create({
      data: {
        email: "stylist2@senseup.com",
        passwordHash: hashedPassword,
        name: "あーちゃん",
        role: "STYLIST",
      },
    });

    console.log(`✅ スタイリスト2作成: ${stylist2.email}`);

    // ユーザーにスタイリストを割り当て
    await prisma.user.update({
      where: { id: user.id },
      data: { assignedStylistId: stylist.id },
    });

    console.log(
      `✅ ユーザー ${user.name} にスタイリスト ${stylist.name} を割り当て`
    );

    // 追加のテストユーザーを作成（スタイリスト2に割り当て）
    const user2 = await prisma.user.create({
      data: {
        email: "test2@example.com",
        passwordHash: hashedPassword,
        name: "花子",
        role: "USER",
        assignedStylistId: stylist2.id,
      },
    });

    console.log(`✅ ユーザー2作成: ${user2.email} (スタイリスト2に割り当て)`);

    // 追加のテストユーザーを作成（スタイリスト1に割り当て）
    const user3 = await prisma.user.create({
      data: {
        email: "test3@example.com",
        passwordHash: hashedPassword,
        name: "次郎",
        role: "USER",
        assignedStylistId: stylist.id,
      },
    });

    console.log(`✅ ユーザー3作成: ${user3.email} (スタイリスト1に割り当て)`);

    // サンプル購入推奨の作成
    const purchaseRecommendations = [
      {
        itemType: "ライトアウター",
        description:
          "春秋に使えるテーラードジャケット。ネイビーまたはグレーがおすすめです。",
        reason:
          "現在のワードローブにアウターが少なく、ビジネスカジュアルシーンで活用できるアイテムが必要です。",
        productUrl: "https://www.uniqlo.com/jp/ja/products/E454160-000",
        priority: "HIGH" as const,
        status: "PENDING" as const,
      },
      {
        itemType: "ニットセーター",
        description:
          "薄手のVネックニット。グレーまたはネイビーの無地がおすすめです。",
        reason:
          "寒い季節のインナーとして、また一枚で着てもおしゃれな印象を与えられます。",
        productUrl: "https://www.uniqlo.com/jp/ja/products/E454157-000",
        priority: "MEDIUM" as const,
        status: "PENDING" as const,
      },
      {
        itemType: "腕時計",
        description:
          "シンプルなデザインの腕時計。シルバーまたはブラックの文字盤がおすすめです。",
        reason:
          "アクセサリーを取り入れることで、コーディネートに洗練された印象をプラスできます。",
        productUrl: "https://www.casio.com/jp/watches/casio/mtp-1183a-7a",
        priority: "LOW" as const,
        status: "PENDING" as const,
      },
    ];

    for (const recommendation of purchaseRecommendations) {
      await prisma.purchaseRecommendation.create({
        data: {
          ...recommendation,
          userId: user.id,
          stylistId: stylist.id,
        },
      });
      console.log(`🛍️ 購入推奨作成: ${recommendation.itemType}`);
    }

    console.log("🎉 シードデータの作成が完了しました！");
    console.log("📧 テストユーザー: test@example.com");
    console.log("📧 スタイリスト: stylist@senseup.com");
    console.log("🔑 パスワード: password123");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
