import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stylists = await prisma.user.findMany({
      where: {
        role: "STYLIST",
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(stylists);
  } catch (error) {
    console.error("スタイリスト取得エラー:", error);
    return NextResponse.json(
      { error: "スタイリストの取得に失敗しました" },
      { status: 500 }
    );
  }
}
