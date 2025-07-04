import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutfitVisualDisplay } from "./outfit-visual-display";

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
  return (
    <Link href={`/outfits/${outfit.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm">
        <CardContent className="p-0">
          {/* コーディネート視覚表示 */}
          <div className="p-4 bg-white rounded-t-lg">
            <OutfitVisualDisplay
              items={outfit.clothingItems}
              size="sm"
              showLabels={false}
              className="mx-auto"
            />
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
