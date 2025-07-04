import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    console.log("📸 Profile image upload started");
    console.log("🔍 Environment check:");
    console.log("- SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "- SERVICE_KEY exists:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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

    // ユニークなファイル名を生成
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const fileExtension = file.name.split(".").pop() || "png";
    const filename = `profile_${session.user.id}_${hash.substring(
      0,
      8
    )}.${fileExtension}`;

    console.log("📤 Uploading to Supabase Storage:", filename);
    console.log("📦 Upload details:", {
      bucket: "profile-images",
      filename,
      contentType: file.type,
      size: buffer.length,
    });

    // Supabase管理者クライアントの接続テスト
    try {
      const { data: buckets, error: bucketsError } =
        await supabaseAdmin.storage.listBuckets();
      if (bucketsError) {
        console.error("❌ Failed to list buckets:", bucketsError);
        throw new Error(`Bucket access failed: ${bucketsError.message}`);
      }
      console.log(
        "✅ Available buckets:",
        buckets?.map((b) => b.name)
      );

      const profileBucket = buckets?.find((b) => b.name === "profile-images");
      if (!profileBucket) {
        console.error("❌ profile-images bucket not found");
        throw new Error("Profile images bucket not found");
      }
      console.log("✅ profile-images bucket found and accessible");
    } catch (bucketError) {
      console.error("💥 Bucket check failed:", bucketError);
      return NextResponse.json(
        {
          error: `ストレージバケットへのアクセスに失敗しました: ${bucketError}`,
        },
        { status: 500 }
      );
    }

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("profile-images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true, // 同じファイル名の場合は上書き
      });

    if (uploadError) {
      console.error("💥 Supabase upload error:", {
        message: uploadError.message,
        name: uploadError.name,
      });

      // より具体的なエラーメッセージ
      if (uploadError.message.includes("Bucket not found")) {
        return NextResponse.json(
          {
            error:
              "ストレージバケットが見つかりません。管理者に連絡してください。",
            details: uploadError.message,
          },
          { status: 500 }
        );
      }

      if (uploadError.message.includes("insufficient_privilege")) {
        return NextResponse.json(
          {
            error:
              "ストレージへのアクセス権限がありません。管理者に連絡してください。",
            details: uploadError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: `画像のアップロードに失敗しました: ${uploadError.message}`,
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Upload successful:", uploadData);

    // 公開URLを生成
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("profile-images")
      .getPublicUrl(filename);

    const imageUrl = publicUrlData.publicUrl;
    console.log("🔗 Public URL generated:", imageUrl);

    return NextResponse.json({
      message: "画像がアップロードされました",
      url: imageUrl,
    });
  } catch (error) {
    console.error("💥 Profile image upload error:", {
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
