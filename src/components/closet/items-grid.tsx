// アイテムグリッド（サーバーコンポーネント）
import { TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "./empty-state";
import { categoryLabels, type CategoryKey } from "./category-tabs";
import { ClothingItemCard } from "./clothing-item-card";

export interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DISPOSED" | "ROOMWEAR";
  createdAt: string;
  evaluations?: {
    id: string;
    evaluation: "NECESSARY" | "UNNECESSARY" | "KEEP";
    comment: string;
    createdAt: string;
    stylist: {
      name: string;
    };
  }[];
}

interface ItemsGridProps {
  items: ClothingItem[];
  selectedCategory: string;
  onItemUpdate?: () => void; // アイテム更新時のコールバック
}

export function ItemsGrid({
  items,
  selectedCategory,
  onItemUpdate,
}: ItemsGridProps) {
  const filteredItems =
    selectedCategory === "ALL"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <>
      {Object.keys(categoryLabels).map((category) => (
        <TabsContent key={category} value={category}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ClothingItemCard
                  key={item.id}
                  item={item}
                  categoryLabel={
                    categoryLabels[item.category as CategoryKey] ||
                    item.category
                  }
                  onItemUpdate={onItemUpdate}
                />
              ))
            ) : (
              <EmptyState
                selectedCategory={selectedCategory}
                categoryLabel={
                  categoryLabels[selectedCategory as CategoryKey] || "アイテム"
                }
              />
            )}
          </div>
        </TabsContent>
      ))}
    </>
  );
}
