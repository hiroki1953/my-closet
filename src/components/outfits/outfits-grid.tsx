// コーディネート一覧グリッド（サーバーコンポーネント）
import { OutfitCard } from "./outfit-card";
import { EmptyState } from "./empty-state";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
}

export interface Outfit {
  id: string;
  title: string;
  clothingItems: ClothingItem[];
  stylistComment?: string | null;
  tips?: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface OutfitsGridProps {
  outfits: Outfit[];
}

export function OutfitsGrid({ outfits }: OutfitsGridProps) {
  if (outfits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:gap-8">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
    </div>
  );
}
