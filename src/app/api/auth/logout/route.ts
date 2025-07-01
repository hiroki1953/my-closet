import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "ログインしていません" },
        { status: 401 }
      );
    }

    // ログアウトログの記録（将来的な機能）
    console.log(
      `User logged out: ${session.user?.email} at ${new Date().toISOString()}`
    );

    return NextResponse.json({
      message: "ログアウトしました",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "ログアウト処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
