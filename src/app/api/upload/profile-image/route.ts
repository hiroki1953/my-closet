import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (10MB以下)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズが大きすぎます (10MB以下)" },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "サポートされていないファイル形式です" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ユニークなファイル名を生成
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const ext = path.extname(file.name);
    const filename = `profile_${session.user.id}_${hash.substring(0, 8)}${ext}`;

    // publicディレクトリに保存
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");

    // ディレクトリが存在しない場合は作成
    try {
      await writeFile(path.join(uploadDir, "test.txt"), "");
    } catch {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // 公開URLを生成
    const imageUrl = `/uploads/profiles/${filename}`;

    return NextResponse.json({
      message: "画像がアップロードされました",
      url: imageUrl,
    });
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return NextResponse.json(
      { error: "画像のアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
