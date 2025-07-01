"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { OutfitsHeader } from "@/components/outfits/outfits-header";
import { OutfitsGrid } from "@/components/outfits/outfits-grid";
import { LoadingState } from "@/components/outfits/loading-state";
import type { Outfit } from "@/components/outfits/outfits-grid";

export default function OutfitsPage() {
  const { data: session, status } = useSession();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOutfits = useCallback(async () => {
    try {
      const response = await fetch("/api/outfits");
      if (response.ok) {
        const data = await response.json();
        setOutfits(data);
      }
    } catch (error) {
      console.error("Failed to fetch outfits:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchOutfits();
    }
  }, [session, fetchOutfits]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header currentPage="outfits" />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage="outfits" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <OutfitsHeader />
        <OutfitsGrid outfits={outfits} />
      </main>
    </div>
  );
}
