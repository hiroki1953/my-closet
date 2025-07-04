import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// コーディネート削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ outfitId: string }> }
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

    const { outfitId } = await params;

    // 削除対象のコーディネートを確認（スタイリストが作成したもののみ）
    const outfit = await prisma.outfit.findUnique({
      where: {
        id: outfitId,
        createdById: session.user.id,
      },
    });

    if (!outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    // トランザクションで削除処理
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // まず関連するOutfitClothingItemを削除
      await tx.outfitClothingItem.deleteMany({
        where: { outfitId },
      });

      // コーディネートを削除
      await tx.outfit.delete({
        where: { id: outfitId },
      });
    });

    return NextResponse.json({ message: "コーディネートを削除しました" });
  } catch (error) {
    console.error("Error deleting outfit:", error);
    return NextResponse.json(
      { error: "コーディネートの削除に失敗しました" },
      { status: 500 }
    );
  }
}

// コーディネート更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ outfitId: string }> }
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

    const { outfitId } = await params;
    const { title, stylistComment, tips, stylingAdvice, itemIds } =
      await request.json();

    // 必須フィールドの検証
    if (!title || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: "タイトルとアイテムは必須です" },
        { status: 400 }
      );
    }

    // 更新対象のコーディネートを確認（スタイリストが作成したもののみ）
    const outfit = await prisma.outfit.findUnique({
      where: {
        id: outfitId,
        createdById: session.user.id,
      },
    });

    if (!outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    // トランザクションで更新処理
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // コーディネート情報を更新
      await tx.outfit.update({
        where: { id: outfitId },
        data: {
          title,
          stylistComment: stylistComment || "",
          tips: tips || "",
          stylingAdvice: stylingAdvice || "",
        },
      });

      // 既存のアイテム関連を削除
      await tx.outfitClothingItem.deleteMany({
        where: { outfitId },
      });

      // 新しいアイテム関連を作成
      await tx.outfitClothingItem.createMany({
        data: itemIds.map((itemId: string) => ({
          outfitId,
          clothingItemId: itemId,
        })),
      });
    });

    // 更新されたコーディネートを詳細情報とともに返す
    const outfitWithDetails = await prisma.outfit.findUnique({
      where: { id: outfitId },
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
    });

    return NextResponse.json(outfitWithDetails);
  } catch (error) {
    console.error("Error updating outfit:", error);
    return NextResponse.json(
      { error: "コーディネートの更新に失敗しました" },
      { status: 500 }
    );
  }
}
