// ユーザー一覧表示（サーバーコンポーネント）
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  itemsCount: number;
  lastActivity: string;
  evaluationStatus: "pending" | "completed" | "in_progress";
}

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="destructive">評価待ち</Badge>;
      case "in_progress":
        return <Badge variant="secondary">評価中</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">完了</Badge>;
      default:
        return <Badge variant="outline">未設定</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">担当ユーザー</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/stylist/users">すべて見る</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              担当ユーザーがいません
            </p>
          ) : (
            users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent text-white text-sm">
                      {user.name?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.itemsCount}点のアイテム
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(user.evaluationStatus)}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/stylist/users/${user.id}`}>詳細</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
