"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftIcon,
  HeartIcon,
  StarIcon,
  LightbulbIcon,
} from "lucide-react";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand: string;
  description: string;
}

interface OutfitDetail {
  id: string;
  title: string;
  stylistComment: string | null;
  tips: string | null;
  stylingAdvice: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  } | null;
  clothingItems: ClothingItem[];
}

export default function OutfitDetailPage() {
  const params = useParams();
  const outfitId = params.id as string;
  const { data: session, status } = useSession();
  const [outfit, setOutfit] = useState<OutfitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    const fetchOutfit = async () => {
      try {
        const response = await fetch(`/api/outfits/${outfitId}`);
        if (response.ok) {
          const data = await response.json();
          setOutfit(data);
        }
      } catch (error) {
        console.error("Failed to fetch outfit:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session && outfitId) {
      fetchOutfit();
    }
  }, [session, outfitId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header currentPage="outfits" />
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-slate-200 rounded mb-6"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !outfit) {
    return null;
  }

  const isFromStylist = outfit.createdBy?.role === "STYLIST";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage="outfits" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/outfits">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  コーディネート一覧
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {outfit.title}
                </h1>
                {isFromStylist && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      <StarIcon className="h-3 w-3 mr-1" />
                      うーちゃんの提案
                    </Badge>
                    <span className="text-sm text-slate-600">
                      {new Date(outfit.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* コーディネート画像 */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {outfit.clothingItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-white shadow-sm">
                          <Image
                            src={item.imageUrl}
                            alt={item.description}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="mt-2 space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <p className="text-sm text-slate-600 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* スタイリング情報 */}
            <div className="space-y-4">
              {isFromStylist && (
                <>
                  {/* うーちゃんからのコメント */}
                  {outfit.stylistComment && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <HeartIcon className="h-5 w-5 mr-2 text-pink-500" />
                          うーちゃんからのメッセージ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed">
                          {outfit.stylistComment}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* 着こなしのコツ */}
                  {outfit.tips && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                          着こなしのコツ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed">
                          {outfit.tips}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* スタイリングアドバイス */}
                  {outfit.stylingAdvice && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <StarIcon className="h-5 w-5 mr-2 text-blue-500" />
                          スタイリングアドバイス
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-slate-900 mb-1">
                              💡 なぜこの組み合わせ？
                            </h4>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {outfit.stylingAdvice}
                            </p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium text-slate-900 mb-1">
                              🎯 おすすめシーン
                            </h4>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              カジュアルなデートやお友達との食事、週末のお出かけにぴったりです。
                            </p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium text-slate-900 mb-1">
                              💕 女性からの印象
                            </h4>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              清潔感があり、親しみやすい印象を与えます。自然体で好感度アップ！
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* アイテム詳細 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">使用アイテム</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {outfit.clothingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-white shadow-sm">
                          <Image
                            src={item.imageUrl}
                            alt={item.description}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {item.brand}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
