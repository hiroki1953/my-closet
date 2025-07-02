// 個別のアイテムカード（サーバーコンポーネント）
"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  XIcon,
  PauseIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  TrashIcon,
  EyeOffIcon,
  HomeIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ItemEvaluation {
  id: string;
  evaluation: "NECESSARY" | "UNNECESSARY" | "KEEP";
  comment: string;
  createdAt: string;
  stylist: {
    name: string;
  };
}

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DISPOSED" | "ROOMWEAR";
  createdAt: string;
  evaluations?: ItemEvaluation[];
}

interface ClothingItemCardProps {
  item: ClothingItem;
  categoryLabel: string;
  onItemUpdate?: () => void; // アイテム更新後のコールバック
}

export function ClothingItemCard({
  item,
  categoryLabel,
  onItemUpdate,
}: ClothingItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const latestEvaluation = item.evaluations?.[0];

  const handleItemAction = async (
    action: "mark_unnecessary" | "delete" | "mark_active" | "mark_roomwear"
  ) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/clothing-items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const result = await response.json();
      toast.success(result.message);

      // 親コンポーネントに更新を通知
      if (onItemUpdate) {
        onItemUpdate();
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("アイテムの更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  const getEvaluationIcon = (evaluation: string) => {
    switch (evaluation) {
      case "NECESSARY":
        return <CheckIcon className="h-3 w-3" />;
      case "UNNECESSARY":
        return <XIcon className="h-3 w-3" />;
      case "KEEP":
        return <PauseIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case "NECESSARY":
        return "bg-green-100 text-green-800";
      case "UNNECESSARY":
        return "bg-red-100 text-red-800";
      case "KEEP":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEvaluationText = (evaluation: string) => {
    switch (evaluation) {
      case "NECESSARY":
        return "必要";
      case "UNNECESSARY":
        return "不要";
      case "KEEP":
        return "キープ";
      default:
        return "未評価";
    }
  };

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${
        item.status === "INACTIVE"
          ? "opacity-60 bg-gray-50 border-gray-300"
          : item.status === "ROOMWEAR"
          ? "border-blue-200 bg-blue-50 hover:shadow-blue-200"
          : latestEvaluation
          ? (() => {
              switch (latestEvaluation.evaluation) {
                case "NECESSARY":
                  return "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-green-200";
                case "UNNECESSARY":
                  return "border-red-300 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-red-200";
                case "KEEP":
                  return "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-yellow-200";
                default:
                  return "";
              }
            })()
          : "hover:shadow-gray-200"
      }`}
    >
      <CardContent className="p-0">
        <div
          className={`aspect-square relative bg-slate-200 ${
            item.status === "INACTIVE" ? "filter grayscale-50" : ""
          }`}
        >
          {/* ステータスバッジ */}
          {item.status === "ROOMWEAR" && (
            <div className="absolute bottom-2 right-2 z-10">
              <Badge className="text-xs bg-blue-100 text-blue-800">
                <HomeIcon className="h-3 w-3 mr-1" />
                部屋着
              </Badge>
            </div>
          )}

          {/* スタイリスト評価バッジ - 改善版 */}
          {latestEvaluation && (
            <div className="absolute top-2 right-2 z-10">
              <Badge
                className={`text-xs shadow-lg border-2 border-white backdrop-blur-sm transition-all hover:scale-105 ${getEvaluationColor(
                  latestEvaluation.evaluation
                )}`}
              >
                {getEvaluationIcon(latestEvaluation.evaluation)}
                <span className="ml-1 font-semibold">
                  {getEvaluationText(latestEvaluation.evaluation)}
                </span>
              </Badge>
            </div>
          )}

          {/* アクションメニュー */}
          <div className="absolute top-2 left-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  disabled={isUpdating}
                >
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {item.status === "INACTIVE" ? (
                  // 「使わない」状態の場合：使用中に戻すオプションを表示
                  <>
                    <DropdownMenuItem
                      onClick={() => handleItemAction("mark_active")}
                      disabled={isUpdating}
                      className="text-green-600"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      使用中に戻す
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : item.status === "ROOMWEAR" ? (
                  // 「部屋着」状態の場合：使用中に戻すオプションを表示
                  <>
                    <DropdownMenuItem
                      onClick={() => handleItemAction("mark_active")}
                      disabled={isUpdating}
                      className="text-green-600"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      使用中に戻す
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  // 「使用中」状態の場合：もう使わないオプションを表示
                  <>
                    <DropdownMenuItem
                      onClick={() => handleItemAction("mark_unnecessary")}
                      disabled={isUpdating}
                      className="text-orange-600"
                    >
                      <EyeOffIcon className="h-4 w-4 mr-2" />
                      もう使わない
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {/* 不要評価の場合は部屋着オプションを表示 */}
                {latestEvaluation?.evaluation === "UNNECESSARY" &&
                  item.status !== "ROOMWEAR" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleItemAction("mark_roomwear")}
                        disabled={isUpdating}
                        className="text-blue-600"
                      >
                        <HomeIcon className="h-4 w-4 mr-2" />
                        部屋着にする
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                <DropdownMenuItem
                  onClick={() => handleItemAction("delete")}
                  disabled={isUpdating}
                  className="text-red-600"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  削除する
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={`${item.category} - ${item.color}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl md:text-4xl text-slate-400">👕</span>
            </div>
          )}
        </div>
        <div className="p-2 md:p-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <Badge variant="secondary" className="text-xs">
              {categoryLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">{item.color}</span>
          </div>
          {item.brand && (
            <p className="text-xs md:text-sm font-medium text-primary truncate">
              {item.brand}
            </p>
          )}

          {/* スタイリストコメント */}
          {latestEvaluation?.comment && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <div className="flex items-start space-x-1">
                <MessageCircleIcon className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  {latestEvaluation.comment}
                </p>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                - {latestEvaluation.stylist.name}
              </p>
            </div>
          )}

          {/* アクション提案 */}
          {latestEvaluation && (
            <div className="mt-2 p-2 rounded-md border">
              {latestEvaluation.evaluation === "UNNECESSARY" && (
                <div className="text-xs text-red-700 bg-red-50 p-2 rounded">
                  <p className="font-medium mb-1">🗂️ スタイリストからの提案</p>
                  <p className="mb-1">
                    このアイテムは「不要」と評価されています。
                  </p>
                  <p className="font-medium">👕 おすすめの活用方法：</p>
                  <p>• 部屋着・パジャマとして使用</p>
                  <p>• リサイクル・寄付で手放す</p>
                  <p>• 運動・作業着として活用</p>
                </div>
              )}
              {latestEvaluation.evaluation === "NECESSARY" && (
                <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                  <p className="font-medium mb-1">✨ スタイリストからの提案</p>
                  <p>このアイテムは「必要」と評価されています。</p>
                  <p>今後も積極的に活用しましょう！</p>
                </div>
              )}
              {latestEvaluation.evaluation === "KEEP" && (
                <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                  <p className="font-medium mb-1">🤔 スタイリストからの提案</p>
                  <p>このアイテムは「キープ」と評価されています。</p>
                  <p>コーディネート次第で活用できそうです。</p>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            {new Date(item.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
