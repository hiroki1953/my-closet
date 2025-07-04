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
  const [evaluationFilter, setEvaluationFilter] = useState<
    "all" | "evaluated" | "unevaluated"
  >("all");
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
        <div className="space-y-1">
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-800 bg-orange-50 shadow-sm"
          >
            <Clock className="w-3 h-3 mr-1" />
            未評価
          </Badge>
          <div className="text-xs text-orange-600 font-medium">評価待ち</div>
        </div>
      );
    }

    const evaluation = item.evaluations[0].evaluation.toLowerCase();
    const evaluationDate = new Date(
      item.evaluations[0].createdAt
    ).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });

    switch (evaluation) {
      case "necessary":
        return (
          <div className="space-y-1">
            <Badge
              variant="default"
              className="bg-green-600 text-white border-green-600 shadow-md hover:shadow-lg transition-shadow"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              必要
            </Badge>
            <div className="text-xs text-green-700 font-semibold">
              ✅ {evaluationDate}
            </div>
          </div>
        );
      case "unnecessary":
        return (
          <div className="space-y-1">
            <Badge
              variant="destructive"
              className="bg-red-600 text-white shadow-md hover:shadow-lg transition-shadow"
            >
              <XCircle className="w-3 h-3 mr-1" />
              不要
            </Badge>
            <div className="text-xs text-red-700 font-semibold">
              ❌ {evaluationDate}
            </div>
          </div>
        );
      case "keep":
        return (
          <div className="space-y-1">
            <Badge
              variant="secondary"
              className="bg-yellow-500 text-white border-yellow-500 shadow-md hover:shadow-lg transition-shadow"
            >
              <Package className="w-3 h-3 mr-1" />
              キープ
            </Badge>
            <div className="text-xs text-yellow-700 font-semibold">
              🤔 {evaluationDate}
            </div>
          </div>
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

  const filteredItems = (() => {
    const items =
      selectedCategory === "all"
        ? data?.clothingItems || []
        : data?.itemsByCategory[selectedCategory.toUpperCase()] || [];

    // 評価フィルターを適用
    switch (evaluationFilter) {
      case "evaluated":
        return items.filter((item) => item.evaluations.length > 0);
      case "unevaluated":
        return items.filter((item) => item.evaluations.length === 0);
      default:
        return items;
    }
  })();

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
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* ヘッダー */}
      <div className="space-y-4 mb-6 md:mb-8">
        {/* 戻るボタンとタイトル */}
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link
              href={`/stylist/users/${userId}`}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              {data.user.name}さんのクローゼット
            </h1>
            <p className="text-sm text-gray-600 mt-1">{data.user.email}</p>
          </div>
        </div>

        {/* アクションボタン */}
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
              <span className="hidden sm:inline">購入推奨管理</span>
              <span className="sm:hidden">購入推奨</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ユーザープロフィール概要 */}
      {data.user.profile && (
        <Card className="mb-4 md:mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-base md:text-lg">
              <User className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              プロフィール情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm md:text-base">
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

      {/* 評価統計と現在の表示状況 */}
      <div className="space-y-4 mb-4 md:mb-6">
        {/* 評価統計 - 改善版 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <Card className="border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <ShirtIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-gray-900">
                {data.evaluationStats.total}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                総アイテム数
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-blue-600">
                {data.evaluationStats.evaluated}
              </div>
              <div className="text-xs md:text-sm text-blue-700 font-medium">
                評価済み
              </div>
              <div className="text-xs text-blue-600 mt-1">
                進捗:{" "}
                {Math.round(
                  (data.evaluationStats.evaluated /
                    data.evaluationStats.total) *
                    100
                )}
                %
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-all duration-300 col-span-2 lg:col-span-1">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-green-600">
                {data.evaluationStats.necessary}
              </div>
              <div className="text-xs md:text-sm text-green-700 font-medium">
                ✅ 必要
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-yellow-200 bg-yellow-50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-yellow-600">
                {data.evaluationStats.keep}
              </div>
              <div className="text-xs md:text-sm text-yellow-700 font-medium">
                🤔 キープ
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-200 bg-red-50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-red-600">
                {data.evaluationStats.unnecessary}
              </div>
              <div className="text-xs md:text-sm text-red-700 font-medium">
                ❌ 不要
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 現在の表示状況 - 改善版 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="text-sm font-semibold text-blue-900">
                📊 表示中:{" "}
                <span className="text-base md:text-lg font-bold text-blue-700">
                  {filteredItems.length}
                </span>
                件のアイテム
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {evaluationFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-white border-blue-300 text-blue-700 font-medium text-xs"
                  >
                    {evaluationFilter === "evaluated"
                      ? "✅ 評価済みのみ"
                      : "⏰ 未評価のみ"}
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-white border-blue-300 text-blue-700 font-medium text-xs"
                  >
                    {categoryNames[selectedCategory.toUpperCase()] ||
                      selectedCategory}
                  </Badge>
                )}
              </div>
            </div>
            {(evaluationFilter !== "all" || selectedCategory !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEvaluationFilter("all");
                  setSelectedCategory("all");
                }}
                className="text-blue-700 hover:text-blue-900 w-full sm:w-auto"
              >
                フィルターをクリア
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* フィルター - 改善版 */}
      <div className="mb-4 md:mb-6 bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <label className="text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Package className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              カテゴリフィルター
            </label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full border-gray-300 hover:border-blue-400 transition-colors">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">
                  📂 すべてのカテゴリ
                </SelectItem>
                {Object.entries(data.itemsByCategory).map(
                  ([category, items]) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {categoryNames[category] || category} ({items.length}件)
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              評価状況フィルター
            </label>
            <Select
              value={evaluationFilter}
              onValueChange={(value) =>
                setEvaluationFilter(
                  value as "all" | "evaluated" | "unevaluated"
                )
              }
            >
              <SelectTrigger className="w-full sm:w-56 border-gray-300 hover:border-blue-400 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">
                  📋 すべての状況
                </SelectItem>
                <SelectItem value="evaluated">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">評価済み</span>
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700"
                    >
                      {data.evaluationStats.evaluated}件
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="unevaluated">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="font-medium">未評価</span>
                    <Badge
                      variant="outline"
                      className="ml-2 bg-orange-50 text-orange-700"
                    >
                      {data.evaluationStats.total -
                        data.evaluationStats.evaluated}
                      件
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* クイックフィルターボタン */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant={evaluationFilter === "unevaluated" ? "default" : "outline"}
            size="sm"
            onClick={() => setEvaluationFilter("unevaluated")}
            className={
              evaluationFilter === "unevaluated"
                ? "bg-orange-600 hover:bg-orange-700"
                : "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
            }
          >
            <Clock className="w-4 h-4 mr-1" />
            未評価を確認
          </Button>
          <Button
            variant={evaluationFilter === "evaluated" ? "default" : "outline"}
            size="sm"
            onClick={() => setEvaluationFilter("evaluated")}
            className={
              evaluationFilter === "evaluated"
                ? "bg-green-600 hover:bg-green-700"
                : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
            }
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            評価済みを確認
          </Button>
          {(evaluationFilter !== "all" || selectedCategory !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEvaluationFilter("all");
                setSelectedCategory("all");
              }}
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-50"
            >
              🔄 フィルターをクリア
            </Button>
          )}
        </div>
      </div>

      {/* アイテム一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isEvaluated = item.evaluations.length > 0;
          const evaluation = isEvaluated
            ? item.evaluations[0].evaluation.toLowerCase()
            : null;

          // 評価に基づいてカードのスタイルを決定
          const getCardStyle = () => {
            if (!isEvaluated) {
              return "border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-lg hover:border-orange-400 transition-all duration-300";
            }

            switch (evaluation) {
              case "necessary":
                return "border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-100 hover:shadow-xl hover:shadow-green-200 hover:border-green-400 transition-all duration-300";
              case "unnecessary":
                return "border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg shadow-red-100 hover:shadow-xl hover:shadow-red-200 hover:border-red-400 transition-all duration-300";
              case "keep":
                return "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg shadow-yellow-100 hover:shadow-xl hover:shadow-yellow-200 hover:border-yellow-400 transition-all duration-300";
              default:
                return "hover:shadow-lg transition-all duration-300";
            }
          };

          return (
            <Card
              key={item.id}
              className={`overflow-hidden transition-all duration-200 ${getCardStyle()}`}
            >
              <div className="aspect-square relative">
                {/* 評価済みアイテムには大きく目立つオーバーレイアイコン */}
                {isEvaluated && (
                  <div className="absolute top-3 left-3 z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white backdrop-blur-sm transition-transform hover:scale-110 ${
                        evaluation === "necessary"
                          ? "bg-green-600 shadow-green-300"
                          : evaluation === "unnecessary"
                          ? "bg-red-600 shadow-red-300"
                          : evaluation === "keep"
                          ? "bg-yellow-500 shadow-yellow-300"
                          : "bg-gray-600"
                      }`}
                    >
                      {evaluation === "necessary" && (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                      {evaluation === "unnecessary" && (
                        <XCircle className="w-6 h-6" />
                      )}
                      {evaluation === "keep" && <Package className="w-6 h-6" />}
                    </div>
                  </div>
                )}

                {/* 未評価アイテムには注意を促すアイコン */}
                {!isEvaluated && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500 text-white shadow-lg border-2 border-white animate-pulse">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                )}
                <Image
                  src={item.imageUrl}
                  alt="Clothing item"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">
                    {categoryNames[item.category] || item.category}
                  </Badge>
                  <div className="text-right">{getEvaluationBadge(item)}</div>
                </div>

                {item.brand && (
                  <p className="text-sm text-gray-600 mb-1">{item.brand}</p>
                )}

                {item.color && (
                  <p className="text-sm text-gray-600 mb-2">色: {item.color}</p>
                )}

                {/* 評価コメント表示の大幅改善 */}
                {item.evaluations.length > 0 && item.evaluations[0].comment && (
                  <div
                    className={`text-sm mb-4 p-4 rounded-xl border-2 shadow-sm ${
                      evaluation === "necessary"
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                        : evaluation === "unnecessary"
                        ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-300"
                        : evaluation === "keep"
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
                        : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          evaluation === "necessary"
                            ? "bg-green-500"
                            : evaluation === "unnecessary"
                            ? "bg-red-500"
                            : evaluation === "keep"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                      >
                        <span className="text-white text-xs">💬</span>
                      </div>
                      <div
                        className={`font-semibold text-xs ${
                          evaluation === "necessary"
                            ? "text-green-800"
                            : evaluation === "unnecessary"
                            ? "text-red-800"
                            : evaluation === "keep"
                            ? "text-yellow-800"
                            : "text-gray-800"
                        }`}
                      >
                        スタイリストからのコメント
                      </div>
                    </div>
                    <p
                      className={`leading-relaxed font-medium ${
                        evaluation === "necessary"
                          ? "text-green-900"
                          : evaluation === "unnecessary"
                          ? "text-red-900"
                          : evaluation === "keep"
                          ? "text-yellow-900"
                          : "text-gray-900"
                      }`}
                    >
                      &ldquo;{item.evaluations[0].comment}&rdquo;
                    </p>
                    <div
                      className={`text-xs mt-2 ${
                        evaluation === "necessary"
                          ? "text-green-600"
                          : evaluation === "unnecessary"
                          ? "text-red-600"
                          : evaluation === "keep"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      評価日:{" "}
                      {new Date(
                        item.evaluations[0].createdAt
                      ).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
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
                    variant={isEvaluated ? "outline" : "default"}
                    className={`w-full ${
                      isEvaluated
                        ? "border-2 opacity-75 hover:opacity-100"
                        : "bg-gray-900 hover:bg-black text-white shadow-md"
                    }`}
                    onClick={() => setEvaluatingItemId(item.id)}
                  >
                    {item.evaluations.length > 0 ? "評価を変更" : "評価する"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-lg mx-auto">
            {evaluationFilter === "evaluated" ? (
              <div className="bg-green-50 rounded-lg p-8 border-2 border-green-200">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-green-900 mb-3">
                  ✅ 評価済みアイテムがありません
                </h3>
                <p className="text-green-700 mb-6 text-lg">
                  {selectedCategory === "all"
                    ? "まだ評価されたアイテムがありません。評価を開始しましょう！"
                    : `${
                        categoryNames[selectedCategory.toUpperCase()]
                      }カテゴリで評価済みのアイテムがありません。`}
                </p>
                <div className="space-y-3">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => setEvaluationFilter("unevaluated")}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    未評価アイテムを評価する
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEvaluationFilter("all")}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    すべてのアイテムを見る
                  </Button>
                </div>
              </div>
            ) : evaluationFilter === "unevaluated" ? (
              <div className="bg-orange-50 rounded-lg p-8 border-2 border-orange-200">
                <div className="relative">
                  <Clock className="w-16 h-16 text-orange-500 mx-auto mb-6" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-orange-900 mb-3">
                  🎉 すべて評価完了！
                </h3>
                <p className="text-orange-700 mb-6 text-lg">
                  {selectedCategory === "all"
                    ? "素晴らしい！すべてのアイテムが評価済みです。"
                    : `${
                        categoryNames[selectedCategory.toUpperCase()]
                      }カテゴリのアイテムはすべて評価済みです。`}
                </p>
                <div className="space-y-3">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => setEvaluationFilter("evaluated")}
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    評価結果を確認する
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEvaluationFilter("all")}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    すべてのアイテムを見る
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 border-2 border-gray-200">
                <ShirtIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  👔 アイテムがありません
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {selectedCategory === "all"
                    ? "まだアイテムが登録されていません。ユーザーにアイテム登録を促しましょう。"
                    : `${
                        categoryNames[selectedCategory.toUpperCase()]
                      }カテゴリにアイテムがありません。`}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory("all")}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  すべてのカテゴリを見る
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
