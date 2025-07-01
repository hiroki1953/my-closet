// ダッシュボード用のウェルカムセクション（クライアントコンポーネント）
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeSectionProps {
  userName: string | null | undefined;
}

interface ClothingStats {
  total: number;
  categories: {
    TOPS: number;
    BOTTOMS: number;
    SHOES: number;
    ACCESSORIES: number;
    OUTERWEAR: number;
  };
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  const [stats, setStats] = useState<ClothingStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/user/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.clothing);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="mb-8 space-y-6">
      {/* ウェルカムメッセージ */}
      <div className="text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-accent/10 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-4">
            <span className="text-2xl md:text-3xl">👩‍💼</span>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-1">
              おかえりなさい、{userName || "ユーザー"}さん！
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              うーちゃんがあなたの専属スタイリストです ✨
            </p>
          </div>
        </div>
      </div>

      {/* クローゼット統計 */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
              <div className="col-span-3 md:col-span-2 border-r border-gray-200 pr-4">
                <div className="text-3xl font-bold text-primary">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  総アイテム数
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {stats.categories.TOPS}
                </div>
                <div className="text-xs text-muted-foreground">👕 トップス</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {stats.categories.BOTTOMS}
                </div>
                <div className="text-xs text-muted-foreground">👖 ボトムス</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {stats.categories.OUTERWEAR}
                </div>
                <div className="text-xs text-muted-foreground">🧥 アウター</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {stats.categories.SHOES}
                </div>
                <div className="text-xs text-muted-foreground">👟 シューズ</div>
              </div>
              <div className="space-y-1 md:col-start-6">
                <div className="text-lg font-semibold">
                  {stats.categories.ACCESSORIES}
                </div>
                <div className="text-xs text-muted-foreground">👜 小物</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
