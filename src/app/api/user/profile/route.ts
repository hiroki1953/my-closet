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
  profileImageUrl: z.string().url().optional(),
  stylePreference: z.string().optional(),
  concerns: z.string().optional(),
  goals: z.string().optional(),
  budget: z.string().optional(),
  lifestyle: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

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

    return NextResponse.json({
      profile,
      completion,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "プロフィールの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // 既存のプロフィールがあるかチェック
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    let profile;
    if (existingProfile) {
      // 更新
      profile = await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: validatedData,
      });
    } else {
      // 新規作成
      profile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          ...validatedData,
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile save error:", error);
    if (error instanceof z.ZodError) {
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
