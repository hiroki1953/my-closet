"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, User } from "lucide-react";

interface ProfileImageUploadProps {
  imagePreview?: string;
  onImageChange: (imageUrl: string) => void;
}

export function ProfileImageUpload({
  imagePreview,
  onImageChange,
}: ProfileImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        onImageChange(fileUrl);
      }
    },
    [onImageChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  // スマホカメラを直接起動する関数
  const openCamera = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "user"; // フロントカメラを使用（セルフィー用）
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        onImageChange(fileUrl);
      }
    };
    input.click();
  }, [onImageChange]);

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
        >
          <Camera className="w-4 h-4 mr-2" />
          自撮りで撮影
        </Button>
      </div>

      {/* ドラッグ&ドロップエリア */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />
        {imagePreview ? (
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
