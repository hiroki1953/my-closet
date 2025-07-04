"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { OutfitVisualDisplay } from "@/components/outfits/outfit-visual-display";
import { useStylist } from "@/lib/hooks/use-stylist";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand: string;
}

interface StylistOutfit {
  id: string;
  title: string;
  stylistComment: string | null;
  tips: string | null;
  createdAt: string;
  clothingItems: ClothingItem[];
  createdBy: {
    name: string;
    role: string;
  } | null;
}

interface StylistOutfitsWidgetProps {
  limit?: number;
}

export function StylistOutfitsWidget({ limit = 2 }: StylistOutfitsWidgetProps) {
  const [outfits, setOutfits] = useState<StylistOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const { getStylistName } = useStylist();

  useEffect(() => {
    const fetchStylistOutfits = async () => {
      try {
        const response = await fetch(
          `/api/outfits?stylist_only=true&limit=${limit}`
        );
        if (response.ok) {
          const data = await response.json();
          // スタイリストが作成したもののみフィルター
          const stylistOutfits = data.filter(
            (outfit: StylistOutfit) => outfit.createdBy?.role === "STYLIST"
          );
          setOutfits(stylistOutfits);
        }
      } catch (error) {
        console.error("Failed to fetch stylist outfits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStylistOutfits();
  }, [limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2" />
            {getStylistName()}からの提案
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-2/3 mb-3"></div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="aspect-square bg-slate-200 rounded"
                    ></div>
                  ))}
                </div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2" />
            {getStylistName()}からの提案
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <StarIcon className="h-3 w-3 mr-1" />
            NEW
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {outfits.length === 0 ? (
          <div className="text-center py-8">
            <SparklesIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">まだ提案はありません</p>
            <p className="text-sm text-slate-400 mt-1">
              {getStylistName()}からのコーディネート提案をお待ちください
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {outfit.title}
                  </h3>

                  {/* コーディネート視覚表示 */}
                  <div className="flex justify-center mb-3">
                    <OutfitVisualDisplay
                      items={outfit.clothingItems}
                      size="sm"
                      showLabels={false}
                    />
                  </div>
                </div>

                {outfit.stylistComment && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 leading-relaxed">
                      💬 {outfit.stylistComment}
                    </p>
                  </div>
                )}

                {outfit.tips && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      💡 {outfit.tips}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {new Date(outfit.createdAt).toLocaleDateString("ja-JP")}{" "}
                    提案
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/outfits/${outfit.id}`}>詳細を見る</Link>
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href="/outfits">すべての提案を見る</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
