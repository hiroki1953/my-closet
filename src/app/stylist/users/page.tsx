"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LoadingState } from "@/components/stylist/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UserIcon, ShirtIcon, SparklesIcon } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  profile: {
    height?: number;
    weight?: number;
    age?: number;
    style?: string;
    bodyType?: string;
    lifestyle?: string;
    favoriteColors?: string[];
  } | null;
  _count: {
    clothingItems: number;
    outfits: number;
  };
  createdAt: string;
}

export default function StylistUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (status === "authenticated" && session?.user?.role !== "STYLIST") {
      redirect("/dashboard");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/stylist/users");
        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "STYLIST") {
      fetchUsers();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <LoadingState />;
  }

  if (!session || session.user?.role !== "STYLIST") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentPage="dashboard" />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">ユーザー管理</h1>
            <Button asChild variant="outline">
              <Link href="/stylist">ダッシュボードに戻る</Link>
            </Button>
          </div>

          {users.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <UserIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  ユーザーが見つかりません
                </h3>
                <p className="text-slate-600">
                  現在管理しているユーザーはいません。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card
                  key={user.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <ShirtIcon className="h-4 w-4 text-slate-500 mr-1" />
                          <span className="text-2xl font-bold text-slate-900">
                            {user._count.clothingItems}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">アイテム</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <SparklesIcon className="h-4 w-4 text-slate-500 mr-1" />
                          <span className="text-2xl font-bold text-slate-900">
                            {user._count.outfits}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">コーデ</p>
                      </div>
                    </div>

                    {user.profile && (
                      <div className="space-y-2">
                        {user.profile.style && (
                          <Badge variant="secondary">
                            {user.profile.style}
                          </Badge>
                        )}
                        {user.profile.age && (
                          <p className="text-sm text-slate-600">
                            年齢: {user.profile.age}歳
                          </p>
                        )}
                        {user.profile.height && (
                          <p className="text-sm text-slate-600">
                            身長: {user.profile.height}cm
                          </p>
                        )}
                      </div>
                    )}

                    <div className="pt-2 space-y-2">
                      <Button asChild className="w-full" size="sm">
                        <Link href={`/stylist/users/${user.id}`}>
                          詳細を確認
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Link href={`/stylist/users/${user.id}/closet`}>
                          クローゼットを確認
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
