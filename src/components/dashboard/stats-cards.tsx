// 統計カード（サーバーコンポーネント）
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  clothingItemsCount: number;
  outfitsCount: number;
}

export function StatsCards({
  clothingItemsCount,
  outfitsCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12 max-w-2xl mx-auto">
      <Link href="/closet" className="block">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              登録アイテム数
            </CardTitle>
            <span className="text-2xl">👕</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clothingItemsCount}</div>
            <p className="text-xs text-muted-foreground">
              {clothingItemsCount > 0
                ? "クローゼットに登録されたアイテム数"
                : "まだアイテムが登録されていません"}
            </p>
            <p className="text-xs text-accent mt-1">
              クリックしてクローゼットを見る →
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/outfits" className="block">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              コーディネート
            </CardTitle>
            <span className="text-2xl">✨</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outfitsCount}</div>
            <p className="text-xs text-muted-foreground">
              {outfitsCount > 0
                ? "うーちゃんからの提案数"
                : "まもなく提案が届きます"}
            </p>
            <p className="text-xs text-accent mt-1">
              クリックしてコーディネートを見る →
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
