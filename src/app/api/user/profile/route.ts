import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  height: z.union([z.number().int().min(100).max(250), z.null()]).optional(),
  weight: z.union([z.number().int().min(30).max(200), z.null()]).optional(),
  age: z.union([z.number().int().min(10).max(100), z.null()]).optional(),
  bodyType: z
    .enum(["STRAIGHT", "WAVE", "NATURAL", "UNKNOWN"])
    .nullable()
    .optional(),
  personalColor: z
    .enum(["SPRING", "SUMMER", "AUTUMN", "WINTER", "UNKNOWN"])
    .nullable()
    .optional(),
  profileImageUrl: z.string().nullable().optional(), // 空文字列とnullを許可
  stylePreference: z.string().nullable().optional(),
  concerns: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  budget: z.string().nullable().optional(),
  lifestyle: z.string().nullable().optional(),
  isPublic: z.boolean().optional().default(false),
});

// データを前処理する関数
function preprocessProfileData(data: Record<string, unknown>) {
  const processed = { ...data };

  // 空文字列をnullに変換
  Object.keys(processed).forEach((key) => {
    if (processed[key] === "") {
      processed[key] = null;
    }
    // "UNKNOWN"を null に変換（選択されていない状態として扱う）
    if (processed[key] === "UNKNOWN") {
      processed[key] = null;
    }
  });

  return processed;
}

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

      const completedFields = fields.filter((field) => {
        const value = profile[field.key];
        return (
          value !== null &&
          value !== undefined &&
          value !== "UNKNOWN" &&
          String(value).trim() !== ""
        );
      });

      const missingFields = fields
        .filter((field) => {
          const value = profile[field.key];
          return (
            value === null ||
            value === undefined ||
            value === "UNKNOWN" ||
            String(value).trim() === ""
          );
        })
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

    // データを前処理
    console.log("🔄 Preprocessing profile data...");
    const preprocessedData = preprocessProfileData(body);
    console.log(
      "📋 Preprocessed data:",
      JSON.stringify(preprocessedData, null, 2)
    );

    console.log("🔍 Validating data with Zod schema...");
    const validatedData = profileSchema.parse(preprocessedData);
    console.log(
      "✅ Data validation successful:",
      JSON.stringify(validatedData, null, 2)
    );

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
      console.log(
        "📋 Existing profile data:",
        JSON.stringify(existingProfile, null, 2)
      );
    }

    let profile;
    if (existingProfile) {
      // 更新
      console.log("📝 Updating existing profile...");
      console.log("📝 Update data:", JSON.stringify(validatedData, null, 2));
      profile = await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: validatedData,
      });
      console.log(
        "✅ Profile updated successfully:",
        JSON.stringify(profile, null, 2)
      );
    } else {
      // 新規作成
      console.log("➕ Creating new profile...");
      console.log("➕ Create data:", JSON.stringify(validatedData, null, 2));
      profile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          ...validatedData,
        },
      });
      console.log(
        "✅ Profile created successfully:",
        JSON.stringify(profile, null, 2)
      );
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
