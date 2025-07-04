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
      // このスタイリストが担当するユーザー数
      prisma.user.count({
        where: {
          role: "USER",
          assignedStylistId: session.user.id,
        },
      }),

      // 未評価アイテム数（このスタイリストが担当するユーザーの削除されていない、評価されていないアイテム）
      prisma.clothingItem.count({
        where: {
          status: {
            not: "DISPOSED",
          },
          user: {
            assignedStylistId: session.user.id,
          },
          evaluations: {
            none: {},
          },
        },
      }),

      // このスタイリストが作成したコーディネート数
      prisma.outfit.count({
        where: {
          createdById: session.user.id,
        },
      }),

      // このスタイリストが作成した購入提案数
      prisma.purchaseRecommendation.count({
        where: {
          stylistId: session.user.id,
        },
      }),

      // このスタイリストが担当するユーザー詳細情報（制限付き）
      prisma.user.findMany({
        where: {
          role: "USER",
          assignedStylistId: session.user.id,
        },
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
              clothingItems: {
                where: {
                  status: {
                    not: "DISPOSED",
                  },
                },
              },
              outfits: true,
            },
          },
          clothingItems: {
            where: {
              status: {
                not: "DISPOSED",
              },
            },
            select: {
              id: true,
              evaluations: {
                where: {
                  stylistId: session.user.id,
                },
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
            where: {
              stylistId: session.user.id,
            },
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 15, // レコード数を制限してパフォーマンス向上
      }),
    ]);

    // ユーザーごとの詳細状態を計算
    interface UserWithDetails {
      id: string;
      name: string | null;
      email: string;
      createdAt: Date;
      userProfile: {
        profileImageUrl: string | null;
        height: number | null;
        age: number | null;
      } | null;
      _count: {
        clothingItems: number;
        outfits: number;
      };
      clothingItems: {
        id: string;
        evaluations: { id: string }[];
      }[];
      outfits: {
        id: string;
        createdAt: Date;
      }[];
      receivedRecommendations: {
        id: string;
        status: string;
      }[];
    }

    const usersWithStatus = usersWithDetails.map((user: UserWithDetails) => {
      const unevaluatedItems = user.clothingItems.filter(
        (item) => item.evaluations.length === 0
      ).length;

      const pendingRecommendations = user.receivedRecommendations.filter(
        (rec) => rec.status === "pending"
      ).length;

      const completedRecommendations = user.receivedRecommendations.filter(
        (rec) => rec.status === "purchased"
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

    interface UserStatus {
      id: string;
      name: string;
      email: string;
      profileImageUrl: string | null | undefined;
      height: number | null | undefined;
      age: number | null | undefined;
      itemsCount: number;
      outfitsCount: number;
      unevaluatedItems: number;
      pendingRecommendations: number;
      completedRecommendations: number;
      lastActivity: string;
      lastOutfitDate: string | undefined;
      daysSinceLastOutfit: number | null;
      priorityLevel: "high" | "medium" | "low";
      priorityScore: number;
      needsAttention: boolean;
    }

    // 優先度順にソート
    usersWithStatus.sort(
      (a: UserStatus, b: UserStatus) => b.priorityScore - a.priorityScore
    );

    const dashboardData = {
      totalUsers,
      pendingEvaluations: totalUnevaluatedItems,
      totalOutfits,
      totalRecommendations,
      users: usersWithStatus,
      summary: {
        highPriorityUsers: usersWithStatus.filter(
          (u: UserStatus) => u.priorityLevel === "high"
        ).length,
        usersNeedingAttention: usersWithStatus.filter(
          (u: UserStatus) => u.needsAttention
        ).length,
        usersWithoutOutfits: usersWithStatus.filter(
          (u: UserStatus) => u.outfitsCount === 0
        ).length,
        totalUnevaluatedItems,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API error:", error);

    // データベース接続エラーの詳細をログに記録
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
