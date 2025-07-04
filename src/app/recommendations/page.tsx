"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { RecommendationsHeader } from "@/components/recommendations/recommendations-header";
import { RecommendationsList } from "@/components/recommendations/recommendations-list";
import { EmptyRecommendations } from "@/components/recommendations/empty-recommendations";
import { useRecommendations } from "@/lib/hooks/use-recommendations";

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const { recommendations, loading, markAsViewed, decline } =
    useRecommendations();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (status === "authenticated" && session?.user?.role === "STYLIST") {
      redirect("/stylist");
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role === "STYLIST") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="dashboard" />

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6">
          <RecommendationsHeader />

          {recommendations.length === 0 ? (
            <EmptyRecommendations />
          ) : (
            <RecommendationsList
              recommendations={recommendations}
              onMarkAsViewed={markAsViewed}
              onDecline={decline}
            />
          )}
        </div>
      </main>
    </div>
  );
}
