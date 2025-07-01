// 空状態表示（サーバーコンポーネント）
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="text-center py-8 md:py-12">
      <CardContent>
        <div className="w-16 h-16 md:w-24 md:h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <span className="text-2xl md:text-4xl">✨</span>
        </div>
        <CardTitle className="text-lg md:text-xl mb-3 md:mb-4">
          まだコーディネート提案がありません
        </CardTitle>
        <CardDescription className="mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base">
          クローゼットにアイテムを追加すると、うーちゃんがあなたにぴったりのコーディネートを提案します
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <Button asChild>
            <Link href="/closet/add">服を追加する</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/closet">クローゼットを見る</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
