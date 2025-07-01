import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const params = await context.params;
    const outfitId = params.id;

    const outfit = await prisma.outfit.findFirst({
      where: {
        id: outfitId,
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
    });

    if (!outfit) {
      return NextResponse.json(
        { error: "コーディネートが見つかりません" },
        { status: 404 }
      );
    }

    // レスポンス形式を整形
    interface CreatedBy {
      id: string;
      name: string;
      role: string;
    }

    interface FormattedClothingItem {
      id: string;
      imageUrl: string;
      category: string;
      color: string;
      brand: string;
      description: string;
    }

    interface FormattedOutfit {
      id: string;
      title: string;
      stylistComment: string | null;
      tips: string | null;
      stylingAdvice: string | null;
      createdAt: Date;
      createdBy: CreatedBy | null;
      clothingItems: FormattedClothingItem[];
    }

    const formattedOutfit: FormattedOutfit = {
      id: outfit.id,
      title: outfit.title,
      stylistComment: outfit.stylistComment,
      tips: outfit.tips,
      stylingAdvice: outfit.stylingAdvice,
      createdAt: outfit.createdAt,
      createdBy: outfit.createdBy
        ? {
            id: outfit.createdBy.id as string,
            name: (outfit.createdBy.name as string) || "名前なし",
            role: outfit.createdBy.role as string,
          }
        : null,
      clothingItems: outfit.clothingItems.map(
        (item: {
          clothingItem: {
            id: string;
            imageUrl: string;
            category: string;
            color: string;
            brand?: string | null;
            description?: string | null;
          };
        }): FormattedClothingItem => ({
          id: item.clothingItem.id,
          imageUrl: item.clothingItem.imageUrl,
          category: item.clothingItem.category,
          color: item.clothingItem.color,
          brand: item.clothingItem.brand || "",
          description: item.clothingItem.description || "",
        })
      ),
    };

    return NextResponse.json(formattedOutfit);
  } catch (error) {
    console.error("Outfit fetch error:", error);
    return NextResponse.json(
      { error: "コーディネートの取得に失敗しました" },
      { status: 500 }
    );
  }
}
