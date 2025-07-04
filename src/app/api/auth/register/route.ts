import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// 環境変数チェック
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
  name: z.string().min(1, "名前を入力してください"),
  role: z.enum(["USER", "STYLIST"]).optional().default("USER"),
  stylistId: z.string().optional(), // 担当スタイリストのID
});

export async function POST(request: NextRequest) {
  // Vercel本番環境でのタイムアウト対策
  const timeoutId = setTimeout(() => {
    console.error("⏰ Registration request timeout after 25 seconds");
  }, 25000);

  try {
    console.log("🚀 Registration API called");
    console.log("🌍 Environment:", process.env.NODE_ENV);
    console.log("🔗 Database URL present:", !!process.env.DATABASE_URL);
    console.log("🔗 Direct URL present:", !!process.env.DIRECT_URL);

    const body = await request.json();
    console.log("📦 Request body received:", {
      email: body.email,
      hasPassword: !!body.password,
      name: body.name,
      role: body.role,
    });

    const { email, password, name, role, stylistId } =
      registerSchema.parse(body);
    console.log("✅ Schema validation passed");

    // スタイリストIDが指定されている場合は、そのスタイリストが存在するかチェック
    if (stylistId) {
      console.log("🔍 Checking stylist exists...");
      const stylist = await prisma.user.findFirst({
        where: {
          id: stylistId,
          role: "STYLIST",
        },
      });

      if (!stylist) {
        console.log("❌ Stylist not found:", stylistId);
        return NextResponse.json(
          { error: "指定されたスタイリストが見つかりません" },
          { status: 400 }
        );
      }
      console.log("✅ Stylist found:", stylist.name);
    }

    // Prismaクライアントの接続確認
    console.log("🔗 Testing database connection...");
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ Database connection successful");
    } catch (connectionError) {
      console.error("❌ Database connection failed:", connectionError);
      throw new Error("Database connection failed");
    }

    // 既存ユーザーチェック
    console.log("🔍 Checking existing user...");
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("❌ User already exists:", email);
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    console.log("✅ User doesn't exist, proceeding with registration");

    // パスワードハッシュ化
    console.log("🔐 Hashing password...");
    const passwordHash = await bcrypt.hash(password, 12);
    console.log("✅ Password hashed successfully");

    // ユーザー作成
    console.log("👤 Creating user in database...");
    const user = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // トランザクション内でユーザー作成
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role,
            assignedStylistId: role === "USER" ? stylistId : null, // 一般ユーザーの場合のみスタイリストを割り当て
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            assignedStylistId: true,
            createdAt: true,
          },
        });

        console.log("✅ User created in transaction:", newUser.id);

        // ユーザープロフィールも同時に作成
        try {
          await tx.userProfile.create({
            data: {
              userId: newUser.id,
              isPublic: false,
            },
          });
          console.log("✅ User profile created");
        } catch (profileError) {
          console.warn(
            "⚠️ User profile creation failed (non-critical):",
            profileError
          );
          // プロフィール作成失敗は非致命的エラーとして扱う
        }

        return newUser;
      },
      {
        timeout: 10000, // 10秒タイムアウト
      }
    );

    console.log("🎉 User created successfully:", {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    clearTimeout(timeoutId);

    // 本番環境ではリクエスト終了時にPrisma接続を切断
    if (process.env.NODE_ENV === "production") {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      message: "ユーザー登録が完了しました",
      user,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    // エラー時も確実にPrisma接続を切断
    if (process.env.NODE_ENV === "production") {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error("⚠️ Failed to disconnect Prisma:", disconnectError);
      }
    }

    console.error("💥 Registration error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    if (error instanceof z.ZodError) {
      console.error("📋 Zod validation error:", error.errors);
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Prismaエラーの詳細ログ
    if (error && typeof error === "object" && "code" in error) {
      console.error("🗄️ Database error code:", error.code);
      console.error(
        "🗄️ Database error meta:",
        (error as Record<string, unknown>).meta
      );
    }

    return NextResponse.json(
      {
        error: "ユーザー登録に失敗しました",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
