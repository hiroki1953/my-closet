"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShoppingBagIcon, AlertCircleIcon } from "lucide-react";
import { useStylist } from "@/lib/hooks/use-stylist";

interface PurchaseRecommendation {
  id: string;
  itemType: string;
  description: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED";
  createdAt: string;
}

export function PurchaseRecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<
    PurchaseRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { getStylistName } = useStylist();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          "/api/user/recommendations?status=PENDING"
        );
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5" />
            購入推奨
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null; // 推奨がない場合は表示しない
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
          購入推奨
          <Badge variant="secondary" className="ml-auto">
            {recommendations.length}件
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-white rounded-lg border">
          <AlertCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {getStylistName()}からの購入推奨があります
            </p>
            <p className="text-xs text-gray-600">
              あなたのスタイルアップのためのアイテムを提案しています
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {recommendations.slice(0, 2).map((recommendation) => (
            <div
              key={recommendation.id}
              className="p-3 bg-white rounded-lg border space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {recommendation.itemType}
                </h4>
                <Badge
                  variant="outline"
                  className={`text-xs ${getPriorityColor(
                    recommendation.priority
                  )}`}
                >
                  {getPriorityLabel(recommendation.priority)}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {recommendation.description}
              </p>
            </div>
          ))}
        </div>

        {recommendations.length > 2 && (
          <p className="text-xs text-gray-500 text-center">
            他{recommendations.length - 2}件の推奨があります
          </p>
        )}

        <Button asChild className="w-full" size="sm">
          <Link href="/recommendations">推奨一覧を確認する</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
