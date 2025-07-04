"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface StylistInfo {
  id: string;
  name: string;
  email: string;
}

export function useStylist() {
  const { data: session } = useSession();
  const [stylist, setStylist] = useState<StylistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStylist() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/user/stylist`);

        if (!response.ok) {
          throw new Error("スタイリスト情報の取得に失敗しました");
        }

        const data = await response.json();
        setStylist(data.stylist);
      } catch (err) {
        console.error("Error fetching stylist:", err);
        setError(err instanceof Error ? err.message : "エラーが発生しました");
        // デフォルト値として "スタイリスト" を設定
        setStylist({ id: "", name: "スタイリスト", email: "" });
      } finally {
        setLoading(false);
      }
    }

    fetchStylist();
  }, [session?.user?.id]);

  return {
    stylist,
    loading,
    error,
    // デフォルト名を返すヘルパー関数
    getStylistName: () => stylist?.name || "スタイリスト",
  };
}
