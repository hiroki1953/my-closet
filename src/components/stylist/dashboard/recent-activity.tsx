// 最近のアクティビティ（サーバーコンポーネント）
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type: "evaluation" | "outfit" | "recommendation";
  description: string;
  userName: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "evaluation":
        return "🏷️";
      case "outfit":
        return "✨";
      case "recommendation":
        return "🛍️";
      default:
        return "📝";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "evaluation":
        return "bg-yellow-100 text-yellow-800";
      case "outfit":
        return "bg-purple-100 text-purple-800";
      case "recommendation":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "1時間以内";
    if (diffInHours < 24) return `${diffInHours}時間前`;
    return `${Math.floor(diffInHours / 24)}日前`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">最近のアクティビティ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              最近のアクティビティがありません
            </p>
          ) : (
            activities.slice(0, 8).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge
                      className={`text-xs ${getActivityColor(activity.type)}`}
                    >
                      {activity.type === "evaluation" && "評価"}
                      {activity.type === "outfit" && "コーデ"}
                      {activity.type === "recommendation" && "提案"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-primary">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    ユーザー: {activity.userName}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
