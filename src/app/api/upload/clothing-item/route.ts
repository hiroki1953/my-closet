import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("👕 Clothing item image upload started");
    const session = await auth();

    if (!session?.user?.id) {
      console.error("❌ No authentication");
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    console.log("✅ User authenticated:", session.user.id);

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      console.error("❌ No file provided");
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    console.log("📁 File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // ファイルサイズチェック (10MB以下)
    if (file.size > 10 * 1024 * 1024) {
      console.error("❌ File too large:", file.size);
      return NextResponse.json(
        { error: "ファイルサイズが大きすぎます (10MB以下)" },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      console.error("❌ Invalid file type:", file.type);
      return NextResponse.json(
        { error: "サポートされていないファイル形式です" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ファイル拡張子を安全に取得（MIMEタイプから確実に決定）
    let safeExtension = "png"; // デフォルト
    switch (file.type) {
      case "image/jpeg":
      case "image/jpg":
        safeExtension = "jpg";
        break;
      case "image/png":
        safeExtension = "png";
        break;
      case "image/webp":
        safeExtension = "webp";
        break;
    }
    
    // より安全なファイル名を生成（数字とアルファベットのみ）
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8); // 6文字のランダム文字列
    const safeUserId = session.user.id.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8); // 8文字に制限
    
    // 複数のファイル名パターンを試行する
    const filenameOptions = [
      `img${timestamp}${randomSuffix}.${safeExtension}`, // 最もシンプル
      `clothing${timestamp}.${safeExtension}`, // シンプル2
      `c${safeUserId}${timestamp}.${safeExtension}`, // ユーザーID含む
      `clothing${safeUserId}${timestamp}${randomSuffix}.${safeExtension}` // 元の形式
    ];

    console.log("📤 Trying multiple filename patterns...");
    console.log("📋 File details:", {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      userId: session.user.id,
      safeUserId: safeUserId,
      filenameOptions: filenameOptions
    });

    // 複数のファイル名パターンを順番に試行
    let uploadData = null;
    let finalFilename = "";
    let lastError = null;

    for (const filename of filenameOptions) {
      console.log(`🔄 Trying filename: ${filename}`);
      
      const { data, error } = await supabaseAdmin.storage
        .from("clothing-items")
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!error) {
        uploadData = data;
        finalFilename = filename;
        console.log(`✅ Upload successful with filename: ${filename}`);
        break;
      } else {
        console.log(`❌ Failed with filename ${filename}:`, error.message);
        lastError = error;
      }
    }

    if (!uploadData || lastError) {
      console.error("💥 All filename patterns failed. Last error:", lastError);
      return NextResponse.json(
        { error: `すべてのファイル名パターンで失敗しました: ${lastError?.message}` },
        { status: 500 }
      );
    }

    console.log("✅ Upload successful:", uploadData);

    // 公開URLを生成
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("clothing-items")
      .getPublicUrl(finalFilename);

    const imageUrl = publicUrlData.publicUrl;
    console.log("🔗 Public URL generated:", imageUrl);

    return NextResponse.json({
      message: "画像がアップロードされました",
      url: imageUrl,
    });
  } catch (error) {
    console.error("💥 Clothing item image upload error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "画像のアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
