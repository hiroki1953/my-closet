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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, CheckIcon, XIcon, PauseIcon } from "lucide-react";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand: string;
  description: string;
  purchaseDate: string;
  evaluations: Array<{
    id: string;
    evaluation: string;
    comment: string;
    createdAt: string;
  }>;
}

interface User {
  id: string;
  name: string;
  clothingItems: ClothingItem[];
}

type EvaluationType = "NECESSARY" | "UNNECESSARY" | "KEEP";

export default function UserEvaluationsPage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluatingItem, setEvaluatingItem] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<
    Record<string, { type: EvaluationType; comment: string }>
  >({});

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (status === "authenticated" && session?.user?.role !== "STYLIST") {
      redirect("/dashboard");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        const response = await fetch(`/api/stylist/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "STYLIST" && userId) {
      fetchUserItems();
    }
  }, [session, userId]);

  const handleEvaluationSubmit = async (itemId: string) => {
    const evaluation = evaluations[itemId];
    if (!evaluation) return;

    setEvaluatingItem(itemId);

    try {
      const response = await fetch(`/api/stylist/evaluations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          evaluation: evaluation.type,
          comment: evaluation.comment,
        }),
      });

      if (response.ok) {
        // 評価を更新
        setUser((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            clothingItems: prev.clothingItems.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    evaluations: [
                      {
                        id: `new-${Date.now()}`,
                        evaluation: evaluation.type,
                        comment: evaluation.comment,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : item
            ),
          };
        });

        // 評価フォームをクリア
        setEvaluations((prev) => {
          const newEvaluations = { ...prev };
          delete newEvaluations[itemId];
          return newEvaluations;
        });
      }
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
    } finally {
      setEvaluatingItem(null);
    }
  };

  const updateEvaluation = (
    itemId: string,
    type: EvaluationType,
    comment: string
  ) => {
    setEvaluations((prev) => ({
      ...prev,
      [itemId]: { type, comment },
    }));
  };

  if (status === "loading" || loading) {
    return <LoadingState />;
  }

  if (!session || session.user?.role !== "STYLIST" || !user) {
    return null;
  }

  const getEvaluationIcon = (evaluation: string) => {
    switch (evaluation) {
      case "NECESSARY":
        return <CheckIcon className="h-4 w-4" />;
      case "UNNECESSARY":
        return <XIcon className="h-4 w-4" />;
      case "KEEP":
        return <PauseIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case "NECESSARY":
        return "default";
      case "UNNECESSARY":
        return "destructive";
      case "KEEP":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getEvaluationText = (evaluation: string) => {
    switch (evaluation) {
      case "NECESSARY":
        return "必要";
      case "UNNECESSARY":
        return "不要";
      case "KEEP":
        return "キープ";
      default:
        return "未評価";
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
                {user.name}さんのアイテム評価
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.clothingItems.map((item) => {
              const currentEvaluation = item.evaluations[0];
              const pendingEvaluation = evaluations[item.id];

              return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.description}
                      fill
                      className="object-cover"
                    />
                    {currentEvaluation && (
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            getEvaluationColor(currentEvaluation.evaluation) as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                          }
                        >
                          {getEvaluationIcon(currentEvaluation.evaluation)}
                          <span className="ml-1">
                            {getEvaluationText(currentEvaluation.evaluation)}
                          </span>
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {item.description}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant="outline">{item.color}</Badge>
                      <Badge variant="outline">{item.brand}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {currentEvaluation && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          現在の評価:{" "}
                          {getEvaluationText(currentEvaluation.evaluation)}
                        </p>
                        {currentEvaluation.comment && (
                          <p className="text-sm text-slate-600">
                            {currentEvaluation.comment}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(
                            currentEvaluation.createdAt
                          ).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Select
                        value={pendingEvaluation?.type || ""}
                        onValueChange={(value: EvaluationType) =>
                          updateEvaluation(
                            item.id,
                            value,
                            pendingEvaluation?.comment || ""
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              currentEvaluation ? "評価を変更" : "評価を選択"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NECESSARY">
                            <div className="flex items-center">
                              <CheckIcon className="h-4 w-4 mr-2 text-green-600" />
                              必要（活用推奨）
                            </div>
                          </SelectItem>
                          <SelectItem value="KEEP">
                            <div className="flex items-center">
                              <PauseIcon className="h-4 w-4 mr-2 text-yellow-600" />
                              キープ（様子見）
                            </div>
                          </SelectItem>
                          <SelectItem value="UNNECESSARY">
                            <div className="flex items-center">
                              <XIcon className="h-4 w-4 mr-2 text-red-600" />
                              不要（処分推奨）
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Textarea
                        placeholder="評価コメント（理由やアドバイス）"
                        value={pendingEvaluation?.comment || ""}
                        onChange={(e) =>
                          updateEvaluation(
                            item.id,
                            pendingEvaluation?.type || "NECESSARY",
                            e.target.value
                          )
                        }
                      />

                      <Button
                        onClick={() => handleEvaluationSubmit(item.id)}
                        disabled={
                          !pendingEvaluation?.type || evaluatingItem === item.id
                        }
                        className="w-full"
                      >
                        {evaluatingItem === item.id
                          ? "保存中..."
                          : "評価を保存"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {user.clothingItems.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  アイテムが見つかりません
                </h3>
                <p className="text-slate-600">
                  このユーザーはまだ服を登録していません。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
