"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface CreateRecommendationData {
  userId: string;
  itemType: string;
  description: string;
  reason: string;
  productUrl?: string;
  priority: string;
}

interface RecommendationCreateFormProps {
  userId: string;
  onSubmit: (data: CreateRecommendationData) => Promise<void>;
}

export function RecommendationCreateForm({
  userId,
  onSubmit,
}: RecommendationCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemType: "",
    description: "",
    reason: "",
    productUrl: "",
    priority: "MEDIUM",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemType.trim() || !formData.description.trim()) {
      alert("アイテムタイプと説明を入力してください");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        userId,
      });

      // Reset form after successful submission
      setFormData({
        itemType: "",
        description: "",
        reason: "",
        productUrl: "",
        priority: "MEDIUM",
      });
    } catch (error) {
      console.error("Failed to create recommendation:", error);
      alert("推奨の作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      itemType: "",
      description: "",
      reason: "",
      productUrl: "",
      priority: "MEDIUM",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          新しい購入推奨を作成
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemType">アイテムタイプ *</Label>
              <Input
                id="itemType"
                placeholder="例: ビジネスシャツ、カジュアルパンツ"
                value={formData.itemType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    itemType: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">優先度</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="LOW">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">説明 *</Label>
            <Textarea
              id="description"
              placeholder="どのようなアイテムを推奨するか詳しく説明"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">推奨理由</Label>
            <Textarea
              id="reason"
              placeholder="なぜこのアイテムが必要なのか理由を説明"
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="productUrl">商品URL（任意）</Label>
            <Input
              id="productUrl"
              type="url"
              placeholder="https://example.com/product"
              value={formData.productUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  productUrl: e.target.value,
                }))
              }
            />
            <p className="text-sm text-gray-500 mt-1">
              おすすめの商品のURLを入力すると、ユーザーが直接商品ページにアクセスできます
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.itemType.trim() ||
                !formData.description.trim()
              }
              className="w-full sm:w-auto"
            >
              {loading ? "作成中..." : "推奨を作成"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              リセット
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
