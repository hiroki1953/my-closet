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
import {
  ArrowLeftIcon,
  HeartIcon,
  StarIcon,
  LightbulbIcon,
} from "lucide-react";
import { OutfitVisualDisplay } from "@/components/outfits/outfit-visual-display";
import { useStylist } from "@/lib/hooks/use-stylist";

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
  const { getStylistName } = useStylist();

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
        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 sm:h-8 bg-slate-200 rounded w-1/2 sm:w-1/4"></div>
            <div className="h-48 sm:h-64 bg-slate-200 rounded"></div>
            <div className="h-24 sm:h-32 bg-slate-200 rounded"></div>
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

      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* ヘッダー - モバイル対応 */}
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-12 sm:h-10"
              >
                <Link href="/outfits">
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  コーディネート一覧
                </Link>
              </Button>
              <div className="space-y-2 sm:space-y-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {outfit.title}
                </h1>
                {isFromStylist && (
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 w-fit"
                    >
                      <StarIcon className="h-3 w-3 mr-1" />
                      {getStylistName()}の提案
                    </Badge>
                    <span className="text-sm text-slate-600">
                      {new Date(outfit.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* コーディネート視覚表示 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    コーディネート詳細
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <OutfitVisualDisplay
                      items={outfit.clothingItems}
                      size="lg"
                      showLabels={true}
                      className="w-full max-w-sm sm:max-w-md"
                    />
                  </div>

                  {/* アイテム詳細グリッド */}
                  <div className="border-t pt-4 sm:pt-6">
                    <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">
                      使用アイテム詳細
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {outfit.clothingItems.map((item) => (
                        <div key={item.id} className="relative group">
                          <div className="aspect-square relative rounded-lg overflow-hidden bg-white shadow-sm border">
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
                            {item.brand && (
                              <p className="text-xs text-slate-500 truncate">
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

            {/* スタイリング情報 */}
            <div className="space-y-3 sm:space-y-4">
              {isFromStylist ? (
                <>
                  {/* スタイリストからのコメント */}
                  {outfit.stylistComment && (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg flex items-center">
                          <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                          {getStylistName()}からのメッセージ
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm sm:text-base text-blue-900 leading-relaxed font-medium">
                          {outfit.stylistComment}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* 着こなしのコツ */}
                  {outfit.tips && (
                    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg flex items-center">
                          <LightbulbIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-600" />
                          着こなしのコツ
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm sm:text-base text-yellow-900 leading-relaxed font-medium">
                          {outfit.tips}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* スタイリングアドバイス */}
                  {outfit.stylingAdvice && (
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg flex items-center">
                          <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                          スタイリングアドバイス
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm sm:text-base text-green-900 leading-relaxed font-medium">
                          {outfit.stylingAdvice}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                /* 自分で作ったコーディネートの場合は使用アイテムを表示 */
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      使用アイテム
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {outfit.clothingItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 relative rounded-md overflow-hidden bg-white shadow-sm flex-shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.description}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate text-sm sm:text-base">
                              {item.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              {item.brand && (
                                <span className="text-xs text-slate-500 truncate">
                                  {item.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
