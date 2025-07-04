"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, Check } from "lucide-react";
import { toast } from "sonner";

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
  clothingItems: ClothingItem[];
}

interface EditOutfitData {
  user: User;
  outfit: Outfit;
}

interface OutfitForm {
  title: string;
  stylistComment: string;
  tips: string;
  stylingAdvice: string;
}

// カテゴリの順序と日本語ラベル
const CATEGORY_ORDER = [
  { value: "OUTERWEAR", label: "アウター", rule: "単一選択・なしも可" },
  { value: "TOPS", label: "トップス", rule: "重ね着可能・複数選択" },
  { value: "BOTTOMS", label: "ボトムス", rule: "単一選択のみ" },
  { value: "SHOES", label: "シューズ", rule: "単一選択のみ" },
  { value: "ACCESSORIES", label: "アクセサリー", rule: "複数選択可能" },
];

// カテゴリの色分け
const CATEGORY_COLORS: Record<string, string> = {
  OUTERWEAR: "bg-purple-50 border-purple-200",
  TOPS: "bg-blue-50 border-blue-200",
  BOTTOMS: "bg-green-50 border-green-200",
  SHOES: "bg-orange-50 border-orange-200",
  ACCESSORIES: "bg-pink-50 border-pink-200",
};

export default function StylistEditOutfitPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = params.id as string;
  const outfitId = params.outfitId as string;

  const [data, setData] = useState<EditOutfitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 体のパーツごとの選択状態を管理
  const [selectedOuterwear, setSelectedOuterwear] = useState<string | null>(
    null
  );
  const [selectedTops, setSelectedTops] = useState<string[]>([]);
  const [selectedBottoms, setSelectedBottoms] = useState<string | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<string | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  const [outfitData, setOutfitData] = useState<OutfitForm>({
    title: "",
    stylistComment: "",
    tips: "",
    stylingAdvice: "",
  });

  useEffect(() => {
    const fetchEditData = async () => {
      try {
        const response = await fetch(
          `/api/stylist/users/${userId}/outfits/${outfitId}/edit`
        );
        if (!response.ok) throw new Error("Failed to fetch edit data");
        const result = await response.json();
        setData(result);

        // フォームデータを初期化
        setOutfitData({
          title: result.outfit.title,
          stylistComment: result.outfit.stylistComment || "",
          tips: result.outfit.tips || "",
          stylingAdvice: result.outfit.stylingAdvice || "",
        });

        // 選択されたアイテムを初期化
        initializeSelectedItems(result.outfit.clothingItems);
      } catch (error) {
        console.error("Error fetching edit data:", error);
        toast.error("編集データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "STYLIST" && userId && outfitId) {
      fetchEditData();
    }
  }, [session, userId, outfitId]);

  // 既存のアイテムから初期選択状態を設定
  const initializeSelectedItems = (clothingItems: ClothingItem[]) => {
    const itemsByCategory = clothingItems.reduce((acc, item) => {
      const category = item.category.toUpperCase();
      if (!acc[category]) acc[category] = [];
      acc[category].push(item.id);
      return acc;
    }, {} as Record<string, string[]>);

    setSelectedOuterwear(itemsByCategory.OUTERWEAR?.[0] || null);
    setSelectedTops(itemsByCategory.TOPS || []);
    setSelectedBottoms(itemsByCategory.BOTTOMS?.[0] || null);
    setSelectedShoes(itemsByCategory.SHOES?.[0] || null);
    setSelectedAccessories(itemsByCategory.ACCESSORIES || []);
  };

  // カテゴリ別選択関数
  const handleOuterwearSelection = (itemId: string | null) => {
    setSelectedOuterwear(selectedOuterwear === itemId ? null : itemId);
  };

  const handleTopsSelection = (itemId: string) => {
    setSelectedTops((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBottomsSelection = (itemId: string | null) => {
    setSelectedBottoms(selectedBottoms === itemId ? null : itemId);
  };

  const handleShoesSelection = (itemId: string | null) => {
    setSelectedShoes(selectedShoes === itemId ? null : itemId);
  };

  const handleAccessoriesSelection = (itemId: string) => {
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

  // アイテムが選択されているかチェック
  const isSelected = (itemId: string, category: string) => {
    switch (category.toUpperCase()) {
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

  // カテゴリに応じた選択ハンドラー
  const handleItemClick = (itemId: string, category: string) => {
    switch (category.toUpperCase()) {
      case "OUTERWEAR":
        handleOuterwearSelection(itemId);
        break;
      case "TOPS":
        handleTopsSelection(itemId);
        break;
      case "BOTTOMS":
        handleBottomsSelection(itemId);
        break;
      case "SHOES":
        handleShoesSelection(itemId);
        break;
      case "ACCESSORIES":
        handleAccessoriesSelection(itemId);
        break;
    }
  };

  const handleSaveOutfit = async () => {
    const allSelected = getAllSelectedItems();

    if (allSelected.length === 0) {
      toast.error("アイテムを選択してください");
      return;
    }

    if (!outfitData.title.trim()) {
      toast.error("コーディネート名を入力してください");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/stylist/outfits/${outfitId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: outfitData.title,
          stylistComment: outfitData.stylistComment,
          tips: outfitData.tips,
          stylingAdvice: outfitData.stylingAdvice,
          itemIds: allSelected,
        }),
      });

      if (response.ok) {
        toast.success("コーディネートを更新しました！");
        router.push(`/stylist/users/${userId}/outfits/${outfitId}`);
      } else {
        toast.error("コーディネートの更新に失敗しました");
      }
    } catch (error) {
      console.error("Failed to update outfit:", error);
      toast.error("コーディネートの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  // アイテム表示コンポーネント
  const ItemDisplay = ({ item }: { item: ClothingItem }) => {
    const selected = isSelected(item.id, item.category);

    return (
      <div
        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
          selected
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => handleItemClick(item.id, item.category)}
      >
        <div className="aspect-square relative">
          <Image
            src={item.imageUrl}
            alt={item.description || item.category}
            fill
            className="object-cover"
          />
          {selected && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
        <div className="p-1.5 md:p-2 bg-white">
          <p className="text-xs text-gray-600 truncate">
            {item.description || `${item.category} - ${item.color}`}
          </p>
          {item.brand && (
            <p className="text-xs text-gray-500 truncate">{item.brand}</p>
          )}
        </div>
      </div>
    );
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
  const allSelectedItems = getAllSelectedItems();
  const selectedItemsData = user.clothingItems.filter((item) =>
    allSelectedItems.includes(item.id)
  );

  // カテゴリ別にアイテムをグループ化
  const groupedItems = user.clothingItems.reduce((acc, item) => {
    const category = item.category.toUpperCase();
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* ヘッダー */}
      <div className="space-y-4 mb-6 md:mb-8">
        {/* 戻るボタンとタイトル */}
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href={`/stylist/users/${userId}/outfits/${outfitId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              コーディネート詳細
            </Link>
          </Button>
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              コーディネート編集
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {user.name}さんのコーディネート「{outfit.title}」
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none order-2 sm:order-1"
          >
            <Link href={`/stylist/users/${userId}/outfits/${outfitId}`}>
              <X className="w-4 h-4 mr-2" />
              キャンセル
            </Link>
          </Button>
          <Button
            onClick={handleSaveOutfit}
            disabled={
              saving ||
              allSelectedItems.length === 0 ||
              !outfitData.title.trim()
            }
            size="sm"
            className="flex-1 sm:flex-none order-1 sm:order-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* アイテム選択エリア */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                体の部位別でアイテムを選択
              </CardTitle>
              <p className="text-sm text-gray-600">
                体の上から順番にアイテムを選んでコーディネートを編集してください
              </p>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-8">
              {CATEGORY_ORDER.map((categoryInfo) => {
                const items = groupedItems[categoryInfo.value] || [];

                return (
                  <div
                    key={categoryInfo.value}
                    className={`p-4 rounded-lg border-2 ${
                      CATEGORY_COLORS[categoryInfo.value]
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">
                        {categoryInfo.label}
                      </h3>
                      <Badge variant="secondary" className="text-xs w-fit">
                        {categoryInfo.rule}
                      </Badge>
                    </div>

                    {/* アウターの場合は「なし」選択肢を追加 */}
                    {categoryInfo.value === "OUTERWEAR" && (
                      <div className="mb-4">
                        <div
                          className={`relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:scale-105 ${
                            selectedOuterwear === null
                              ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400 bg-gray-50"
                          }`}
                          onClick={() => handleOuterwearSelection(null)}
                        >
                          <div className="text-gray-600">アウターなし</div>
                          {selectedOuterwear === null && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">
                          このカテゴリのアイテムはまだ登録されていません
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                        {items.map((item) => (
                          <ItemDisplay key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* プレビューと編集フォーム */}
        <div className="space-y-4 md:space-y-6">
          {/* 選択したアイテムのプレビュー */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                コーディネートプレビュー
              </CardTitle>
              <p className="text-sm text-gray-600">
                選択したアイテム ({allSelectedItems.length}個)
              </p>
            </CardHeader>
            <CardContent>
              {selectedItemsData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-32 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    👤
                  </div>
                  <p>アイテムを選択してください</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 体型シルエットライクなプレビュー */}
                  <div className="relative">
                    {CATEGORY_ORDER.map((categoryInfo) => {
                      const categoryItems = selectedItemsData.filter(
                        (item) =>
                          item.category.toUpperCase() === categoryInfo.value
                      );

                      return (
                        <div
                          key={categoryInfo.value}
                          className={`mb-3 p-3 rounded-lg ${
                            CATEGORY_COLORS[categoryInfo.value]
                          }`}
                        >
                          <div className="text-xs font-medium text-gray-600 mb-2">
                            {categoryInfo.label}
                          </div>
                          {categoryInfo.value === "OUTERWEAR" &&
                          selectedOuterwear === null ? (
                            <div className="text-xs text-gray-500 italic">
                              なし
                            </div>
                          ) : categoryItems.length === 0 ? (
                            <div className="text-xs text-gray-500 italic">
                              未選択
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {categoryItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center space-x-2 bg-white/70 rounded p-1"
                                >
                                  <div className="w-8 h-8 relative rounded overflow-hidden">
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.description || item.category}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="text-xs">{item.color}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* コーディネート情報フォーム */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                コーディネート情報
              </CardTitle>
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
                <Label htmlFor="stylingAdvice">スタイリングアドバイス</Label>
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
                onClick={handleSaveOutfit}
                disabled={
                  saving ||
                  allSelectedItems.length === 0 ||
                  !outfitData.title.trim()
                }
                className="w-full"
                size="sm"
              >
                {saving ? "保存中..." : "コーディネートを更新"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
