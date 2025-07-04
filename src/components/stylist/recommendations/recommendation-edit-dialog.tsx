"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface PurchaseRecommendation {
  id: string;
  itemType: string;
  description: string;
  reason: string;
  priority: string;
  status: string;
  productUrl?: string;
  declineReason?: string;
  createdAt: string;
}

interface EditRecommendationData {
  itemType: string;
  description: string;
  reason: string;
  productUrl?: string;
  priority: string;
}

interface RecommendationEditDialogProps {
  recommendation: PurchaseRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: EditRecommendationData) => Promise<void>;
}

export function RecommendationEditDialog({
  recommendation,
  isOpen,
  onClose,
  onSave,
}: RecommendationEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemType: recommendation?.itemType || "",
    description: recommendation?.description || "",
    reason: recommendation?.reason || "",
    productUrl: recommendation?.productUrl || "",
    priority: recommendation?.priority || "MEDIUM",
  });

  // Reset form when recommendation changes
  React.useEffect(() => {
    if (recommendation) {
      setFormData({
        itemType: recommendation.itemType,
        description: recommendation.description,
        reason: recommendation.reason,
        productUrl: recommendation.productUrl || "",
        priority: recommendation.priority,
      });
    }
  }, [recommendation]);

  const handleSave = async () => {
    if (
      !recommendation ||
      !formData.itemType.trim() ||
      !formData.description.trim()
    ) {
      alert("アイテムタイプと説明を入力してください");
      return;
    }

    setLoading(true);
    try {
      await onSave(recommendation.id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to update recommendation:", error);
      alert("推奨の更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form to original values
    if (recommendation) {
      setFormData({
        itemType: recommendation.itemType,
        description: recommendation.description,
        reason: recommendation.reason,
        productUrl: recommendation.productUrl || "",
        priority: recommendation.priority,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>購入推奨を編集</DialogTitle>
        </DialogHeader>

        {/* ステータスリセットの注意書き */}
        {recommendation && recommendation.status !== "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>⚠️ 注意:</strong>{" "}
              推奨内容を編集すると、ユーザーの確認ステータスが「提案中」にリセットされ、ユーザーが再度確認する必要があります。
            </p>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-itemType">アイテムタイプ *</Label>
              <Input
                id="edit-itemType"
                placeholder="例: ビジネスシャツ、カジュアルパンツ"
                value={formData.itemType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    itemType: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-priority">優先度</Label>
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
            <Label htmlFor="edit-description">説明 *</Label>
            <Textarea
              id="edit-description"
              placeholder="どのようなアイテムを推奨するか詳しく説明"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="edit-reason">推奨理由</Label>
            <Textarea
              id="edit-reason"
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
            <Label htmlFor="edit-productUrl">商品URL（任意）</Label>
            <Input
              id="edit-productUrl"
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              loading ||
              !formData.itemType.trim() ||
              !formData.description.trim()
            }
          >
            {loading ? "更新中..." : "更新する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
