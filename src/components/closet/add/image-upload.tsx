"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Loader2 } from "lucide-react";

interface ImageUploadProps {
  imagePreview: string;
  onImageChange: (imageUrl: string) => void;
}

export function ImageUpload({ imagePreview, onImageChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImageToSupabase = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/clothing-item", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "アップロードに失敗しました");
    }

    const data = await response.json();
    return data.url;
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setIsUploading(true);
        try {
          // まずプレビュー表示
          const previewUrl = URL.createObjectURL(file);
          onImageChange(previewUrl);

          // 実際にアップロード
          const uploadedUrl = await uploadImageToSupabase(file);
          onImageChange(uploadedUrl);
        } catch (error) {
          console.error("画像アップロードエラー:", error);
          alert(
            error instanceof Error
              ? error.message
              : "アップロードに失敗しました"
          );
        } finally {
          setIsUploading(false);
        }
      }
    },
    [onImageChange, uploadImageToSupabase]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  // スマホカメラを直接起動する関数
  const openCamera = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // 背面カメラを使用
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          // まずプレビュー表示
          const previewUrl = URL.createObjectURL(file);
          onImageChange(previewUrl);

          // 実際にアップロード
          const uploadedUrl = await uploadImageToSupabase(file);
          onImageChange(uploadedUrl);
        } catch (error) {
          console.error("画像アップロードエラー:", error);
          alert(
            error instanceof Error
              ? error.message
              : "アップロードに失敗しました"
          );
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  }, [onImageChange, uploadImageToSupabase]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        服の画像 <span className="text-destructive">*</span>
      </Label>

      {/* カメラボタン（モバイル用） */}
      <div className="flex gap-2 mb-4 md:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={openCamera}
          className="flex-1 h-12"
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          {isUploading ? "アップロード中..." : "カメラで撮影"}
        </Button>
      </div>

      {/* ドラッグ&ドロップエリア */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary hover:bg-muted/50"
        } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input {...getInputProps()} disabled={isUploading} />
        {imagePreview ? (
          <div className="space-y-4">
            <div className="w-32 h-32 relative rounded-lg mx-auto overflow-hidden">
              <Image
                src={imagePreview}
                alt="アップロード済み画像"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              別の画像をアップロードするには、ここにドラッグ&ドロップまたはクリック
            </p>
            <div className="flex gap-2 justify-center md:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openCamera}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-1" />
                )}
                {isUploading ? "アップロード中..." : "再撮影"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isUploading
                  ? "画像をアップロード中..."
                  : "画像をドラッグ&ドロップ または クリックして選択"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP (最大10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
