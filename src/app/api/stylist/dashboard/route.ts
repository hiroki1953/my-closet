import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストロールチェック
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 統計情報を取得
    const [
      totalUsers,
      totalUnevaluatedItems,
      totalOutfits,
      totalRecommendations,
      usersWithDetails,
    ] = await Promise.all([
      // 総ユーザー数（スタイリスト以外）
      prisma.user.count({
        where: { role: "USER" },
      }),

      // 未評価アイテム数（評価されていないアイテム）
      prisma.clothingItem.count({
        where: {
          evaluations: {
            none: {},
          },
        },
      }),

      // 総コーディネート数
      prisma.outfit.count(),

      // 総購入提案数
      prisma.purchaseRecommendation.count(),

      // ユーザー詳細情報
      prisma.user.findMany({
        where: { role: "USER" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          userProfile: {
            select: {
              profileImageUrl: true,
              height: true,
              age: true,
            },
          },
          _count: {
            select: {
              clothingItems: true,
              outfits: true,
            },
          },
          clothingItems: {
            select: {
              id: true,
              evaluations: {
                select: {
                  id: true,
                },
              },
            },
          },
          outfits: {
            select: {
              id: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          receivedRecommendations: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // ユーザーごとの詳細状態を計算
    const usersWithStatus = usersWithDetails.map((user) => {
      const unevaluatedItems = user.clothingItems.filter(
        (item: { evaluations: { id: string }[] }) =>
          item.evaluations.length === 0
      ).length;

      const pendingRecommendations = user.receivedRecommendations.filter(
        (rec: { status: string }) => rec.status === "pending"
      ).length;

      const completedRecommendations = user.receivedRecommendations.filter(
        (rec: { status: string }) => rec.status === "purchased"
      ).length;

      const lastOutfitDate = user.outfits[0]?.createdAt;
      const daysSinceLastOutfit = lastOutfitDate
        ? Math.floor(
            (new Date().getTime() - lastOutfitDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      // 優先度を計算（緊急度スコア）
      let priorityScore = 0;
      if (unevaluatedItems > 0) priorityScore += unevaluatedItems * 2;
      if (user._count.outfits === 0) priorityScore += 10;
      if (daysSinceLastOutfit && daysSinceLastOutfit > 7) priorityScore += 5;
      if (user._count.clothingItems > 10 && unevaluatedItems > 5)
        priorityScore += 3;

      let priorityLevel: "high" | "medium" | "low" = "low";
      if (priorityScore >= 10) priorityLevel = "high";
      else if (priorityScore >= 5) priorityLevel = "medium";

      return {
        id: user.id,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        profileImageUrl: user.userProfile?.profileImageUrl,
        height: user.userProfile?.height,
        age: user.userProfile?.age,
        itemsCount: user._count.clothingItems,
        outfitsCount: user._count.outfits,
        unevaluatedItems,
        pendingRecommendations,
        completedRecommendations,
        lastActivity: user.createdAt.toISOString(),
        lastOutfitDate: lastOutfitDate?.toISOString(),
        daysSinceLastOutfit,
        priorityLevel,
        priorityScore,
        needsAttention: priorityScore >= 5,
      };
    });

    // 優先度順にソート
    usersWithStatus.sort((a, b) => b.priorityScore - a.priorityScore);

    const dashboardData = {
      totalUsers,
      pendingEvaluations: totalUnevaluatedItems,
      totalOutfits,
      totalRecommendations,
      users: usersWithStatus,
      summary: {
        highPriorityUsers: usersWithStatus.filter(
          (u) => u.priorityLevel === "high"
        ).length,
        usersNeedingAttention: usersWithStatus.filter((u) => u.needsAttention)
          .length,
        usersWithoutOutfits: usersWithStatus.filter((u) => u.outfitsCount === 0)
          .length,
        totalUnevaluatedItems,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
