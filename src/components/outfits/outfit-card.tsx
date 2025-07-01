import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
}

interface OutfitWithDetails {
  id: string;
  title: string;
  stylistComment?: string | null;
  tips?: string | null;
  stylingAdvice?: string | null;
  createdAt: string;
  clothingItems: ClothingItem[];
  createdBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface OutfitCardProps {
  outfit: OutfitWithDetails;
  showStylistInfo?: boolean;
}

export function OutfitCard({
  outfit,
  showStylistInfo = false,
}: OutfitCardProps) {
  const displayItems = outfit.clothingItems.slice(0, 4);
  const hasMoreItems = outfit.clothingItems.length > 4;

  return (
    <Link href={`/outfits/${outfit.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm">
        <CardContent className="p-0">
          {/* 画像グリッド */}
          <div className="aspect-square relative bg-white rounded-t-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-1 p-2 h-full">
              {displayItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative rounded-md overflow-hidden bg-gray-100 ${
                    index === 3 && hasMoreItems ? "relative" : ""
                  }`}
                >
                  <Image
                    src={item.imageUrl}
                    alt={`${item.category} - ${item.color}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {index === 3 && hasMoreItems && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        +{outfit.clothingItems.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {outfit.title}
              </h3>
              {outfit.stylistComment && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {outfit.stylistComment}
                </p>
              )}
            </div>

            {/* スタイリスト情報 */}
            {showStylistInfo && outfit.createdBy && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {outfit.createdBy.name}
                </Badge>
              </div>
            )}

            {/* アイテム数と日付 */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{outfit.clothingItems.length}アイテム</span>
              <span>
                {new Date(outfit.createdAt).toLocaleDateString("ja-JP", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
