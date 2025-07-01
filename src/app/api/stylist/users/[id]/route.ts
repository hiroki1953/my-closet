import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストのみアクセス可能
    if (session.user?.role !== "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await context.params;
    const userId = params.id;

    // ユーザーの詳細情報を取得
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        role: "USER", // 通常ユーザーのみ
      },
      include: {
        clothingItems: {
          where: { status: "ACTIVE" },
          include: {
            evaluations: {
              orderBy: { createdAt: "desc" },
              take: 1, // 最新の評価のみ
            },
          },
          orderBy: { createdAt: "desc" },
        },
        outfits: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            clothingItems: {
              where: { status: "ACTIVE" },
            },
            outfits: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
