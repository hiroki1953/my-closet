import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBagIcon } from "lucide-react";
import { useStylist } from "@/lib/hooks/use-stylist";

export function EmptyRecommendations() {
  const { getStylistName } = useStylist();
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <ShoppingBagIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          購入推奨はありません
        </h3>
        <p className="text-gray-600">
          現在、{getStylistName()}からの購入推奨はありません。
        </p>
      </CardContent>
    </Card>
  );
}
