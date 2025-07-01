// 空状態表示（サーバーコンポーネント）
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  selectedCategory: string;
  categoryLabel: string;
}

export function EmptyState({
  selectedCategory,
  categoryLabel,
}: EmptyStateProps) {
  return (
    <div className="col-span-full text-center py-8 md:py-12">
      <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl md:text-4xl text-slate-400">👕</span>
      </div>
      <h3 className="text-base md:text-lg font-semibold text-primary mb-2">
        {selectedCategory === "ALL"
          ? "アイテムがありません"
          : `${categoryLabel}がありません`}
      </h3>
      <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
        最初のアイテムを追加して、コーディネートを始めましょう！
      </p>
      <Button asChild size="sm">
        <Link href="/closet/add">服を追加する</Link>
      </Button>
    </div>
  );
}
