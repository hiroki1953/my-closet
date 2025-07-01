"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LoadingState } from "@/components/stylist/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeftIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface PurchaseRecommendation {
  id: string;
  itemType: string;
  description: string;
  reason: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function UserRecommendationsPage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<
    PurchaseRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState({
    itemType: "",
    description: "",
    reason: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (status === "authenticated" && session?.user?.role !== "STYLIST") {
      redirect("/dashboard");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, recommendationsResponse] = await Promise.all([
          fetch(`/api/stylist/users/${userId}`),
          fetch(`/api/stylist/recommendations?userId=${userId}`),
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          setRecommendations(recommendationsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "STYLIST" && userId) {
      fetchData();
    }
  }, [session, userId]);

  const handleCreateRecommendation = async () => {
    if (
      !newRecommendation.itemType.trim() ||
      !newRecommendation.description.trim()
    ) {
      alert("アイテムタイプと説明を入力してください");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/stylist/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...newRecommendation,
        }),
      });

      if (response.ok) {
        const newRec = await response.json();
        setRecommendations((prev) => [newRec, ...prev]);
        setNewRecommendation({
          itemType: "",
          description: "",
          reason: "",
          priority: "MEDIUM",
        });
        setShowCreateForm(false);
        alert("購入推奨を作成しました！");
      } else {
        alert("購入推奨の作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create recommendation:", error);
      alert("購入推奨の作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  const updateRecommendationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/stylist/recommendations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        const updatedRec = await response.json();
        setRecommendations((prev) =>
          prev.map((rec) =>
            rec.id === id ? { ...rec, status: updatedRec.status } : rec
          )
        );
      }
    } catch (error) {
      console.error("Failed to update recommendation status:", error);
    }
  };

  if (status === "loading" || loading) {
    return <LoadingState />;
  }

  if (!session || session.user?.role !== "STYLIST" || !user) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "高";
      case "MEDIUM":
        return "中";
      case "LOW":
        return "低";
      default:
        return "中";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "VIEWED":
        return "secondary";
      case "PURCHASED":
        return "default";
      case "DECLINED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "提案中";
      case "VIEWED":
        return "確認済み";
      case "PURCHASED":
        return "購入済み";
      case "DECLINED":
        return "却下";
      default:
        return "提案中";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage="dashboard" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link href={`/stylist/users/${userId}`}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  戻る
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">
                {user.name}さんの購入推奨
              </h1>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>新しい推奨を作成</span>
            </Button>
          </div>

          {/* 新規作成フォーム */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  新しい購入推奨
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemType">アイテムタイプ *</Label>
                    <Input
                      id="itemType"
                      placeholder="例: ビジネスシャツ、カジュアルパンツ"
                      value={newRecommendation.itemType}
                      onChange={(e) =>
                        setNewRecommendation((prev) => ({
                          ...prev,
                          itemType: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">優先度</Label>
                    <Select
                      value={newRecommendation.priority}
                      onValueChange={(value) =>
                        setNewRecommendation((prev) => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">高</SelectItem>
                        <SelectItem value="MEDIUM">中</SelectItem>
                        <SelectItem value="LOW">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">説明 *</Label>
                  <Textarea
                    id="description"
                    placeholder="どのようなアイテムを推奨するか詳しく説明"
                    value={newRecommendation.description}
                    onChange={(e) =>
                      setNewRecommendation((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="reason">推奨理由</Label>
                  <Textarea
                    id="reason"
                    placeholder="なぜこのアイテムが必要なのか理由を説明"
                    value={newRecommendation.reason}
                    onChange={(e) =>
                      setNewRecommendation((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateRecommendation}
                    disabled={
                      creating ||
                      !newRecommendation.itemType.trim() ||
                      !newRecommendation.description.trim()
                    }
                  >
                    {creating ? "作成中..." : "推奨を作成"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 購入推奨一覧 */}
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingBagIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    購入推奨がありません
                  </h3>
                  <p className="text-slate-600">
                    まだ購入推奨を作成していません。
                  </p>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rec.itemType}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            getPriorityColor(rec.priority) as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                          }
                        >
                          優先度: {getPriorityText(rec.priority)}
                        </Badge>
                        <Badge
                          variant={
                            getStatusColor(rec.status) as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                          }
                        >
                          {getStatusText(rec.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">説明</h4>
                      <p className="text-slate-700">{rec.description}</p>
                    </div>

                    {rec.reason && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">
                          推奨理由
                        </h4>
                        <p className="text-slate-700">{rec.reason}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        作成日:{" "}
                        {new Date(rec.createdAt).toLocaleDateString("ja-JP")}
                      </p>

                      {rec.status === "PENDING" && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateRecommendationStatus(rec.id, "VIEWED")
                            }
                          >
                            確認済みにする
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateRecommendationStatus(rec.id, "DECLINED")
                            }
                          >
                            却下する
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
