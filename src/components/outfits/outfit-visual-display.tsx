"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
  description?: string;
}

interface OutfitVisualDisplayProps {
  items: ClothingItem[];
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}

export function OutfitVisualDisplay({
  items,
  size = "md",
  showLabels = true,
  className = "",
}: OutfitVisualDisplayProps) {
  // カテゴリ別にアイテムをグループ化
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category.toUpperCase();
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  // サイズに応じたクラス
  const sizeClasses = {
    sm: {
      container: "w-full max-w-[200px]",
      itemSize: "w-12 h-12",
      grid: "gap-1",
      text: "text-xs",
    },
    md: {
      container: "w-full max-w-[280px]",
      itemSize: "w-16 h-16",
      grid: "gap-2",
      text: "text-sm",
    },
    lg: {
      container: "w-full max-w-[350px]",
      itemSize: "w-20 h-20",
      grid: "gap-3",
      text: "text-base",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`${currentSize.container} ${className}`}>
      <Card className="overflow-hidden bg-gradient-to-b from-gray-50 to-white border-gray-200">
        <CardContent className="p-4">
          {/* 人型シルエットスタイルの配置 */}
          <div className="relative flex flex-col items-center space-y-3">
            {/* 上半身エリア (アウター + トップス) */}
            <div className="flex flex-col items-center space-y-2">
              {/* アウター */}
              {itemsByCategory.OUTERWEAR && (
                <div className="flex flex-col items-center">
                  {showLabels && (
                    <div className="text-xs text-gray-500 mb-1 flex items-center">
                      <span className="mr-1">🧥</span>
                      アウター
                    </div>
                  )}
                  <div
                    className={`flex flex-wrap justify-center ${currentSize.grid}`}
                  >
                    {itemsByCategory.OUTERWEAR.map((item) => (
                      <div
                        key={item.id}
                        className={`${currentSize.itemSize} relative rounded-lg overflow-hidden border-2 border-purple-200 bg-purple-50`}
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.description || item.category}
                          fill
                          className="object-cover"
                        />
                        {showLabels && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                            {item.color}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* トップス */}
              {itemsByCategory.TOPS && (
                <div className="flex flex-col items-center">
                  {showLabels && (
                    <div className="text-xs text-gray-500 mb-1 flex items-center">
                      <span className="mr-1">👕</span>
                      トップス
                    </div>
                  )}
                  <div
                    className={`flex flex-wrap justify-center ${currentSize.grid}`}
                  >
                    {itemsByCategory.TOPS.map((item) => (
                      <div
                        key={item.id}
                        className={`${currentSize.itemSize} relative rounded-lg overflow-hidden border-2 border-blue-200 bg-blue-50`}
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.description || item.category}
                          fill
                          className="object-cover"
                        />
                        {showLabels && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                            {item.color}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 体の中央ライン */}
            <div className="w-px h-4 bg-gray-300"></div>

            {/* 下半身エリア (ボトムス + シューズ) */}
            <div className="flex flex-col items-center space-y-2">
              {/* ボトムス */}
              {itemsByCategory.BOTTOMS && (
                <div className="flex flex-col items-center">
                  {showLabels && (
                    <div className="text-xs text-gray-500 mb-1 flex items-center">
                      <span className="mr-1">👖</span>
                      ボトムス
                    </div>
                  )}
                  <div
                    className={`flex flex-wrap justify-center ${currentSize.grid}`}
                  >
                    {itemsByCategory.BOTTOMS.map((item) => (
                      <div
                        key={item.id}
                        className={`${currentSize.itemSize} relative rounded-lg overflow-hidden border-2 border-green-200 bg-green-50`}
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.description || item.category}
                          fill
                          className="object-cover"
                        />
                        {showLabels && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                            {item.color}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* シューズ */}
              {itemsByCategory.SHOES && (
                <div className="flex flex-col items-center">
                  {showLabels && (
                    <div className="text-xs text-gray-500 mb-1 flex items-center">
                      <span className="mr-1">👞</span>
                      シューズ
                    </div>
                  )}
                  <div
                    className={`flex flex-wrap justify-center ${currentSize.grid}`}
                  >
                    {itemsByCategory.SHOES.map((item) => (
                      <div
                        key={item.id}
                        className={`${currentSize.itemSize} relative rounded-lg overflow-hidden border-2 border-orange-200 bg-orange-50`}
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.description || item.category}
                          fill
                          className="object-cover"
                        />
                        {showLabels && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                            {item.color}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* アクセサリー */}
            {itemsByCategory.ACCESSORIES && (
              <div className="flex flex-col items-center mt-3 pt-3 border-t border-gray-200">
                {showLabels && (
                  <div className="text-xs text-gray-500 mb-1 flex items-center">
                    <span className="mr-1">👜</span>
                    アクセサリー
                  </div>
                )}
                <div
                  className={`flex flex-wrap justify-center ${currentSize.grid}`}
                >
                  {itemsByCategory.ACCESSORIES.map((item) => (
                    <div
                      key={item.id}
                      className={`${currentSize.itemSize} relative rounded-lg overflow-hidden border-2 border-pink-200 bg-pink-50`}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.description || item.category}
                        fill
                        className="object-cover"
                      />
                      {showLabels && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                          {item.color}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* アイテム数の表示 */}
            <div className="mt-2 text-center">
              <Badge
                variant="secondary"
                className={`${currentSize.text} bg-gray-100`}
              >
                {items.length}アイテム
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
