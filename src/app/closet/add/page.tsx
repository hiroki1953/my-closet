"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AddHeader } from "@/components/closet/add/add-header";
import { AddForm } from "@/components/closet/add/add-form";
import { LoadingState } from "@/components/closet/add/loading-state";

export default function AddClothing() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  if (status === "loading") {
    return <LoadingState />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="closet" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <AddHeader />
          <AddForm />
        </div>
      </main>
    </div>
  );
}
