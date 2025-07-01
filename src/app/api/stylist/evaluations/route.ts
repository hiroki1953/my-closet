import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { itemId, evaluation, comment } = await request.json();

    if (!itemId || !evaluation) {
      return NextResponse.json(
        { error: "itemId and evaluation are required" },
        { status: 400 }
      );
    }

    // バリデーション
    const validEvaluations = ["NECESSARY", "UNNECESSARY", "KEEP"];
    if (!validEvaluations.includes(evaluation)) {
      return NextResponse.json(
        { error: "Invalid evaluation value" },
        { status: 400 }
      );
    }

    // アイテムが存在するかチェック
    const item = await prisma.clothingItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Clothing item not found" },
        { status: 404 }
      );
    }

    // 既存の評価があれば更新、なければ作成
    const existingEvaluation = await prisma.itemEvaluation.findFirst({
      where: {
        itemId,
        stylistId: session.user.id,
      },
    });

    let itemEvaluation;

    if (existingEvaluation) {
      // 更新
      itemEvaluation = await prisma.itemEvaluation.update({
        where: { id: existingEvaluation.id },
        data: {
          evaluation,
          comment: comment || "",
        },
      });
    } else {
      // 作成
      itemEvaluation = await prisma.itemEvaluation.create({
        data: {
          itemId,
          stylistId: session.user.id,
          evaluation,
          comment: comment || "",
        },
      });
    }

    return NextResponse.json(itemEvaluation);
  } catch (error) {
    console.error("Error creating/updating evaluation:", error);
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
      stylistId: session.user.id,
      ...(userId && {
        item: {
          userId,
        },
      }),
    };

    const evaluations = await prisma.itemEvaluation.findMany({
      where: whereCondition,
      include: {
        item: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
