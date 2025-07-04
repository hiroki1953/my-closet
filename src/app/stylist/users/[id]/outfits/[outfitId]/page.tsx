"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Lightbulb,
  Star,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { OutfitVisualDisplay } from "@/components/outfits/outfit-visual-display";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
  description?: string;
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

interface OutfitDetailData {
  user: User;
  outfit: Outfit;
}

export default function StylistOutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = params.id as string;
  const outfitId = params.outfitId as string;

  const [data, setData] = useState<OutfitDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchOutfitDetail = async () => {
      try {
        const response = await fetch(
          `/api/stylist/users/${userId}/outfits/${outfitId}`
        );
        if (!response.ok) throw new Error("Failed to fetch outfit detail");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching outfit detail:", error);
        toast.error("コーディネート詳細の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "STYLIST" && userId && outfitId) {
      fetchOutfitDetail();
    }
  }, [session, userId, outfitId]);

  const handleDeleteOutfit = async () => {
    if (
      !confirm("このコーディネートを削除しますか？この操作は取り消せません。")
    )
      return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/stylist/outfits/${outfitId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete outfit");

      toast.success("コーディネートを削除しました");
      router.push(`/stylist/users/${userId}/outfits`);
    } catch (error) {
      console.error("Error deleting outfit:", error);
      toast.error("コーディネートの削除に失敗しました");
    } finally {
      setDeleting(false);
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

  const { user, outfit } = data;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* ヘッダー */}
      <div className="space-y-4 mb-6 md:mb-8">
        {/* 戻るボタンとタイトル */}
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href={`/stylist/users/${userId}/outfits`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              コーディネート一覧
            </Link>
          </Button>
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              {outfit.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {user.name}さんのコーディネート
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Link href={`/stylist/users/${userId}/outfits/${outfitId}/edit`}>
              <Edit3 className="w-4 h-4 mr-2" />
              編集
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteOutfit}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "削除中..." : "削除"}
          </Button>
        </div>

        {/* メタ情報 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            作成日: {new Date(outfit.createdAt).toLocaleDateString("ja-JP")}
          </div>
          <Badge variant="secondary" className="w-fit text-xs">
            {outfit.clothingItems.length}アイテム
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* コーディネート視覚表示エリア */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base md:text-lg">
                <span className="mr-2">✨</span>
                コーディネート詳細
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* メインの視覚表示 */}
              <div className="flex justify-center mb-6">
                <OutfitVisualDisplay
                  items={outfit.clothingItems}
                  size="lg"
                  showLabels={true}
                  className="w-full max-w-md"
                />
              </div>

              {/* アイテム詳細グリッド */}
              <div className="border-t pt-4 md:pt-6">
                <h4 className="font-semibold mb-3 md:mb-4 flex items-center text-sm md:text-base">
                  <span className="mr-2">👕</span>
                  使用アイテム詳細
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                  {outfit.clothingItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="aspect-square relative rounded-lg overflow-hidden bg-white shadow-sm border">
                        <Image
                          src={item.imageUrl}
                          alt={item.description || item.category}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <p className="text-xs md:text-sm text-gray-600 truncate">
                          {item.description ||
                            `${item.category} - ${item.color}`}
                        </p>
                        {item.brand && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.brand}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* スタイリング情報エリア */}
        <div className="space-y-4 md:space-y-6">
          {/* スタイリストコメント */}
          {outfit.stylistComment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center">
                  <Heart className="h-4 w-4 md:h-5 md:w-5 mr-2 text-pink-500" />
                  スタイリストコメント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs">💬</span>
                    </div>
                    <span className="font-semibold text-blue-900 text-sm">
                      スタイリストより
                    </span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    {outfit.stylistComment}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 着こなしのコツ */}
          {outfit.tips && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center">
                  <Lightbulb className="h-4 w-4 md:h-5 md:w-5 mr-2 text-yellow-500" />
                  着こなしのコツ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-900 leading-relaxed">
                    💡 {outfit.tips}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* スタイリングアドバイス */}
          {outfit.stylingAdvice && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center">
                  <Star className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-500" />
                  スタイリングアドバイス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-purple-900 leading-relaxed">
                    ✨ {outfit.stylingAdvice}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* アクションエリア */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" size="sm">
                <Link
                  href={`/stylist/users/${userId}/outfits/${outfitId}/edit`}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  このコーディネートを編集
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href={`/stylist/users/${userId}/outfits/create`}>
                  <span className="mr-2">✨</span>
                  新しいコーディネート作成
                </Link>
              </Button>

              <Separator />

              <Button
                variant="outline"
                onClick={handleDeleteOutfit}
                disabled={deleting}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? "削除中..." : "このコーディネートを削除"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
