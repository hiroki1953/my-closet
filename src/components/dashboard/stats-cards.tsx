// 統計カード（サーバーコンポーネント）
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  itemsCount: number;
  outfitsCount: number;
  stylistName?: string;
}

export function StatsCards({
  itemsCount,
  outfitsCount,
  stylistName = "スタイリスト",
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* アイテム数カード */}
      <Link href="/closet">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">クローゼット</CardTitle>
            <span className="text-2xl">👔</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemsCount}</div>
            <p className="text-xs text-muted-foreground">
              {itemsCount > 0 ? "アイテム" : "服を追加してください"}
            </p>
            <p className="text-xs text-accent mt-1">
              クリックしてクローゼットを見る →
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* コーディネート数カード */}
      <Link href="/outfits">
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
                ? `${stylistName}からの提案数`
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
