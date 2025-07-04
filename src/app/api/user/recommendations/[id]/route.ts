import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/user/recommendations/[id] - 購入推奨のステータスを更新
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストではなく一般ユーザーのみ
    if (session.user.role === "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recommendationId = params.id;
    const body = await request.json();
    const { status, declineReason } = body;

    // 有効なステータスチェック
    const validStatuses = ["PENDING", "VIEWED", "PURCHASED", "DECLINED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 推奨が存在し、かつユーザーのものかチェック
    const existingRecommendation =
      await prisma.purchaseRecommendation.findFirst({
        where: {
          id: recommendationId,
          userId: session.user.id,
        },
      });

    if (!existingRecommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    // 更新データを準備
    const updateData: {
      status: "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED";
      updatedAt: Date;
      declineReason?: string;
    } = {
      status: status as "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED",
      updatedAt: new Date(),
    };

    // DECLINEDの場合は理由も保存
    if (status === "DECLINED" && declineReason) {
      updateData.declineReason = declineReason;
    }

    const updatedRecommendation = await prisma.purchaseRecommendation.update({
      where: { id: recommendationId },
      data: updateData,
      include: {
        stylist: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRecommendation);
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
