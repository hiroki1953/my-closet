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

    const { userId, itemType, description, reason, productUrl, priority } =
      await request.json();

    if (!userId || !itemType || !description || !reason) {
      return NextResponse.json(
        { error: "userId, itemType, description, and reason are required" },
        { status: 400 }
      );
    }

    // ユーザーが存在し、担当スタイリストかチェック
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        role: "USER",
        assignedStylistId: session.user.id, // 担当スタイリストかチェック
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or not assigned to this stylist" },
        { status: 404 }
      );
    }

    // バリデーション
    const validPriorities = ["HIGH", "MEDIUM", "LOW"];
    const validatedPriority = validPriorities.includes(priority)
      ? priority
      : "MEDIUM";

    const recommendation = await prisma.purchaseRecommendation.create({
      data: {
        userId,
        stylistId: session.user.id,
        itemType,
        description,
        reason,
        productUrl: productUrl || null,
        priority: validatedPriority,
        status: "PENDING",
      },
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error creating purchase recommendation:", error);
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
    const status = searchParams.get("status");

    const whereCondition: {
      stylistId: string;
      userId?: string;
      status?: "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED";
    } = {
      stylistId: session.user.id,
      ...(userId && { userId }),
      ...(status &&
        ["PENDING", "VIEWED", "PURCHASED", "DECLINED"].includes(status) && {
          status: status as "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED",
        }),
    };

    const recommendations = await prisma.purchaseRecommendation.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching purchase recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストのみアクセス可能
    if (session.user?.role !== "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      id,
      itemType,
      description,
      reason,
      productUrl,
      priority,
      status,
      declineReason,
    } = await request.json();

    if (!id || !itemType || !description) {
      return NextResponse.json(
        { error: "id, itemType, and description are required" },
        { status: 400 }
      );
    }

    // 推奨がスタイリストのものかチェック
    const existingRecommendation =
      await prisma.purchaseRecommendation.findFirst({
        where: {
          id,
          stylistId: session.user.id,
        },
      });

    if (!existingRecommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    // バリデーション
    const validPriorities = ["HIGH", "MEDIUM", "LOW"];
    const validatedPriority = validPriorities.includes(priority)
      ? priority
      : "MEDIUM";

    const validStatuses = ["PENDING", "VIEWED", "PURCHASED", "DECLINED"];
    const validatedStatus = validStatuses.includes(status)
      ? status
      : existingRecommendation.status;

    const updatedRecommendation = await prisma.purchaseRecommendation.update({
      where: { id },
      data: {
        itemType,
        description,
        reason: reason || "",
        productUrl: productUrl || null,
        priority: validatedPriority,
        status: validatedStatus,
        // 編集時にステータスがPENDINGにリセットされる場合は却下理由もクリア
        declineReason: status === "PENDING" ? null : declineReason,
      },
    });

    return NextResponse.json(updatedRecommendation);
  } catch (error) {
    console.error("Error updating purchase recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スタイリストのみアクセス可能
    if (session.user?.role !== "STYLIST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // 推奨がスタイリストのものかチェック
    const existingRecommendation =
      await prisma.purchaseRecommendation.findFirst({
        where: {
          id,
          stylistId: session.user.id,
        },
      });

    if (!existingRecommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    await prisma.purchaseRecommendation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Recommendation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting purchase recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
