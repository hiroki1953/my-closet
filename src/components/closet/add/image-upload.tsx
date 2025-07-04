"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Loader2 } from "lucide-react";
import { 
  optimizeCameraImage, 
  formatFileSize, 
  generateAcceptAttribute 
} from "@/lib/image-conversion";

interface ImageUploadProps {
  imagePreview: string;
  onImageChange: (imageUrl: string) => void;
}

export function ImageUpload({ imagePreview, onImageChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // ファイルを処理してアップロード
  const processAndUploadFile = useCallback(async (file: File) => {
    console.log("📤 Processing file:", {
      name: file.name,
      type: file.type,
      size: formatFileSize(file.size)
    });

    // カメラ画像の場合は最適化
    let processedFile = file;
    if (file.name.toLowerCase().includes('image') || file.type.includes('image')) {
      setUploadProgress("画像を最適化中...");
      try {
        processedFile = await optimizeCameraImage(file);
        console.log("✅ Image optimization completed:", {
          originalSize: formatFileSize(file.size),
          optimizedSize: formatFileSize(processedFile.size)
        });
      } catch (error) {
        console.warn("⚠️ Image optimization failed, using original:", error);
        // 最適化に失敗した場合は元のファイルを使用
      }
    }

    setUploadProgress("アップロード中...");

    const formData = new FormData();
    formData.append("file", processedFile);

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
        setUploadProgress("ファイルを処理中...");
        
        try {
          // まずプレビュー表示
          const previewUrl = URL.createObjectURL(file);
          onImageChange(previewUrl);

          // 実際にアップロード
          const uploadedUrl = await processAndUploadFile(file);
          onImageChange(uploadedUrl);
          setUploadProgress("アップロード完了!");
        } catch (error) {
          console.error("画像アップロードエラー:", error);
          setUploadProgress("");
          alert(
            error instanceof Error
              ? error.message
              : "アップロードに失敗しました"
          );
        } finally {
          setIsUploading(false);
          setTimeout(() => setUploadProgress(""), 2000);
        }
      }
    },
    [onImageChange, processAndUploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateAcceptAttribute(),
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024, // 15MB
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
        setUploadProgress("カメラ画像を処理中...");
        
        try {
          // まずプレビュー表示
          const previewUrl = URL.createObjectURL(file);
          onImageChange(previewUrl);

          // 実際にアップロード（カメラ画像は自動的に最適化される）
          const uploadedUrl = await processAndUploadFile(file);
          onImageChange(uploadedUrl);
          setUploadProgress("アップロード完了!");
        } catch (error) {
          console.error("画像アップロードエラー:", error);
          setUploadProgress("");
          alert(
            error instanceof Error
              ? error.message
              : "アップロードに失敗しました"
          );
        } finally {
          setIsUploading(false);
          setTimeout(() => setUploadProgress(""), 2000);
        }
      }
    };
    input.click();
  }, [onImageChange, processAndUploadFile]);

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
          {isUploading ? uploadProgress || "処理中..." : "カメラで撮影"}
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
                {isUploading ? uploadProgress || "処理中..." : "再撮影"}
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
                  ? uploadProgress || "画像を処理中..."
                  : "画像をドラッグ&ドロップ または クリックして選択"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP, HEIC など (最大15MB)
              </p>
              <p className="text-xs text-muted-foreground">
                📱 カメラ撮影時は自動的にJPEG形式に最適化されます
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
