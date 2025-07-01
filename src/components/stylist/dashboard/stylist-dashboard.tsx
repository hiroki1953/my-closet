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

      {/* 優先対応アラート */}
      {data?.summary.highPriorityUsers &&
        data.summary.highPriorityUsers > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  対応が必要なユーザーがいます
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {data.summary.highPriorityUsers}
                    名のユーザーが対応を必要としています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
