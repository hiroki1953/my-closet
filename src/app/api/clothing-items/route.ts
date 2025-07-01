import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clothingItemSchema = z.object({
  imageUrl: z.string().url("有効なURLを入力してください"),
  category: z.enum(["TOPS", "BOTTOMS", "SHOES", "ACCESSORIES", "OUTERWEAR"]),
  color: z.string().min(1, "色を入力してください"),
  brand: z.string().optional(),
  description: z.string().optional(),
  purchaseDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = clothingItemSchema.parse(body);

    const clothingItem = await prisma.clothingItem.create({
      data: {
        userId: session.user.id,
        imageUrl: validatedData.imageUrl,
        category: validatedData.category,
        color: validatedData.color,
        brand: validatedData.brand,
        description: validatedData.description,
        purchaseDate: validatedData.purchaseDate
          ? new Date(validatedData.purchaseDate)
          : null,
      },
    });

    return NextResponse.json({
      message: "服を追加しました",
      clothingItem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Clothing item creation error:", error);
    return NextResponse.json(
      { error: "服の追加に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "ACTIVE";

    const whereClause: {
      userId: string;
      status: "ACTIVE" | "INACTIVE" | "DISPOSED" | "ROOMWEAR";
      category?: "TOPS" | "BOTTOMS" | "SHOES" | "ACCESSORIES" | "OUTERWEAR";
    } = {
      userId: session.user.id,
      status:
        (status as "ACTIVE" | "INACTIVE" | "DISPOSED" | "ROOMWEAR") || "ACTIVE",
    };

    if (
      category &&
      category !== "ALL" &&
      ["TOPS", "BOTTOMS", "SHOES", "ACCESSORIES", "OUTERWEAR"].includes(
        category
      )
    ) {
      whereClause.category = category as
        | "TOPS"
        | "BOTTOMS"
        | "SHOES"
        | "ACCESSORIES"
        | "OUTERWEAR";
    }

    const clothingItems = await prisma.clothingItem.findMany({
      where: whereClause,
      include: {
        evaluations: {
          include: {
            stylist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // 最新の評価のみ取得
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clothingItems);
  } catch (error) {
    console.error("Clothing items fetch error:", error);
    return NextResponse.json(
      { error: "服の取得に失敗しました" },
      { status: 500 }
    );
  }
}
