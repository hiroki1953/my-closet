"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditIcon, TrashIcon } from "lucide-react";

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

interface RecommendationCardProps {
  recommendation: PurchaseRecommendation;
  onEdit: (recommendation: PurchaseRecommendation) => void;
  onDelete: (recommendation: PurchaseRecommendation) => void;
}

export function RecommendationCard({
  recommendation,
  onEdit,
  onDelete,
}: RecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "高";
      case "MEDIUM":
        return "中";
      case "LOW":
        return "低";
      default:
        return "中";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "VIEWED":
        return "secondary";
      case "PURCHASED":
        return "default";
      case "DECLINED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "提案中";
      case "VIEWED":
        return "確認済み";
      case "PURCHASED":
        return "購入済み";
      case "DECLINED":
        return "却下";
      default:
        return "提案中";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">
            {recommendation.itemType}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                getPriorityColor(recommendation.priority) as
                  | "default"
                  | "secondary"
                  | "destructive"
                  | "outline"
              }
            >
              優先度: {getPriorityText(recommendation.priority)}
            </Badge>
            <Badge
              variant={
                getStatusColor(recommendation.status) as
                  | "default"
                  | "secondary"
                  | "destructive"
                  | "outline"
              }
            >
              {getStatusText(recommendation.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-slate-900 mb-2 text-sm md:text-base">
            説明
          </h4>
          <p className="text-slate-700 text-sm md:text-base">
            {recommendation.description}
          </p>
        </div>

        {recommendation.reason && (
          <div>
            <h4 className="font-medium text-slate-900 mb-2 text-sm md:text-base">
              推奨理由
            </h4>
            <p className="text-slate-700 text-sm md:text-base">
              {recommendation.reason}
            </p>
          </div>
        )}

        {recommendation.productUrl && (
          <div>
            <h4 className="font-medium text-slate-900 mb-2 text-sm md:text-base">
              商品URL
            </h4>
            <a
              href={recommendation.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm md:text-base break-all"
            >
              {recommendation.productUrl}
            </a>
          </div>
        )}

        {recommendation.status === "DECLINED" &&
          recommendation.declineReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-medium text-red-900 mb-2 text-sm md:text-base flex items-center">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                ユーザーからのフィードバック（却下理由）
              </h4>
              <p className="text-red-800 text-sm md:text-base">
                {recommendation.declineReason}
              </p>
            </div>
          )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs md:text-sm text-slate-500">
            作成日:{" "}
            {new Date(recommendation.createdAt).toLocaleDateString("ja-JP")}
          </p>

          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(recommendation)}
              className="h-10 sm:h-8"
            >
              <EditIcon className="h-4 w-4 mr-2" />
              編集
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(recommendation)}
              className="h-10 sm:h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
