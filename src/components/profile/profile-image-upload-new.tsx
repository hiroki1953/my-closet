"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, User, Loader2 } from "lucide-react";

interface ProfileImageUploadProps {
  imagePreview?: string;
  onImageChange: (imageUrl: string) => void;
}

export function ProfileImageUpload({
  imagePreview,
  onImageChange,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onImageChange(result.url);
      } else {
        const error = await response.json();
        alert(error.error || "画像のアップロードに失敗しました");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadImage(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  // スマホカメラを直接起動する関数
  const openCamera = useCallback(() => {
    if (uploading) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "user"; // フロントカメラを使用（セルフィー用）
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadImage(file);
      }
    };
    input.click();
  }, [uploading]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">プロフィール写真</Label>

      {/* カメラボタン（モバイル用） */}
      <div className="flex gap-2 mb-4 md:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={openCamera}
          className="flex-1 h-12"
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          {uploading ? "アップロード中..." : "自撮りで撮影"}
        </Button>
      </div>

      {/* ドラッグ&ドロップエリア */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : uploading
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-border hover:border-primary hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
            <p className="text-sm font-medium text-foreground">
              画像をアップロード中...
            </p>
          </div>
        ) : imagePreview ? (
          <div className="space-y-4">
            <div className="w-32 h-32 relative rounded-full mx-auto overflow-hidden border-4 border-primary/20">
              <Image
                src={imagePreview}
                alt="プロフィール写真"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              別の写真をアップロードするには、ここにドラッグ&ドロップまたはクリック
            </p>
            <div className="flex gap-2 justify-center md:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openCamera}
              >
                <Camera className="w-4 h-4 mr-1" />
                再撮影
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                写真をドラッグ&ドロップ または クリックして選択
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP (最大10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        💡
        顔がわかる写真をアップロードすると、よりパーソナライズされたスタイリング提案ができます
      </p>
    </div>
  );
}
