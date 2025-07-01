"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ClosetHeader } from "@/components/closet/closet-header";
import { CategoryTabs } from "@/components/closet/category-tabs";
import { ItemsGrid } from "@/components/closet/items-grid";
import { ClosetStats } from "@/components/closet/closet-stats";
import { LoadingState } from "@/components/closet/loading-state";
import type { ClothingItem } from "@/components/closet/items-grid";

export default function Closet() {
  const { data: session, status } = useSession();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ACTIVE" | "INACTIVE" | "ROOMWEAR"
  >("ACTIVE");
  const [loading, setLoading] = useState(true);

  const fetchClothingItems = useCallback(async () => {
    if (!session) return;

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") {
        params.append("category", selectedCategory);
      }
      params.append("status", statusFilter);

      const response = await fetch(`/api/clothing-items?${params}`);
      if (response.ok) {
        const data = await response.json();
        // データが配列であることを確認
        setClothingItems(Array.isArray(data) ? data : []);
      } else {
        setClothingItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch clothing items:", error);
      setClothingItems([]);
    } finally {
      setLoading(false);
    }
  }, [session, selectedCategory, statusFilter]);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    fetchClothingItems();
  }, [fetchClothingItems]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header currentPage="closet" />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage="closet" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <ClosetHeader
          totalItems={clothingItems.length}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        >
          <ItemsGrid
            items={clothingItems}
            selectedCategory={selectedCategory}
            onItemUpdate={fetchClothingItems}
          />
        </CategoryTabs>

        <ClosetStats items={clothingItems} />
      </main>
    </div>
  );
}
