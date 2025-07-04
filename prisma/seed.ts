import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 シードデータを作成中...");

  // サンプルユーザーの作成
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

  // ユーザープロフィールの作成
  await prisma.userProfile.create({
    data: {
      userId: user.id,
      height: 175,
      weight: 70,
      age: 28,
      stylePreference: "カジュアル",
      bodyType: "STRAIGHT",
      lifestyle: "ビジネスマン",
    },
  });

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

  // サンプル服アイテムの作成
  const clothingItems = [
    {
      imageUrl:
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
      category: "TOPS" as const,
      color: "ネイビー",
      brand: "UNIQLO",
      description: "ネイビーのシンプルなTシャツ",
      purchaseDate: new Date("2024-03-15"),
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
      category: "BOTTOMS" as const,
      color: "インディゴ",
      brand: "MUJI",
      description: "デニムパンツ（ストレート）",
      purchaseDate: new Date("2024-02-20"),
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
      category: "SHOES" as const,
      color: "ホワイト",
      brand: "NIKE",
      description: "ホワイトスニーカー",
      purchaseDate: new Date("2024-01-10"),
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
      category: "TOPS" as const,
      color: "ホワイト",
      brand: "GU",
      description: "ホワイトのオックスフォードシャツ",
      purchaseDate: new Date("2024-04-05"),
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
      category: "BOTTOMS" as const,
      color: "ブラック",
      brand: "UNIQLO",
      description: "ブラックのチノパンツ",
      purchaseDate: new Date("2024-03-01"),
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
      category: "SHOES" as const,
      color: "ブラウン",
      brand: "CLARKS",
      description: "ブラウンのローファー",
      purchaseDate: new Date("2024-02-15"),
    },
  ];

  const createdItems = [];
  for (const item of clothingItems) {
    const clothingItem = await prisma.clothingItem.create({
      data: {
        ...item,
        userId: user.id,
        status: "ACTIVE" as const,
      },
    });
    createdItems.push(clothingItem);
    console.log(
      `👕 服アイテム作成: ${clothingItem.category} - ${clothingItem.color}`
    );
  }

  // サンプルコーディネートの作成
  const outfits = [
    {
      title: "カジュアルビジネス",
      stylistComment:
        "清潔感があり、ビジネスシーンでも好印象を与えるコーディネートです！",
      tips: "シャツの袖をまくると、さらにこなれた印象になります✨",
      itemIds: [createdItems[3].id, createdItems[4].id, createdItems[5].id], // シャツ + チノパン + ローファー
    },
    {
      title: "リラックスカジュアル",
      stylistComment: "デートやお出かけにぴったりの親しみやすいスタイルです💫",
      tips: "Tシャツの色とスニーカーを合わせることで統一感が生まれます",
      itemIds: [createdItems[0].id, createdItems[1].id, createdItems[2].id], // Tシャツ + デニム + スニーカー
    },
  ];

  for (const outfit of outfits) {
    const createdOutfit = await prisma.outfit.create({
      data: {
        title: outfit.title,
        stylistComment: outfit.stylistComment,
        tips: outfit.tips,
        userId: user.id,
        createdById: stylist.id, // スタイリストが作成
      },
    });

    // アウトフィットとアイテムの関連付け
    for (const itemId of outfit.itemIds) {
      await prisma.outfitClothingItem.create({
        data: {
          outfitId: createdOutfit.id,
          clothingItemId: itemId,
        },
      });
    }

    console.log(`✨ コーディネート作成: ${createdOutfit.title}`);
  }

  // サンプルメッセージの作成
  const messages = [
    {
      content:
        "こんにちは！うーちゃんです✨ あなたのスタイリングをお手伝いします！",
      senderType: "STYLIST",
    },
    {
      content: "コーディネートについて相談があります",
      senderType: "USER",
    },
    {
      content: "どのようなご相談でしょうか？お聞かせください😊",
      senderType: "STYLIST",
    },
    {
      content: "デートにぴったりのコーディネートを提案していただけますか？",
      senderType: "USER",
    },
    {
      content:
        "デートでしたら「リラックスカジュアル」のコーディネートがおすすめです！親しみやすく、かつおしゃれな印象を与えられます💕",
      senderType: "STYLIST",
    },
  ];

  for (const message of messages) {
    await prisma.message.create({
      data: {
        content: message.content,
        senderType: message.senderType as "USER" | "STYLIST",
        fromUserId: message.senderType === "USER" ? user.id : stylist.id,
        toUserId: message.senderType === "USER" ? stylist.id : user.id,
      },
    });
    console.log(`💬 メッセージ作成: ${message.senderType}`);
  }

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
