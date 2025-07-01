import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // クローゼットのアイテムを取得
    const clothingItems = await prisma.clothingItem.findMany({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
      include: {
        evaluations: {
          where: {
            stylistId: session.user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // カテゴリ別に集計
    const itemsByCategory = clothingItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof clothingItems>);

    // 評価状況の集計
    const evaluationStats = {
      total: clothingItems.length,
      evaluated: clothingItems.filter((item) => item.evaluations.length > 0)
        .length,
      necessary: clothingItems.filter(
        (item) =>
          item.evaluations.length > 0 &&
          item.evaluations[0].evaluation === "NECESSARY"
      ).length,
      unnecessary: clothingItems.filter(
        (item) =>
          item.evaluations.length > 0 &&
          item.evaluations[0].evaluation === "UNNECESSARY"
      ).length,
      keep: clothingItems.filter(
        (item) =>
          item.evaluations.length > 0 &&
          item.evaluations[0].evaluation === "KEEP"
      ).length,
    };

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.userProfile,
      },
      clothingItems,
      itemsByCategory,
      evaluationStats,
    });
  } catch (error) {
    console.error("Error fetching user closet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
