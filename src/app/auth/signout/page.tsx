"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignOutPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/auth/signin",
      redirect: true,
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <CardTitle className="text-xl text-slate-900">
            ログアウトしますか？
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-slate-600 mb-2">現在ログイン中のアカウント:</p>
            <p className="font-medium text-slate-900">
              {session.user?.name || session.user?.email}
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleSignOut} className="w-full">
              ログアウト
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link
                href={
                  session.user?.role === "STYLIST" ? "/stylist" : "/dashboard"
                }
              >
                キャンセル
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              ログアウト後は再度ログインが必要になります
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
