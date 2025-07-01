// カテゴリタブ（クライアントコンポーネント）
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const categoryLabels = {
  ALL: "すべて",
  TOPS: "トップス",
  BOTTOMS: "ボトムス",
  SHOES: "シューズ",
  ACCESSORIES: "アクセサリー",
  OUTERWEAR: "アウター",
} as const;

export type CategoryKey = keyof typeof categoryLabels;

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  children: React.ReactNode;
}

export function CategoryTabs({
  selectedCategory,
  onCategoryChange,
  children,
}: CategoryTabsProps) {
  return (
    <Tabs
      value={selectedCategory}
      onValueChange={onCategoryChange}
      className="mb-6 md:mb-8"
    >
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <TabsTrigger
            key={key}
            value={key}
            className="text-xs md:text-sm py-2 px-1 md:px-3"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
