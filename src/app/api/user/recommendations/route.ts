import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/recommendations - ユーザーの購入推奨一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストではなく一般ユーザーのみ
    if (session.user.role === "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: {
      userId: string;
      status?: "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED";
    } = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status as "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED";
    }

    const recommendations = await prisma.purchaseRecommendation.findMany({
      where,
      include: {
        stylist: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING を最初に
        { priority: "desc" }, // HIGH を最初に
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching user recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
