import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateItemSchema = z.object({
  action: z.enum([
    "mark_unnecessary",
    "delete",
    "mark_active",
    "mark_roomwear",
  ]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id: itemId } = await params;
    const body = await request.json();
    const { action } = updateItemSchema.parse(body);

    // アイテムが存在し、ユーザーが所有者であることを確認
    const item = await prisma.clothingItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "アイテムが見つかりません" },
        { status: 404 }
      );
    }

    let updatedItem;

    switch (action) {
      case "mark_unnecessary":
        // ステータスを不要に変更
        updatedItem = await prisma.clothingItem.update({
          where: { id: itemId },
          data: { status: "INACTIVE" },
        });
        break;

      case "mark_active":
        // ステータスを使用中に変更
        updatedItem = await prisma.clothingItem.update({
          where: { id: itemId },
          data: { status: "ACTIVE" },
        });
        break;

      case "mark_roomwear":
        // ステータスを部屋着に変更（「INACTIVE」など既存のEnum値を利用）
        updatedItem = await prisma.clothingItem.update({
          where: { id: itemId },
          data: { status: "INACTIVE" }, // 必要に応じてEnum値を変更
        });
        break;

      case "delete":
        // アイテムを削除（論理削除）
        updatedItem = await prisma.clothingItem.update({
          where: { id: itemId },
          data: { status: "DISPOSED" },
        });
        break;

      default:
        return NextResponse.json(
          { error: "無効なアクションです" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message:
        action === "mark_unnecessary"
          ? "アイテムを不要にマークしました"
          : action === "mark_active"
          ? "アイテムを使用中に戻しました"
          : action === "mark_roomwear"
          ? "アイテムを部屋着にマークしました"
          : "アイテムを削除しました",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Item update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "無効なリクエストです" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "アイテムの更新に失敗しました" },
      { status: 500 }
    );
  }
}
