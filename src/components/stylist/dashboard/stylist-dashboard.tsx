"use client";

import { useState, useEffect } from "react";
import { StatsOverview } from "./stats-overview";
import { UserStatusGrid } from "./user-status-grid";

interface UserStatus {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  height?: number;
  age?: number;
  itemsCount: number;
  outfitsCount: number;
  unevaluatedItems: number;
  pendingRecommendations: number;
  completedRecommendations: number;
  lastActivity: string;
  lastOutfitDate?: string;
  daysSinceLastOutfit?: number;
  priorityLevel: "high" | "medium" | "low";
  priorityScore: number;
  needsAttention: boolean;
}

interface DashboardData {
  totalUsers: number;
  pendingEvaluations: number;
  totalOutfits: number;
  totalRecommendations: number;
  users: UserStatus[];
  summary: {
    highPriorityUsers: number;
    usersNeedingAttention: number;
    usersWithoutOutfits: number;
    totalUnevaluatedItems: number;
  };
}

export function StylistDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/stylist/dashboard");
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          スタイリストダッシュボード
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          担当ユーザーの管理とスタイリング業務の状況確認
        </p>
      </div>

      {/* 統計情報 */}
      <StatsOverview
        totalUsers={data?.totalUsers || 0}
        pendingEvaluations={data?.pendingEvaluations || 0}
        totalOutfits={data?.totalOutfits || 0}
        totalRecommendations={data?.totalRecommendations || 0}
      />

      {/* ユーザー状態一覧 */}
      {data?.users && <UserStatusGrid users={data.users} />}
    </div>
  );
}
