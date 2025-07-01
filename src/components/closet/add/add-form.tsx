"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { FormFields } from "./form-fields";

interface FormData {
  imageUrl: string;
  category: string;
  color: string;
  brand: string;
  description: string;
  purchaseDate: string;
}

export function AddForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    imageUrl: "",
    category: "",
    color: "",
    brand: "",
    description: "",
    purchaseDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 画像URLのプレビュー
    if (name === "imageUrl" && value) {
      setImagePreview(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (imageUrl: string) => {
    setImagePreview(imageUrl);
    setFormData((prev) => ({
      ...prev,
      imageUrl,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/clothing-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/closet");
      } else {
        const data = await response.json();
        setError(data.error || "服の追加に失敗しました");
      }
    } catch (err) {
      console.error("Failed to add clothing item:", err);
      setError("服の追加に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          服の詳細情報
        </CardTitle>
        <CardDescription>
          写真と基本情報を入力して、クローゼットに追加しましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <ImageUpload
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
          />

          <FormFields
            formData={formData}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
          />

          {/* 送信ボタン */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "追加中..." : "服を追加"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link href="/closet">キャンセル</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
