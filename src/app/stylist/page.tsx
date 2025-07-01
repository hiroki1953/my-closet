"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StylistDashboard } from "@/components/stylist/dashboard/stylist-dashboard";
import { LoadingState } from "@/components/stylist/loading-state";

export default function StylistPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (status === "authenticated" && session?.user?.role !== "STYLIST") {
      redirect("/dashboard"); // 通常ユーザーは通常のダッシュボードへ
    }
  }, [status, session]);

  if (status === "loading") {
    return <LoadingState />;
  }

  if (!session || session.user?.role !== "STYLIST") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage="dashboard" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <StylistDashboard />
      </main>
    </div>
  );
}
