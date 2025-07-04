"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, ExternalLinkIcon } from "lucide-react";
import { DeclineDialog } from "./decline-dialog";

interface PurchaseRecommendation {
  id: string;
  itemType: string;
  description: string;
  reason: string;
  productUrl?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED";
  createdAt: string;
  stylist: {
    name: string;
  };
}

interface RecommendationCardProps {
  recommendation: PurchaseRecommendation;
  onMarkAsViewed: (id: string) => void;
  onDecline: (id: string, reason: string) => void;
}

export function RecommendationCard({
  recommendation,
  onMarkAsViewed,
  onDecline,
}: RecommendationCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "重要";
      case "MEDIUM":
        return "推奨";
      default:
        return "提案";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-800";
      case "VIEWED":
        return "bg-blue-100 text-blue-800";
      case "PURCHASED":
        return "bg-green-100 text-green-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "未確認";
      case "VIEWED":
        return "確認済み";
      case "PURCHASED":
        return "購入済み";
      case "DECLINED":
        return "見送り";
      default:
        return "未確認";
    }
  };

  const handleDecline = (reason: string) => {
    onDecline(recommendation.id, reason);
    setDialogOpen(false);
  };

  return (
    <Card
      className={`transition-shadow hover:shadow-md ${
        recommendation.status === "PENDING"
          ? "border-blue-200 bg-blue-50/30"
          : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl">
            {recommendation.itemType}
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${getPriorityColor(recommendation.priority)}`}
            >
              {getPriorityLabel(recommendation.priority)}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${getStatusColor(recommendation.status)}`}
            >
              {getStatusLabel(recommendation.status)}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          推奨者: {recommendation.stylist.name} •{" "}
          {new Date(recommendation.createdAt).toLocaleDateString("ja-JP")}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">商品説明</h4>
          <p className="text-gray-700">{recommendation.description}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">推奨理由</h4>
          <p className="text-gray-700">{recommendation.reason}</p>
        </div>

        {recommendation.productUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              おすすめ商品
            </h4>
            <Button
              asChild
              variant="default"
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <a
                href={recommendation.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                商品ページを見る
              </a>
            </Button>
          </div>
        )}

        {recommendation.status === "PENDING" && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onMarkAsViewed(recommendation.id)}
              size="sm"
              className="flex-1"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              確認済みにする
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setDialogOpen(true)}
            >
              <XIcon className="h-4 w-4 mr-2" />
              見送る
            </Button>
          </div>
        )}
      </CardContent>

      <DeclineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDecline={handleDecline}
      />
    </Card>
  );
}
