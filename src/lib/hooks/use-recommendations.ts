import { useState, useEffect } from "react";

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

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<
    PurchaseRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/user/recommendations");
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const markAsViewed = async (recommendationId: string) => {
    try {
      const response = await fetch(
        `/api/user/recommendations/${recommendationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "VIEWED" }),
        }
      );

      if (response.ok) {
        setRecommendations((prev) =>
          prev.map((rec) =>
            rec.id === recommendationId ? { ...rec, status: "VIEWED" } : rec
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark as viewed:", error);
    }
  };

  const decline = async (recommendationId: string, declineReason: string) => {
    try {
      const response = await fetch(
        `/api/user/recommendations/${recommendationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "DECLINED",
            declineReason: declineReason,
          }),
        }
      );

      if (response.ok) {
        setRecommendations((prev) =>
          prev.map((rec) =>
            rec.id === recommendationId ? { ...rec, status: "DECLINED" } : rec
          )
        );
      }
    } catch (error) {
      console.error("Failed to decline recommendation:", error);
    }
  };

  return {
    recommendations,
    loading,
    markAsViewed,
    decline,
  };
}
