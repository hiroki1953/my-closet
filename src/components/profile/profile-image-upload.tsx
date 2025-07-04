"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (imageUrl: string | null) => void;
}

export function ProfileImageUpload({
  currentImageUrl,
  onImageChange,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(async (file: File) => {
    console.log("📸 Starting image upload:", file.name, file.size);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/profile-image", {
      method: "POST",
      body: formData,
    });

    console.log("📥 Upload response status:", response.status);
    const responseText = await response.text();
    console.log("📥 Upload response text:", responseText);

    if (!response.ok) {
      let error;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { error: responseText };
      }
      console.error("❌ Upload failed:", error);
      throw new Error(error.error || "アップロードに失敗しました");
    }

    const data = JSON.parse(responseText);
    console.log("✅ Upload successful, URL:", data.url);
    return data.url;
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // ファイルサイズチェック (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("ファイルサイズが大きすぎます（10MB以下）");
        return;
      }

      // ファイル形式チェック
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("サポートされていないファイル形式です");
        return;
      }

      setIsUploading(true);

      try {
        // プレビュー表示
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string;
          console.log("🖼️ Preview URL generated");
          setPreviewUrl(previewUrl);
        };
        reader.readAsDataURL(file);

        // アップロード実行
        console.log("🚀 Starting upload process");
        const imageUrl = await uploadImage(file);
        console.log(
          "✅ Upload completed, calling onImageChange with:",
          imageUrl
        );
        onImageChange(imageUrl);
      } catch (error) {
        console.error("💥 Image upload error:", error);
        alert(
          error instanceof Error ? error.message : "アップロードに失敗しました"
        );
        setPreviewUrl(currentImageUrl || null);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadImage, onImageChange, currentImageUrl]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <Label>プロフィール画像</Label>
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={previewUrl || undefined} alt="プロフィール画像" />
          <AvatarFallback>画像</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            {isUploading ? "アップロード中..." : "画像を選択"}
          </Button>
          <p className="text-sm text-muted-foreground">
            JPEG、PNG、WebP形式（10MB以下）
          </p>
        </div>
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
