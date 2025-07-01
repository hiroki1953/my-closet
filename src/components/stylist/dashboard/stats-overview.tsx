// スタイリスト統計概要（サーバーコンポーネント）
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsOverviewProps {
  totalUsers: number;
  pendingEvaluations: number;
  totalOutfits: number;
  totalRecommendations: number;
}

export function StatsOverview({
  totalUsers,
  pendingEvaluations,
  totalOutfits,
  totalRecommendations,
}: StatsOverviewProps) {
  const stats = [
    {
      title: "担当ユーザー数",
      value: totalUsers,
      icon: "👥",
      color: "bg-blue-500",
    },
    {
      title: "未評価アイテム",
      value: pendingEvaluations,
      icon: "🏷️",
      color: "bg-yellow-500",
      urgent: pendingEvaluations > 10,
    },
    {
      title: "総コーディネート",
      value: totalOutfits,
      icon: "✨",
      color: "bg-purple-500",
    },
    {
      title: "総購入提案",
      value: totalRecommendations,
      icon: "🛍️",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={stat.urgent ? "border-orange-200" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.urgent && (
                <Badge variant="destructive" className="text-xs">
                  要注意
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}
              >
                <span className="text-white text-sm">{stat.icon}</span>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-primary">
                  {stat.value}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
