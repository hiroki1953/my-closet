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
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, PlusIcon, XIcon } from "lucide-react";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  clothingItems: ClothingItem[];
}

export default function CreateOutfitPage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [outfitData, setOutfitData] = useState({
    title: "",
    stylistComment: "",
    tips: "",
    stylingAdvice: "",
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

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCreateOutfit = async () => {
    if (selectedItems.length === 0) {
      alert("アイテムを選択してください");
      return;
    }

    if (!outfitData.title.trim()) {
      alert("コーディネート名を入力してください");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/stylist/outfits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title: outfitData.title,
          stylistComment: outfitData.stylistComment,
          tips: outfitData.tips,
          stylingAdvice: outfitData.stylingAdvice,
          itemIds: selectedItems,
        }),
      });

      if (response.ok) {
        alert("コーディネートを作成しました！");
        redirect(`/stylist/users/${userId}`);
      } else {
        alert("コーディネートの作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create outfit:", error);
      alert("コーディネートの作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  if (status === "loading" || loading) {
    return <LoadingState />;
  }

  if (!session || session.user?.role !== "STYLIST" || !user) {
    return null;
  }

  const selectedItemsData = user.clothingItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const groupedItems = user.clothingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

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
                {user.name}さんのコーディネート作成
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* アイテム選択エリア */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>アイテムを選択</CardTitle>
                  <p className="text-sm text-slate-600">
                    コーディネートに含めるアイテムをクリックしてください
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3 text-slate-800">
                        {category}
                      </h3>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                              selectedItems.includes(item.id)
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            onClick={() => toggleItemSelection(item.id)}
                          >
                            <div className="aspect-square relative">
                              <Image
                                src={item.imageUrl}
                                alt={item.description}
                                fill
                                className="object-cover"
                              />
                              {selectedItems.includes(item.id) && (
                                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                  <div className="bg-blue-500 text-white rounded-full p-1">
                                    <PlusIcon className="h-4 w-4" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-xs text-slate-600 truncate">
                                {item.description}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.color}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.brand}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 選択したアイテムとフォーム */}
            <div className="space-y-6">
              {/* 選択したアイテム */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    選択したアイテム ({selectedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedItemsData.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">
                      アイテムを選択してください
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedItemsData.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg"
                        >
                          <div className="w-12 h-12 relative rounded overflow-hidden">
                            <Image
                              src={item.imageUrl}
                              alt={item.description}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.description}
                            </p>
                            <p className="text-xs text-slate-600">
                              {item.category} - {item.color}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleItemSelection(item.id)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* コーディネート情報フォーム */}
              <Card>
                <CardHeader>
                  <CardTitle>コーディネート情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">コーディネート名 *</Label>
                    <Input
                      id="title"
                      placeholder="カジュアルビジネス、デートスタイル など"
                      value={outfitData.title}
                      onChange={(e) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="stylistComment">スタイリストコメント</Label>
                    <Textarea
                      id="stylistComment"
                      placeholder="このコーディネートの魅力や印象について"
                      value={outfitData.stylistComment}
                      onChange={(e) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          stylistComment: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="tips">着こなしのコツ</Label>
                    <Textarea
                      id="tips"
                      placeholder="さらに良く見せるためのTips"
                      value={outfitData.tips}
                      onChange={(e) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          tips: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="stylingAdvice">
                      スタイリングアドバイス
                    </Label>
                    <Textarea
                      id="stylingAdvice"
                      placeholder="どんなシーンで、どのように着ると良いか"
                      value={outfitData.stylingAdvice}
                      onChange={(e) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          stylingAdvice: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button
                    onClick={handleCreateOutfit}
                    disabled={
                      creating ||
                      selectedItems.length === 0 ||
                      !outfitData.title.trim()
                    }
                    className="w-full"
                  >
                    {creating ? "作成中..." : "コーディネートを作成"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
