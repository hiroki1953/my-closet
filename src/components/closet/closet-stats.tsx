// クローゼット統計（サーバーコンポーネント）
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabels } from "./category-tabs";
import type { ClothingItem } from "./items-grid";

interface ClosetStatsProps {
  items: ClothingItem[];
}

export function ClosetStats({ items }: ClosetStatsProps) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 md:mt-8">
      <CardContent className="p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-primary mb-3 md:mb-4">
          クローゼット統計
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 text-center">
          {Object.entries(categoryLabels)
            .slice(1) // "ALL" を除外
            .map(([key, label]) => {
              const count = items.filter(
                (item) => item.category === key
              ).length;
              return (
                <div key={key} className="space-y-1">
                  <div className="text-xl md:text-2xl font-bold text-accent">
                    {count}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {label}
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
