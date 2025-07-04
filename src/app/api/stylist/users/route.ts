import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストのみアクセス可能
    if (session.user?.role !== "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // このスタイリストが担当するユーザーの一覧を取得
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
        assignedStylistId: session.user.id,
      },
      include: {
        _count: {
          select: {
            clothingItems: {
              where: {
                status: {
                  not: "DISPOSED",
                },
              },
            },
            outfits: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
