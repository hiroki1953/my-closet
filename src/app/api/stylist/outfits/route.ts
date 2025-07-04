import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストのみアクセス可能
    if (session.user?.role !== "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, title, stylistComment, tips, stylingAdvice, itemIds } =
      await request.json();

    if (!userId || !title || !itemIds || itemIds.length === 0) {
      return NextResponse.json(
        { error: "userId, title, and itemIds are required" },
        { status: 400 }
      );
    }

    // ユーザーが存在し、担当スタイリストかチェック
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        role: "USER",
        assignedStylistId: session.user.id, // 担当スタイリストかチェック
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or not assigned to this stylist" },
        { status: 404 }
      );
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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストのみアクセス可能
    if (session.user?.role !== "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const whereCondition = {
      createdById: session.user.id, // このスタイリストが作成したもののみ
      ...(userId && { userId }),
    };

    const outfits = await prisma.outfit.findMany({
      where: whereCondition,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(outfits);
  } catch (error) {
    console.error("Error fetching outfits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
