// 最近追加したアイテム表示（サーバーコンポーネント）
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string | null;
}

interface RecentItemsSectionProps {
  items: ClothingItem[];
}

export function RecentItemsSection({ items }: RecentItemsSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 md:mb-12">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          最近追加したアイテム
          <Button variant="ghost" size="sm" asChild>
            <Link href="/closet">すべて見る</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="text-center">
              <div className="w-full aspect-square bg-slate-200 rounded-lg mb-2 flex items-center justify-center">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={`${item.category}`}
                    width={80}
                    height={80}
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-slate-400">📷</span>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
