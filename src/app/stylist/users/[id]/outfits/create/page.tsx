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
import { toast } from "sonner";
import { OutfitVisualDisplay } from "@/components/outfits/outfit-visual-display";

// アイテム表示コンポーネント
const ItemDisplay = ({
  item,
  onRemove,
}: {
  item: ClothingItem;
  onRemove: () => void;
}) => (
  <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-200">
    <div className="w-10 h-10 relative rounded overflow-hidden">
      <Image
        src={item.imageUrl}
        alt={item.description}
        fill
        className="object-cover"
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{item.description}</p>
      <p className="text-xs text-slate-600">{item.color}</p>
    </div>
    <Button variant="ghost" size="sm" onClick={onRemove}>
      <XIcon className="h-4 w-4" />
    </Button>
  </div>
);

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

  // 体のパーツごとの選択状態を管理
  const [selectedOuterwear, setSelectedOuterwear] = useState<string | null>(
    null
  );
  const [selectedTops, setSelectedTops] = useState<string[]>([]);
  const [selectedBottoms, setSelectedBottoms] = useState<string | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<string | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

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

  // アイテム選択関数
  const toggleOuterwear = (itemId: string | null) => {
    setSelectedOuterwear(selectedOuterwear === itemId ? null : itemId);
  };

  const toggleTops = (itemId: string) => {
    setSelectedTops((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectBottoms = (itemId: string | null) => {
    setSelectedBottoms(selectedBottoms === itemId ? null : itemId);
  };

  const selectShoes = (itemId: string | null) => {
    setSelectedShoes(selectedShoes === itemId ? null : itemId);
  };

  const toggleAccessories = (itemId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // 全選択されたアイテムを取得
  const getAllSelectedItems = () => {
    const allSelected = [];
    if (selectedOuterwear) allSelected.push(selectedOuterwear);
    allSelected.push(...selectedTops);
    if (selectedBottoms) allSelected.push(selectedBottoms);
    if (selectedShoes) allSelected.push(selectedShoes);
    allSelected.push(...selectedAccessories);
    return allSelected;
  };

  const handleCreateOutfit = async () => {
    const selectedItems = getAllSelectedItems();

    if (selectedItems.length === 0) {
      toast.error("アイテムを選択してください");
      return;
    }

    if (!outfitData.title.trim()) {
      toast.error("コーディネート名を入力してください");
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
        toast.success("コーディネートを作成しました！");
        setTimeout(() => {
          redirect(`/stylist/users/${userId}`);
        }, 1000); // 成功メッセージを表示してからリダイレクト
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "コーディネートの作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create outfit:", error);
      toast.error("コーディネートの作成に失敗しました");
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

  // 選択されたアイテムの詳細データを取得
  const selectedItemsData = user.clothingItems.filter((item) =>
    getAllSelectedItems().includes(item.id)
  );

  // カテゴリ別にアイテムを分類
  const categoryOrder = [
    "OUTERWEAR",
    "TOPS",
    "BOTTOMS",
    "SHOES",
    "ACCESSORIES",
  ] as const;
  const categoryNames: Record<string, string> = {
    OUTERWEAR: "アウター",
    TOPS: "トップス",
    BOTTOMS: "ボトムス",
    SHOES: "シューズ",
    ACCESSORIES: "アクセサリー",
  };

  const groupedItems = user.clothingItems.reduce((acc, item) => {
    const category = item.category.toUpperCase();
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  // アイテムが選択されているかチェック
  const isSelected = (itemId: string, category: string) => {
    switch (category) {
      case "OUTERWEAR":
        return selectedOuterwear === itemId;
      case "TOPS":
        return selectedTops.includes(itemId);
      case "BOTTOMS":
        return selectedBottoms === itemId;
      case "SHOES":
        return selectedShoes === itemId;
      case "ACCESSORIES":
        return selectedAccessories.includes(itemId);
      default:
        return false;
    }
  };

  // アイテムをクリックした時の処理
  const handleItemClick = (itemId: string, category: string) => {
    switch (category) {
      case "OUTERWEAR":
        toggleOuterwear(itemId);
        break;
      case "TOPS":
        toggleTops(itemId);
        break;
      case "BOTTOMS":
        selectBottoms(itemId);
        break;
      case "SHOES":
        selectShoes(itemId);
        break;
      case "ACCESSORIES":
        toggleAccessories(itemId);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage="dashboard" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
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
            {/* アイテム選択エリア - 体のパーツごと */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>コーディネートを組み立てよう</CardTitle>
                  <p className="text-sm text-slate-600">
                    上から順番に体のパーツごとにアイテムを選択してください
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {categoryOrder.map((category) => {
                    const items = groupedItems[category] || [];
                    const categoryName = categoryNames[category];
                    const isMultiple =
                      category === "TOPS" || category === "ACCESSORIES";
                    const isOptional = category === "OUTERWEAR";

                    return (
                      <div key={category} className="space-y-4">
                        {/* カテゴリヘッダー */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            {categoryName}
                            {isMultiple && (
                              <Badge variant="outline" className="text-xs">
                                複数選択可
                              </Badge>
                            )}
                            {isOptional && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-yellow-50 text-yellow-700"
                              >
                                選択任意
                              </Badge>
                            )}
                          </h3>
                          {isOptional && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOuterwear(null)}
                              className={`text-xs ${
                                selectedOuterwear === null ? "bg-slate-100" : ""
                              }`}
                            >
                              {selectedOuterwear === null
                                ? "✓ なし"
                                : "なしにする"}
                            </Button>
                          )}
                        </div>

                        {/* アイテムグリッド */}
                        {items.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                  isSelected(item.id, category)
                                    ? "border-blue-500 ring-2 ring-blue-200 shadow-lg"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                                onClick={() =>
                                  handleItemClick(item.id, category)
                                }
                              >
                                <div className="aspect-square relative">
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.description}
                                    fill
                                    className="object-cover"
                                  />
                                  {isSelected(item.id, category) && (
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
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {item.color}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {item.brand}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                            <p className="text-slate-500">
                              {categoryName}のアイテムがありません
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* 選択したアイテムとフォーム */}
            <div className="space-y-6">
              {/* コーディネートプレビュー */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    コーディネートプレビュー
                    <Badge variant="outline" className="text-xs">
                      {getAllSelectedItems().length}アイテム
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedItemsData.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <p className="text-slate-500 mb-2">
                        アイテムを選択してください
                      </p>
                      <p className="text-xs text-slate-400">
                        左側からアイテムを順番に選んでコーディネートを組み立てましょう
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* ビジュアルディスプレイ */}
                      <OutfitVisualDisplay
                        items={selectedItemsData}
                        size="md"
                        showLabels={true}
                      />

                      {/* 詳細リスト */}
                      <div className="space-y-2 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700">
                          選択中のアイテム
                        </h4>
                        <div className="space-y-2">
                          {selectedItemsData.map((item) => {
                            const handleRemove = () => {
                              if (item.id === selectedOuterwear)
                                toggleOuterwear(null);
                              else if (selectedTops.includes(item.id))
                                toggleTops(item.id);
                              else if (item.id === selectedBottoms)
                                selectBottoms(null);
                              else if (item.id === selectedShoes)
                                selectShoes(null);
                              else if (selectedAccessories.includes(item.id))
                                toggleAccessories(item.id);
                            };
                            return (
                              <ItemDisplay
                                key={item.id}
                                item={item}
                                onRemove={handleRemove}
                              />
                            );
                          })}
                        </div>
                      </div>
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
                      getAllSelectedItems().length === 0 ||
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
