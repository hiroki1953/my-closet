import { RecommendationCard } from "./recommendation-card";

interface PurchaseRecommendation {
  id: string;
  itemType: string;
  description: string;
  reason: string;
  productUrl?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "VIEWED" | "PURCHASED" | "DECLINED";
  createdAt: string;
  stylist: {
    name: string;
  };
}

interface RecommendationsListProps {
  recommendations: PurchaseRecommendation[];
  onMarkAsViewed: (id: string) => void;
  onDecline: (id: string, reason: string) => void;
}

export function RecommendationsList({
  recommendations,
  onMarkAsViewed,
  onDecline,
}: RecommendationsListProps) {
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <RecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          onMarkAsViewed={onMarkAsViewed}
          onDecline={onDecline}
        />
      ))}
    </div>
  );
}
