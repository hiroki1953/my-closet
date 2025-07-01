import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// コーディネート一覧取得
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const outfits = await prisma.outfit.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        clothingItems: {
          include: {
            clothingItem: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // レスポンス形式を整形
    interface ClothingItem {
      id: string;
      imageUrl: string;
      category: string;
      color: string;
      brand: string;
    }

    interface FormattedOutfit {
      id: string;
      title: string;
      stylistComment: string | null;
      tips: string | null;
      createdAt: Date;
      clothingItems: ClothingItem[];
      createdBy: {
        id: string;
        name: string;
        role: string;
      } | null;
    }

    interface PrismaClothingItem {
      id: string;
      imageUrl: string;
      category: string;
      color: string;
      brand: string;
    }

    interface PrismaOutfitClothingItem {
      clothingItem: PrismaClothingItem;
    }

    interface PrismaOutfit {
      id: string;
      title: string;
      stylistComment: string | null;
      tips: string | null;
      createdAt: Date;
      clothingItems: PrismaOutfitClothingItem[];
      createdBy: {
        id: string;
        name: string;
        role: string;
      } | null;
    }

    const formattedOutfits: FormattedOutfit[] = (outfits as PrismaOutfit[]).map(
      (outfit: PrismaOutfit): FormattedOutfit => ({
        id: outfit.id,
        title: outfit.title,
        stylistComment: outfit.stylistComment,
        tips: outfit.tips,
        createdAt: outfit.createdAt,
        createdBy: outfit.createdBy,
        clothingItems: outfit.clothingItems.map(
          (item: PrismaOutfitClothingItem): ClothingItem => ({
            id: item.clothingItem.id,
            imageUrl: item.clothingItem.imageUrl,
            category: item.clothingItem.category,
            color: item.clothingItem.color,
            brand: item.clothingItem.brand,
          })
        ),
      })
    );

    return NextResponse.json(formattedOutfits);
  } catch (error) {
    console.error("Outfits fetch error:", error);
    return NextResponse.json(
      { error: "コーディネートの取得に失敗しました" },
      { status: 500 }
    );
  }
}
