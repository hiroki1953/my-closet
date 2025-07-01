"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  User,
  ShirtIcon,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  height?: number;
  weight?: number;
  age?: number;
  bodyType?: string;
  personalColor?: string;
  styleGoals?: string;
  lifestyle?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profile?: UserProfile;
}

interface ItemEvaluation {
  id: string;
  evaluation: string;
  comment?: string;
  createdAt: string;
}

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color?: string;
  brand?: string;
  purchaseDate?: string;
  evaluations: ItemEvaluation[];
}

interface EvaluationStats {
  total: number;
  evaluated: number;
  necessary: number;
  unnecessary: number;
  keep: number;
}

interface ClosetData {
  user: User;
  clothingItems: ClothingItem[];
  itemsByCategory: Record<string, ClothingItem[]>;
  evaluationStats: EvaluationStats;
}

export default function StylistUserClosetPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data, setData] = useState<ClosetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [evaluatingItemId, setEvaluatingItemId] = useState<string | null>(null);
  const [evaluationComment, setEvaluationComment] = useState("");

  const fetchClosetData = useCallback(async () => {
    try {
      const response = await fetch(`/api/stylist/users/${userId}/closet`);
      if (!response.ok) throw new Error("Failed to fetch closet data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching closet data:", error);
      toast.error("クローゼットデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchClosetData();
  }, [fetchClosetData]);

  const handleEvaluation = async (itemId: string, evaluation: string) => {
    try {
      const response = await fetch("/api/stylist/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          evaluation: evaluation.toUpperCase(),
          comment: evaluationComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit evaluation");

      toast.success("評価を保存しました");
      setEvaluatingItemId(null);
      setEvaluationComment("");
      fetchClosetData(); // データを再取得
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("評価の保存に失敗しました");
    }
  };

  const getEvaluationBadge = (item: ClothingItem) => {
    if (item.evaluations.length === 0) {
      return (
        <Badge variant="outline">
          <Clock className="w-3 h-3 mr-1" />
          未評価
        </Badge>
      );
    }

    const evaluation = item.evaluations[0].evaluation.toLowerCase();
    switch (evaluation) {
      case "necessary":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            必要
          </Badge>
        );
      case "unnecessary":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            不要
          </Badge>
        );
      case "keep":
        return (
          <Badge variant="secondary">
            <Package className="w-3 h-3 mr-1" />
            キープ
          </Badge>
        );
      default:
        return <Badge variant="outline">未評価</Badge>;
    }
  };

  const categoryNames: Record<string, string> = {
    TOPS: "トップス",
    BOTTOMS: "ボトムス",
    OUTERWEAR: "アウター",
    SHOES: "シューズ",
    ACCESSORIES: "アクセサリー",
    UNDERWEAR: "下着",
    BAGS: "バッグ",
    OTHER: "その他",
  };

  const filteredItems =
    selectedCategory === "all"
      ? data?.clothingItems || []
      : data?.itemsByCategory[selectedCategory.toUpperCase()] || [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">データの取得に失敗しました</p>
          <Button onClick={() => router.back()} className="mt-4">
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="space-y-4 mb-8">
        {/* 上部：戻るボタンとタイトル */}
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link
              href={`/stylist/users/${userId}`}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              {data.user.name}さんのクローゼット
            </h1>
            <p className="text-sm text-gray-600 truncate">{data.user.email}</p>
          </div>
        </div>

        {/* 下部：アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Link
            href={`/stylist/users/${userId}/outfits/create`}
            className="flex-1 sm:flex-none"
          >
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <span className="hidden sm:inline">コーディネート作成</span>
              <span className="sm:hidden">コーデ作成</span>
            </Button>
          </Link>
          <Link
            href={`/stylist/users/${userId}/recommendations`}
            className="flex-1 sm:flex-none"
          >
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              購入提案
            </Button>
          </Link>
        </div>
      </div>

      {/* ユーザープロフィール概要 */}
      {data.user.profile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              プロフィール情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {data.user.profile.height && (
                <div>
                  <span className="text-gray-600">身長:</span>
                  <span className="ml-2 font-medium">
                    {data.user.profile.height}cm
                  </span>
                </div>
              )}
              {data.user.profile.weight && (
                <div>
                  <span className="text-gray-600">体重:</span>
                  <span className="ml-2 font-medium">
                    {data.user.profile.weight}kg
                  </span>
                </div>
              )}
              {data.user.profile.bodyType && (
                <div>
                  <span className="text-gray-600">体型:</span>
                  <span className="ml-2 font-medium">
                    {data.user.profile.bodyType}
                  </span>
                </div>
              )}
              {data.user.profile.personalColor && (
                <div>
                  <span className="text-gray-600">パーソナルカラー:</span>
                  <span className="ml-2 font-medium">
                    {data.user.profile.personalColor}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 評価統計 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {data.evaluationStats.total}
            </div>
            <div className="text-sm text-gray-600">総アイテム数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.evaluationStats.evaluated}
            </div>
            <div className="text-sm text-gray-600">評価済み</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.evaluationStats.necessary}
            </div>
            <div className="text-sm text-gray-600">必要</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {data.evaluationStats.keep}
            </div>
            <div className="text-sm text-gray-600">キープ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {data.evaluationStats.unnecessary}
            </div>
            <div className="text-sm text-gray-600">不要</div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <div className="mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {Object.entries(data.itemsByCategory).map(([category, items]) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {categoryNames[category] || category} ({items.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* アイテム一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={item.imageUrl}
                alt="Clothing item"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">
                  {categoryNames[item.category] || item.category}
                </Badge>
                {getEvaluationBadge(item)}
              </div>

              {item.brand && (
                <p className="text-sm text-gray-600 mb-1">{item.brand}</p>
              )}

              {item.color && (
                <p className="text-sm text-gray-600 mb-2">色: {item.color}</p>
              )}

              {item.evaluations.length > 0 && item.evaluations[0].comment && (
                <p className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded">
                  {item.evaluations[0].comment}
                </p>
              )}

              {evaluatingItemId === item.id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="評価コメント（任意）"
                    value={evaluationComment}
                    onChange={(e) => setEvaluationComment(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleEvaluation(item.id, "necessary")}
                    >
                      必要
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleEvaluation(item.id, "keep")}
                    >
                      キープ
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleEvaluation(item.id, "unnecessary")}
                    >
                      不要
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setEvaluatingItemId(null)}
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setEvaluatingItemId(item.id)}
                >
                  {item.evaluations.length > 0 ? "評価を変更" : "評価する"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ShirtIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {selectedCategory === "all"
              ? "まだアイテムが登録されていません"
              : "選択したカテゴリにアイテムがありません"}
          </p>
        </div>
      )}
    </div>
  );
}
