import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // アイテム統計を取得
    const clothingItems = await prisma.clothingItem.findMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      select: {
        category: true,
      },
    });

    const categories = {
      TOPS: 0,
      BOTTOMS: 0,
      SHOES: 0,
      ACCESSORIES: 0,
      OUTERWEAR: 0,
    };

    clothingItems.forEach((item) => {
      if (item.category in categories) {
        categories[item.category as keyof typeof categories]++;
      }
    });

    // コーディネート統計を取得
    const outfitsCount = await prisma.outfit.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      clothing: {
        total: clothingItems.length,
        categories,
      },
      outfits: outfitsCount,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "統計の取得に失敗しました" },
      { status: 500 }
    );
  }
}
