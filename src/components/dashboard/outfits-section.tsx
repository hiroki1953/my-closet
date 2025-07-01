// コーディネート提案セクション（サーバーコンポーネント）
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Outfit {
  id: string;
  title: string;
  stylistComment?: string | null;
  createdAt: Date;
}

interface OutfitsSectionProps {
  outfits: Outfit[];
}

export function OutfitsSection({ outfits }: OutfitsSectionProps) {
  if (outfits.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🎨 最新のコーディネート提案
            <Button variant="ghost" size="sm" asChild>
              <Link href="/outfits">すべて見る</Link>
            </Button>
          </CardTitle>
          <CardDescription>
            うーちゃんがあなたのために厳選したコーディネート
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {outfits.map((outfit) => (
              <Card
                key={outfit.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-accent/5 to-accent/10 relative p-4">
                  {/* コーディネート画像エリア */}
                  <div className="grid grid-cols-2 gap-2 h-full">
                    <div className="space-y-2">
                      <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-lg">👕</span>
                      </div>
                      <div className="aspect-square bg-purple-100 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-lg">👖</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="aspect-square bg-orange-100 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-lg">👞</span>
                      </div>
                      <div className="aspect-square bg-green-100 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-lg">🎒</span>
                      </div>
                    </div>
                  </div>

                  {/* バッジ */}
                  <Badge className="absolute top-2 right-2 bg-accent text-xs">
                    NEW
                  </Badge>
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      晴れ
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      20℃
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-primary line-clamp-1">
                      {outfit.title}
                    </h4>
                    <Badge variant="outline" className="text-xs ml-2">
                      提案
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {outfit.stylistComment ||
                      "うーちゃんからの特別な提案です✨"}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(outfit.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6 px-2"
                    >
                      詳細を見る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // データがない場合の表示
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🎨 コーディネート提案
          <span className="text-sm font-normal text-muted-foreground">
            準備中
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">👩‍💼</span>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            うーちゃんがコーディネートを準備中
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            アイテムを追加すると、あなただけの特別なコーディネートを提案します！
          </p>
          <Button asChild>
            <Link href="/closet/add">アイテムを追加する</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
