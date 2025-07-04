"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutfitVisualDisplay } from "@/components/outfits/outfit-visual-display";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
}

interface Outfit {
  id: string;
  title: string;
  stylistComment?: string;
  tips?: string;
  stylingAdvice?: string;
  createdAt: string;
  clothingItems: ClothingItem[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface OutfitsData {
  user: User;
  outfits: Outfit[];
}

export default function StylistUserOutfitsPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const userId = params.id as string;

  const [data, setData] = useState<OutfitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const response = await fetch(`/api/stylist/users/${userId}/outfits`);
        if (!response.ok) throw new Error("Failed to fetch outfits");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching outfits:", error);
        toast.error("コーディネート一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "STYLIST" && userId) {
      fetchOutfits();
    }
  }, [session, userId]);

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!confirm("このコーディネートを削除しますか？")) return;

    setDeleting(outfitId);
    try {
      const response = await fetch(`/api/stylist/outfits/${outfitId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete outfit");

      toast.success("コーディネートを削除しました");

      // データを再取得
      setData((prev) =>
        prev
          ? {
              ...prev,
              outfits: prev.outfits.filter((outfit) => outfit.id !== outfitId),
            }
          : null
      );
    } catch (error) {
      console.error("Error deleting outfit:", error);
      toast.error("コーディネートの削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "STYLIST" || !data) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* ヘッダー */}
      <div className="space-y-4 mb-6 md:mb-8">
        {/* 戻るボタンとタイトル */}
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href={`/stylist/users/${userId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              {data.user.name}さんの
              <br className="sm:hidden" />
              コーディネート一覧
            </h1>
            <p className="text-sm text-gray-600 mt-1">{data.user.email}</p>
          </div>
        </div>

        {/* 件数と作成ボタン */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <p className="text-gray-600 text-sm md:text-base">
            {data.outfits.length}件のコーディネート
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/stylist/users/${userId}/outfits/create`}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="sm:hidden">コーディネート作成</span>
              <span className="hidden sm:inline">新しいコーディネート作成</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* コーディネート一覧 */}
      {data.outfits.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            まだコーディネートがありません
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 px-4">
            {data.user.name}さんの最初のコーディネートを作成しましょう
          </p>
          <Button asChild className="w-full max-w-xs">
            <Link href={`/stylist/users/${userId}/outfits/create`}>
              <Plus className="w-4 h-4 mr-2" />
              コーディネート作成
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {data.outfits.map((outfit) => (
            <Card
              key={outfit.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[4/3] relative bg-gray-100">
                {/* コーディネート視覚表示 */}
                <div className="flex justify-center items-center h-full p-4">
                  <OutfitVisualDisplay
                    items={outfit.clothingItems}
                    size="sm"
                    showLabels={false}
                  />
                </div>

                {/* アイテム数バッジ */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-gray-700 text-xs"
                  >
                    {outfit.clothingItems.length}
                    <span className="hidden sm:inline">アイテム</span>
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg line-clamp-2">
                  {outfit.title}
                </CardTitle>
                <div className="flex items-center text-xs md:text-sm text-gray-500">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  {new Date(outfit.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 md:space-y-4">
                {outfit.stylistComment && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {outfit.stylistComment}
                  </p>
                )}

                {outfit.tips && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">💡 {outfit.tips}</p>
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link
                        href={`/stylist/users/${userId}/outfits/${outfit.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="hidden xs:inline">詳細</span>
                        <span className="xs:hidden">詳細</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link
                        href={`/stylist/users/${userId}/outfits/${outfit.id}/edit`}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        <span className="hidden xs:inline">編集</span>
                        <span className="xs:hidden">編集</span>
                      </Link>
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOutfit(outfit.id)}
                    disabled={deleting === outfit.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-0" />
                    <span className="ml-1 sm:hidden">削除</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
