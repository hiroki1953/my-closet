"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PurchaseRecommendation {
  id: string;
  itemType: string;
  description: string;
  reason: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface RecommendationDeleteDialogProps {
  recommendation: PurchaseRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function RecommendationDeleteDialog({
  recommendation,
  isOpen,
  onClose,
  onDelete,
}: RecommendationDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!recommendation) return;

    setLoading(true);
    try {
      await onDelete(recommendation.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete recommendation:", error);
      alert("推奨の削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>推奨を削除</DialogTitle>
              <DialogDescription className="mt-1">
                この操作は取り消せません
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {recommendation && (
          <div className="py-4">
            <div className="rounded-lg border bg-gray-50 p-3">
              <h4 className="font-medium text-gray-900">
                {recommendation.itemType}
              </h4>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {recommendation.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    recommendation.priority === "HIGH"
                      ? "bg-red-100 text-red-800"
                      : recommendation.priority === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  優先度:{" "}
                  {recommendation.priority === "HIGH"
                    ? "高"
                    : recommendation.priority === "MEDIUM"
                    ? "中"
                    : "低"}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              本当にこの購入推奨を削除しますか？
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "削除中..." : "削除する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
