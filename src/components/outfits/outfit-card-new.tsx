// 個別のコーディネートカード（サーバーコンポーネント）
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarIcon, HeartIcon } from "lucide-react";
import { OutfitVisualDisplay } from "./outfit-visual-display";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
}

interface Outfit {
  id: string;
  title: string;
  clothingItems: ClothingItem[];
  stylistComment?: string | null;
  tips?: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface OutfitCardProps {
  outfit: Outfit;
  stylistName?: string;
}

export function OutfitCard({
  outfit,
  stylistName = "スタイリスト",
}: OutfitCardProps) {
  const isFromStylist = outfit.createdBy?.role === "STYLIST";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base md:text-lg">
              {outfit.title}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {new Date(outfit.createdAt).toLocaleDateString("ja-JP")} に
              {isFromStylist ? "提案" : "作成"}
            </CardDescription>
          </div>
          {isFromStylist && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 text-xs"
            >
              <StarIcon className="h-3 w-3 mr-1" />
              {stylistName}の提案
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 md:space-y-6">
        {/* コーディネート視覚表示 */}
        <div className="flex justify-center">
          <OutfitVisualDisplay
            items={outfit.clothingItems}
            size="sm"
            showLabels={false}
          />
        </div>

        <Separator />

        {/* スタイリストコメント */}
        {outfit.stylistComment && (
          <div>
            <h4 className="text-sm md:text-base font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="text-base md:text-lg">💬</span>
              {stylistName}からのコメント
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground bg-accent/5 p-2 md:p-3 rounded-lg">
              {outfit.stylistComment}
            </p>
          </div>
        )}

        {/* スタイリングTips */}
        {outfit.tips && (
          <div>
            <h4 className="text-sm md:text-base font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="text-base md:text-lg">💡</span>
              スタイリングTips
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground bg-yellow-50 p-2 md:p-3 rounded-lg border border-yellow-200">
              {outfit.tips}
            </p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2 pt-2 md:pt-4">
          <Button variant="outline" className="flex-1 text-xs md:text-sm">
            <HeartIcon className="h-4 w-4 mr-1" />
            お気に入り
          </Button>
          <Button asChild className="flex-1 text-xs md:text-sm">
            <Link href={`/outfits/${outfit.id}`}>詳細を見る</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
