"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LoadingState } from "@/components/stylist/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendationCard } from "@/components/stylist/recommendations/recommendation-card";
import { RecommendationCreateForm } from "@/components/stylist/recommendations/recommendation-create-form";
import { RecommendationEditDialog } from "@/components/stylist/recommendations/recommendation-edit-dialog";
import { RecommendationDeleteDialog } from "@/components/stylist/recommendations/recommendation-delete-dialog";
import Link from "next/link";
import { ArrowLeftIcon, ShoppingBagIcon, PlusIcon } from "lucide-react";

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
  productUrl?: string;
  declineReason?: string;
  createdAt: string;
}

interface CreateRecommendationData {
  userId: string;
  itemType: string;
  description: string;
  reason: string;
  productUrl?: string;
  priority: string;
}

interface EditRecommendationData {
  itemType: string;
  description: string;
  reason: string;
  productUrl?: string;
  priority: string;
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecommendation, setEditingRecommendation] =
    useState<PurchaseRecommendation | null>(null);
  const [deletingRecommendation, setDeletingRecommendation] =
    useState<PurchaseRecommendation | null>(null);

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
          const userData = (await userResponse.json()) as User;
          setUser(userData);
        }

        if (recommendationsResponse.ok) {
          const recommendationsData =
            (await recommendationsResponse.json()) as PurchaseRecommendation[];
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

  const handleCreateRecommendation = async (data: CreateRecommendationData) => {
    const response = await fetch("/api/stylist/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const newRec = (await response.json()) as PurchaseRecommendation;
      setRecommendations((prev) => [newRec, ...prev]);
      setShowCreateForm(false);
      alert("購入推奨を作成しました！");
    } else {
      throw new Error("Failed to create recommendation");
    }
  };

  const handleEditRecommendation = async (
    id: string,
    data: EditRecommendationData
  ) => {
    // 編集時にステータスを自動的にPENDINGにリセット
    const updateData = {
      ...data,
      status: "PENDING",
      declineReason: null, // 却下理由もクリア
    };

    const response = await fetch("/api/stylist/recommendations", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...updateData }),
    });

    if (response.ok) {
      const updatedRec = (await response.json()) as PurchaseRecommendation;
      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? updatedRec : rec))
      );
      setEditingRecommendation(null);
      alert(
        "推奨を更新しました！ユーザーの確認ステータスがリセットされました。"
      );
    } else {
      throw new Error("Failed to update recommendation");
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    const response = await fetch("/api/stylist/recommendations", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
      setDeletingRecommendation(null);
      alert("推奨を削除しました！");
    } else {
      throw new Error("Failed to delete recommendation");
    }
  };

  if (status === "loading" || loading) {
    return <LoadingState />;
  }

  if (!session || session.user?.role !== "STYLIST" || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage="dashboard" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/stylist/users/${userId}`}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  戻る
                </Link>
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                {user.name}さんの購入推奨
              </h1>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              <span>新しい推奨を作成</span>
            </Button>
          </div>

          {/* 新規作成フォーム */}
          {showCreateForm && (
            <RecommendationCreateForm
              userId={userId}
              onSubmit={handleCreateRecommendation}
            />
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
                    新しい推奨を作成して、{user.name}
                    さんにアイテムを提案しましょう。
                  </p>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onEdit={(rec) => setEditingRecommendation(rec)}
                  onDelete={(rec) => setDeletingRecommendation(rec)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* 編集ダイアログ */}
      <RecommendationEditDialog
        recommendation={editingRecommendation}
        isOpen={!!editingRecommendation}
        onClose={() => setEditingRecommendation(null)}
        onSave={handleEditRecommendation}
      />

      {/* 削除確認ダイアログ */}
      <RecommendationDeleteDialog
        recommendation={deletingRecommendation}
        isOpen={!!deletingRecommendation}
        onClose={() => setDeletingRecommendation(null)}
        onDelete={handleDeleteRecommendation}
      />
    </div>
  );
}
