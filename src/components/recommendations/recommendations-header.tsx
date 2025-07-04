import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ShoppingBagIcon } from "lucide-react";
import Link from "next/link";

interface RecommendationsHeaderProps {
  stylistName?: string;
}

export function RecommendationsHeader({
  stylistName = "スタイリスト",
}: RecommendationsHeaderProps) {
  return (
    <div className="space-y-3">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/dashboard">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          ダッシュボードに戻る
        </Link>
      </Button>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
        <ShoppingBagIcon className="h-6 w-6 md:h-8 md:w-8" />
        購入推奨
      </h1>
      <p className="text-gray-600">
        {stylistName}からのアイテム購入推奨を確認・管理できます
      </p>
    </div>
  );
}
