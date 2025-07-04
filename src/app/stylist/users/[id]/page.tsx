"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LoadingState } from "@/components/stylist/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import {
  ShirtIcon,
  SparklesIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from "lucide-react";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  profile: {
    height?: number;
    weight?: number;
    age?: number;
    style?: string;
    bodyType?: string;
    lifestyle?: string;
    favoriteColors?: string[];
  } | null;
  createdAt: string;
  clothingItems: Array<{
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
  }>;
  outfits: Array<{
    id: string;
    title: string;
    stylistComment: string;
    tips: string;
    createdAt: string;
    clothingItems: Array<{
      id: string;
      imageUrl: string;
      category: string;
      color: string;
      brand: string;
      description?: string;
    }>;
  }>;
  _count: {
    clothingItems: number;
    outfits: number;
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (status === "authenticated" && session?.user?.role !== "STYLIST") {
      redirect("/dashboard");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await fetch(`/api/stylist/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "STYLIST" && userId) {
      fetchUserDetail();
    }
  }, [session, userId]);

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
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="w-fit">
              <Link href="/stylist/users">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                戻る
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {user.name}さんの詳細
            </h1>
          </div>

          {/* ユーザー情報カード */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                {/* アバターと基本情報 */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <CardTitle className="text-lg md:text-xl">
                      {user.name}
                    </CardTitle>
                    <p className="text-slate-600 text-sm md:text-base">
                      {user.email}
                    </p>
                    <p className="text-xs md:text-sm text-slate-500">
                      登録日:{" "}
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>

                {/* 統計情報 */}
                <div className="flex justify-center sm:justify-end space-x-6 md:space-x-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ShirtIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-500 mr-1" />
                      <span className="text-xl md:text-2xl font-bold text-slate-900">
                        {user._count.clothingItems}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">
                      アイテム
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <SparklesIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-500 mr-1" />
                      <span className="text-xl md:text-2xl font-bold text-slate-900">
                        {user._count.outfits}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">コーデ</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            {user.profile && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {user.profile.age && (
                    <div>
                      <span className="text-xs md:text-sm font-medium text-slate-700">
                        年齢
                      </span>
                      <p className="text-sm md:text-base text-slate-900">
                        {user.profile.age}歳
                      </p>
                    </div>
                  )}
                  {user.profile.height && (
                    <div>
                      <span className="text-xs md:text-sm font-medium text-slate-700">
                        身長
                      </span>
                      <p className="text-sm md:text-base text-slate-900">
                        {user.profile.height}cm
                      </p>
                    </div>
                  )}
                  {user.profile.weight && (
                    <div>
                      <span className="text-xs md:text-sm font-medium text-slate-700">
                        体重
                      </span>
                      <p className="text-sm md:text-base text-slate-900">
                        {user.profile.weight}kg
                      </p>
                    </div>
                  )}
                  {user.profile.style && (
                    <div>
                      <span className="text-xs md:text-sm font-medium text-slate-700">
                        好みのスタイル
                      </span>
                      <p className="text-sm md:text-base text-slate-900">
                        {user.profile.style}
                      </p>
                    </div>
                  )}
                  {user.profile.bodyType && (
                    <div>
                      <span className="text-xs md:text-sm font-medium text-slate-700">
                        体型
                      </span>
                      <p className="text-sm md:text-base text-slate-900">
                        {user.profile.bodyType}
                      </p>
                    </div>
                  )}
                  {user.profile.lifestyle && (
                    <div>
                      <span className="text-xs md:text-sm font-medium text-slate-700">
                        ライフスタイル
                      </span>
                      <p className="text-sm md:text-base text-slate-900">
                        {user.profile.lifestyle}
                      </p>
                    </div>
                  )}
                </div>
                {user.profile.favoriteColors &&
                  user.profile.favoriteColors.length > 0 && (
                    <div className="mt-3 md:mt-4">
                      <span className="text-xs md:text-sm font-medium text-slate-700 block mb-2">
                        好きな色
                      </span>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {user.profile.favoriteColors.map(
                          (color: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {color}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            )}
          </Card>

          {/* タブコンテンツ */}
          <Tabs defaultValue="closet" className="space-y-4">
            <TabsList>
              <TabsTrigger value="closet">クローゼット</TabsTrigger>
              <TabsTrigger value="outfits">コーディネート</TabsTrigger>
              <TabsTrigger value="actions">アクション</TabsTrigger>
            </TabsList>

            <TabsContent value="closet" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-base md:text-lg font-semibold">
                  クローゼット
                </h3>
                <Button asChild className="w-full sm:w-auto h-12 sm:h-10">
                  <Link href={`/stylist/users/${userId}/closet`}>
                    詳細を確認
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {user.clothingItems.slice(0, 12).map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={item.imageUrl}
                        alt={item.description}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs text-slate-600 truncate">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        {item.evaluations.length > 0 && (
                          <Badge
                            variant={
                              item.evaluations[0].evaluation === "NECESSARY"
                                ? "default"
                                : item.evaluations[0].evaluation ===
                                  "UNNECESSARY"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.evaluations[0].evaluation === "NECESSARY"
                              ? "必要"
                              : item.evaluations[0].evaluation === "UNNECESSARY"
                              ? "不要"
                              : "キープ"}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outfits" className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-semibold">
                  コーディネート
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 sm:flex-none h-12 sm:h-10"
                  >
                    <Link href={`/stylist/users/${userId}/outfits`}>
                      一覧を見る
                    </Link>
                  </Button>
                  <Button asChild className="flex-1 sm:flex-none h-12 sm:h-10">
                    <Link href={`/stylist/users/${userId}/outfits/create`}>
                      <span className="sm:hidden">コーデ作成</span>
                      <span className="hidden sm:inline">
                        新しいコーデを作成
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.outfits.map((outfit) => (
                  <Card
                    key={outfit.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{outfit.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-slate-700 mb-2">
                          {outfit.stylistComment}
                        </p>
                        {outfit.tips && (
                          <p className="text-sm text-slate-600 italic">
                            💡 {outfit.tips}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          作成日:{" "}
                          {new Date(outfit.createdAt).toLocaleDateString(
                            "ja-JP"
                          )}
                        </p>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex gap-2 mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/stylist/users/${userId}/outfits/${outfit.id}`}
                          >
                            詳細を見る
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/stylist/users/${userId}/outfits/${outfit.id}/edit`}
                          >
                            編集
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {user.outfits.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">
                    まだコーディネートがありません
                  </p>
                  <Button asChild>
                    <Link href={`/stylist/users/${userId}/outfits/create`}>
                      最初のコーディネートを作成
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold">
                スタイリングアクション
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg flex items-center">
                      <ShirtIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      アイテム評価
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-slate-600 mb-4">
                      ユーザーの服をチェックして、必要・不要・キープの評価を行います。
                    </p>
                    <Button asChild className="w-full h-12 sm:h-10">
                      <Link href={`/stylist/users/${userId}/closet`}>
                        クローゼットで評価する
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg flex items-center">
                      <SparklesIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      コーディネート作成
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-slate-600 mb-4">
                      ユーザーの服を組み合わせて、新しいコーディネートを提案します。
                    </p>
                    <Button asChild className="w-full h-12 sm:h-10">
                      <Link href={`/stylist/users/${userId}/outfits/create`}>
                        コーデを作成する
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg flex items-center">
                      <ShoppingBagIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      購入推奨
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base text-slate-600 mb-4">
                      ユーザーに必要なアイテムの購入を推奨します。
                    </p>
                    <Button asChild className="w-full h-12 sm:h-10">
                      <Link href={`/stylist/users/${userId}/recommendations`}>
                        購入推奨を管理
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
