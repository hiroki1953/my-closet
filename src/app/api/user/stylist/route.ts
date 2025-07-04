import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザーのスタイリスト情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        assignedStylist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      stylist: user.assignedStylist,
    });
  } catch (error) {
    console.error("Error fetching stylist:", error);
    return NextResponse.json(
      { error: "スタイリスト情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
