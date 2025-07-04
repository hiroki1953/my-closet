"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MainActionSection } from "@/components/dashboard/main-action-section";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { StylistOutfitsWidget } from "@/components/dashboard/stylist-outfits-widget";
import { PurchaseRecommendationsWidget } from "@/components/dashboard/purchase-recommendations-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [profileCompletion, setProfileCompletion] = useState<{
    percentage: number;
    missingFields: string[];
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.completion) {
            setProfileCompletion(data.completion);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile completion:", error);
      }
    };

    if (session) {
      fetchProfileCompletion();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection userName={session.user?.name || "ユーザー"} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-3 space-y-6">
            <MainActionSection />
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1 space-y-6">
            <PurchaseRecommendationsWidget />
            {profileCompletion && profileCompletion.percentage < 80 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📝 プロフィールを完成させましょう
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>完成度</span>
                      <span className="font-semibold">
                        {profileCompletion.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={profileCompletion.percentage}
                      className="h-2"
                    />
                  </div>

                  {profileCompletion.missingFields.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        未入力の項目:
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {profileCompletion.missingFields.map((field, index) => (
                          <li key={index}>• {field}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link href="/profile">
                    <Button size="sm" className="w-full">
                      プロフィールを完成させる
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            <StylistOutfitsWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
