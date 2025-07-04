import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 編集用データ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; outfitId: string }> }
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

    const { id: userId, outfitId } = await params;

    // ユーザー情報とアイテム一覧を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        clothingItems: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            imageUrl: true,
            category: true,
            color: true,
            brand: true,
            description: true,
          },
          orderBy: {
            category: "asc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 編集対象のコーディネートを取得
    const outfit = await prisma.outfit.findUnique({
      where: {
        id: outfitId,
        userId: userId,
        createdById: session.user.id, // このスタイリストが作成したもののみ
      },
      include: {
        clothingItems: {
          include: {
            clothingItem: {
              select: {
                id: true,
                imageUrl: true,
                category: true,
                color: true,
                brand: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    // レスポンス形式を整形
    const formattedOutfit = {
      id: outfit.id,
      title: outfit.title,
      stylistComment: outfit.stylistComment,
      tips: outfit.tips,
      stylingAdvice: outfit.stylingAdvice,
      createdAt: outfit.createdAt.toISOString(),
      clothingItems: outfit.clothingItems.map(
        (item: (typeof outfit.clothingItems)[0]) => ({
          id: item.clothingItem.id,
          imageUrl: item.clothingItem.imageUrl,
          category: item.clothingItem.category,
          color: item.clothingItem.color,
          brand: item.clothingItem.brand,
          description: item.clothingItem.description,
        })
      ),
    };

    return NextResponse.json({
      user,
      outfit: formattedOutfit,
    });
  } catch (error) {
    console.error("Error fetching edit data:", error);
    return NextResponse.json(
      { error: "編集データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
