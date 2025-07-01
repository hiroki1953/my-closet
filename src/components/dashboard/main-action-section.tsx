// メインアクションボタン（サーバーコンポーネント）
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MainActionSection() {
  return (
    <div className="space-y-6">
      {/* メインアクション */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            🎯 今日のアクション
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild size="lg" className="w-full h-16 text-lg">
            <Link href="/closet/add">
              <span className="text-2xl mr-3">📱</span>
              服を追加する
            </Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            写真を撮って服を登録しましょう
          </p>
        </CardContent>
      </Card>

      {/* クローゼット管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">👕 クローゼット管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/closet">
                <span className="text-2xl mb-2">🗂️</span>
                <span>アイテム一覧</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/outfits">
                <span className="text-2xl mb-2">✨</span>
                <span>コーディネート</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col sm:col-span-2 lg:col-span-1"
            >
              <Link href="/profile">
                <span className="text-2xl mb-2">👤</span>
                <span>プロフィール</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
