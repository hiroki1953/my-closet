import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ユーザーのコーディネート一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: userId } = await params;

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ユーザーのコーディネート一覧を取得
    const outfits = await prisma.outfit.findMany({
      where: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // レスポンス形式を整形
    const formattedOutfits = outfits.map(
      (outfit: {
        id: string;
        title: string;
        stylistComment: string | null;
        tips: string | null;
        stylingAdvice: string | null;
        createdAt: Date;
        clothingItems: Array<{
          clothingItem: {
            id: string;
            imageUrl: string;
            category: string;
            color: string;
            brand: string | null;
            description: string | null;
          };
        }>;
      }) => ({
        id: outfit.id,
        title: outfit.title,
        stylistComment: outfit.stylistComment,
        tips: outfit.tips,
        stylingAdvice: outfit.stylingAdvice,
        createdAt: outfit.createdAt.toISOString(),
        clothingItems: outfit.clothingItems.map(
          (item: {
            clothingItem: {
              id: string;
              imageUrl: string;
              category: string;
              color: string;
              brand: string | null;
              description: string | null;
            };
          }) => ({
            id: item.clothingItem.id,
            imageUrl: item.clothingItem.imageUrl,
            category: item.clothingItem.category,
            color: item.clothingItem.color,
            brand: item.clothingItem.brand,
            description: item.clothingItem.description,
          })
        ),
      })
    );

    return NextResponse.json({
      user,
      outfits: formattedOutfits,
    });
  } catch (error) {
    console.error("Error fetching user outfits:", error);
    return NextResponse.json(
      { error: "コーディネート一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// ユーザー向けコーディネート作成
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: userId } = await params;
    const { title, stylistComment, tips, stylingAdvice, itemIds } =
      await request.json();

    if (!title || !itemIds || itemIds.length === 0) {
      return NextResponse.json(
        { error: "title and itemIds are required" },
        { status: 400 }
      );
    }

    // ユーザーが存在するかチェック
    const user = await prisma.user.findUnique({
      where: { id: userId, role: "USER" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 指定されたアイテムがすべて存在し、そのユーザーのものかチェック
    const items = await prisma.clothingItem.findMany({
      where: {
        id: { in: itemIds },
        userId,
        status: "ACTIVE",
      },
    });

    if (items.length !== itemIds.length) {
      return NextResponse.json(
        { error: "Some items not found or not belong to the user" },
        { status: 400 }
      );
    }

    // データベーストランザクションでコーディネートとアイテムの関連を作成
    const outfit = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // コーディネートを作成
        const newOutfit = await tx.outfit.create({
          data: {
            title,
            stylistComment: stylistComment || "",
            tips: tips || "",
            stylingAdvice: stylingAdvice || "",
            userId,
            createdById: session.user.id, // スタイリストのID
          },
        });

        // コーディネートとアイテムの関連を作成
        await tx.outfitClothingItem.createMany({
          data: itemIds.map((itemId: string) => ({
            outfitId: newOutfit.id,
            clothingItemId: itemId,
          })),
        });

        return newOutfit;
      }
    );

    // 作成されたコーディネートを詳細情報とともに返す
    const outfitWithDetails = await prisma.outfit.findUnique({
      where: { id: outfit.id },
      include: {
        clothingItems: {
          include: {
            clothingItem: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(outfitWithDetails);
  } catch (error) {
    console.error("Error creating outfit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
