"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  ShirtIcon,
  SparklesIcon,
  ShoppingBagIcon,
  ClockIcon,
  UserIcon,
} from "lucide-react";

interface UserStatus {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  height?: number;
  age?: number;
  itemsCount: number;
  outfitsCount: number;
  unevaluatedItems: number;
  pendingRecommendations: number;
  completedRecommendations: number;
  lastActivity: string;
  lastOutfitDate?: string;
  daysSinceLastOutfit?: number;
  priorityLevel: "high" | "medium" | "low";
  priorityScore: number;
  needsAttention: boolean;
}

interface UserStatusGridProps {
  users: UserStatus[];
}

export function UserStatusGrid({ users }: UserStatusGridProps) {
  const getPriorityColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getPriorityLabel = (level: string) => {
    switch (level) {
      case "high":
        return "緊急";
      case "medium":
        return "注意";
      default:
        return "良好";
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1日前";
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  // 優先度順にソート
  const sortedUsers = [...users].sort((a, b) => {
    if (a.priorityLevel === b.priorityLevel) {
      return b.priorityScore - a.priorityScore;
    }
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priorityLevel] - priorityOrder[a.priorityLevel];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          ユーザー状況一覧
        </h2>
        <div className="text-sm text-gray-500">
          {users.length}名のユーザーを管理中
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedUsers.map((user) => (
          <Card
            key={user.id}
            className={`hover:shadow-lg transition-shadow duration-200 ${
              user.needsAttention ? "border-orange-200 bg-orange-50/30" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Badge
                  className={`${getPriorityColor(user.priorityLevel)} border`}
                  variant="outline"
                >
                  {getPriorityLabel(user.priorityLevel)}
                </Badge>
              </div>

              {/* 基本情報 */}
              {(user.age || user.height) && (
                <div className="text-sm text-gray-500 pt-2">
                  {user.age && <span>{user.age}歳</span>}
                  {user.age && user.height && <span> • </span>}
                  {user.height && <span>{user.height}cm</span>}
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 統計情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ShirtIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-xl font-bold text-gray-900">
                      {user.itemsCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">アイテム</p>
                  {user.unevaluatedItems > 0 && (
                    <p className="text-xs text-red-600 font-medium">
                      未評価: {user.unevaluatedItems}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <SparklesIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-xl font-bold text-gray-900">
                      {user.outfitsCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">コーディネート</p>
                  {user.daysSinceLastOutfit && user.daysSinceLastOutfit > 7 && (
                    <p className="text-xs text-orange-600 font-medium">
                      {user.daysSinceLastOutfit}日前
                    </p>
                  )}
                </div>
              </div>

              {/* 購入提案情報 */}
              {(user.pendingRecommendations > 0 ||
                user.completedRecommendations > 0) && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <ShoppingBagIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">購入提案</span>
                  </div>
                  <div className="flex space-x-2">
                    {user.pendingRecommendations > 0 && (
                      <Badge variant="outline" className="text-xs">
                        未対応: {user.pendingRecommendations}
                      </Badge>
                    )}
                    {user.completedRecommendations > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600"
                      >
                        完了: {user.completedRecommendations}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* 最終活動日 */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>最終活動</span>
                </div>
                <span>{formatLastActivity(user.lastActivity)}</span>
              </div>

              {/* アクションボタン */}
              <div className="pt-2 space-y-2">
                {/* メインアクション */}
                <div className="grid grid-cols-3 gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/stylist/users/${user.id}`}>ユーザー詳細</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/stylist/users/${user.id}/closet`}>
                      クローゼット
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/stylist/users/${user.id}/outfits`}>
                      コーデ一覧
                    </Link>
                  </Button>
                </div>

                {/* 未評価アイテムがある場合の追加アクション */}
                {user.unevaluatedItems > 0 && (
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    <Link href={`/stylist/users/${user.id}/closet`}>
                      未評価アイテム {user.unevaluatedItems}件を確認
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              担当ユーザーがいません
            </h3>
            <p className="text-gray-600">
              新しいユーザーが登録されると、ここに表示されます。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
