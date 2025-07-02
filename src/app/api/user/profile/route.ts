import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  height: z.number().int().min(100).max(250).optional(),
  weight: z.number().int().min(30).max(200).optional(),
  age: z.number().int().min(10).max(100).optional(),
  bodyType: z.enum(["STRAIGHT", "WAVE", "NATURAL", "UNKNOWN"]).optional(),
  personalColor: z
    .enum(["SPRING", "SUMMER", "AUTUMN", "WINTER", "UNKNOWN"])
    .optional(),
  profileImageUrl: z.string().optional(), // URLバリデーションを削除（空文字列を許可）
  stylePreference: z.string().optional(),
  concerns: z.string().optional(),
  goals: z.string().optional(),
  budget: z.string().optional(),
  lifestyle: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET() {
  try {
    console.log("🔍 Profile fetch request started");
    const session = await auth();

    if (!session?.user?.id) {
      console.error("❌ No session or user ID");
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    console.log("✅ Session validated, user ID:", session.user.id);

    // Prisma接続を確認
    console.log("🔗 Testing database connection...");
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ Database connection successful");
    } catch (connectionError) {
      console.error("❌ Database connection failed:", connectionError);
      throw new Error("Database connection failed");
    }

    console.log("🔍 Fetching user profile...");
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    console.log("📊 Profile found:", !!profile);
    if (profile) {
      console.log("📋 Profile data:", JSON.stringify(profile, null, 2));
    }

    // プロフィール完成度を計算
    const calculateCompletion = (profile: Record<string, unknown> | null) => {
      if (!profile) return { percentage: 0, missingFields: [] };

      const fields = [
        { key: "height", label: "身長" },
        { key: "weight", label: "体重" },
        { key: "age", label: "年齢" },
        { key: "bodyType", label: "骨格タイプ" },
        { key: "personalColor", label: "パーソナルカラー" },
        { key: "profileImageUrl", label: "プロフィール写真" },
        { key: "stylePreference", label: "スタイルの好み" },
        { key: "goals", label: "目標・なりたいイメージ" },
        { key: "lifestyle", label: "ライフスタイル" },
        { key: "budget", label: "予算感" },
      ];

      const completedFields = fields.filter(
        (field) =>
          profile[field.key] &&
          profile[field.key] !== "UNKNOWN" &&
          String(profile[field.key]).trim() !== ""
      );

      const missingFields = fields
        .filter(
          (field) =>
            !profile[field.key] ||
            profile[field.key] === "UNKNOWN" ||
            String(profile[field.key]).trim() === ""
        )
        .map((field) => field.label);

      const percentage = Math.round(
        (completedFields.length / fields.length) * 100
      );

      return { percentage, missingFields };
    };

    const completion = calculateCompletion(profile);
    console.log("📈 Profile completion:", completion);

    // 本番環境ではPrisma接続を切断
    if (process.env.NODE_ENV === "production") {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      profile,
      completion,
    });
  } catch (error) {
    console.error("💥 Profile fetch error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // エラー時もPrisma接続を切断
    if (process.env.NODE_ENV === "production") {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error("⚠️ Failed to disconnect Prisma:", disconnectError);
      }
    }

    return NextResponse.json(
      { error: "プロフィールの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔍 Profile save request started");
    const session = await auth();

    if (!session?.user?.id) {
      console.error("❌ No session or user ID");
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    console.log("✅ Session validated, user ID:", session.user.id);

    const body = await request.json();
    console.log("📦 Request body received:", JSON.stringify(body, null, 2));

    console.log("🔍 Validating data with Zod schema...");
    const validatedData = profileSchema.parse(body);
    console.log("✅ Data validation successful:", JSON.stringify(validatedData, null, 2));

    // Prisma接続を確認
    console.log("🔗 Testing database connection...");
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ Database connection successful");
    } catch (connectionError) {
      console.error("❌ Database connection failed:", connectionError);
      throw new Error("Database connection failed");
    }

    // 既存のプロフィールがあるかチェック
    console.log("🔍 Checking for existing profile...");
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    console.log("📊 Existing profile found:", !!existingProfile);
    if (existingProfile) {
      console.log("📋 Existing profile data:", JSON.stringify(existingProfile, null, 2));
    }

    let profile;
    if (existingProfile) {
      // 更新
      console.log("📝 Updating existing profile...");
      profile = await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: validatedData,
      });
      console.log("✅ Profile updated successfully");
    } else {
      // 新規作成
      console.log("➕ Creating new profile...");
      profile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          ...validatedData,
        },
      });
      console.log("✅ Profile created successfully");
    }

    console.log("🎉 Final profile:", JSON.stringify(profile, null, 2));

    // 本番環境ではPrisma接続を切断
    if (process.env.NODE_ENV === "production") {
      await prisma.$disconnect();
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("💥 Profile save error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // エラー時もPrisma接続を切断
    if (process.env.NODE_ENV === "production") {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error("⚠️ Failed to disconnect Prisma:", disconnectError);
      }
    }

    if (error instanceof z.ZodError) {
      console.error("📋 Zod validation errors:", error.errors);
      return NextResponse.json(
        { error: "入力データが無効です", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "プロフィールの保存に失敗しました" },
      { status: 500 }
    );
  }
}
