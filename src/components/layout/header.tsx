"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useLogout } from "@/lib/hooks/useLogout";

interface HeaderProps {
  currentPage: "dashboard" | "closet" | "outfits" | "messages" | "profile";
}

const getNavigationItems = (userRole?: string) => {
  if (userRole === "STYLIST") {
    return [
      {
        href: "/stylist",
        label: "ダッシュボード",
        icon: "📊",
        key: "dashboard",
      },
      {
        href: "/stylist/users",
        label: "ユーザー管理",
        icon: "👥",
        key: "users",
      },
    ];
  }

  return [
    {
      href: "/dashboard",
      label: "ダッシュボード",
      icon: "📊",
      key: "dashboard",
    },
    { href: "/closet", label: "クローゼット", icon: "👔", key: "closet" },
    { href: "/outfits", label: "コーディネート", icon: "✨", key: "outfits" },
    { href: "/profile", label: "プロフィール", icon: "👤", key: "profile" },
  ];
};

export function Header({ currentPage }: HeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useLogout();

  const navigationItems = getNavigationItems(session?.user?.role);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await logout({ showConfirm: true });
    } finally {
      // ログアウトが成功した場合はリダイレクトされるため、
      // エラーの場合のみここに到達する
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* ロゴ */}
          <Link
            href={session?.user?.role === "STYLIST" ? "/stylist" : "/dashboard"}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold text-primary">My Closet</h1>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`transition-colors text-sm ${
                  currentPage === item.key
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* デスクトップユーザーメニュー */}
          <div className="hidden md:flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent text-white text-sm">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "ログアウト中..." : "ログアウト"}
            </Button>
          </div>

          {/* モバイルメニューボタン */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                {/* ユーザー情報 */}
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent text-white">
                      {session?.user?.name?.[0] ||
                        session?.user?.email?.[0] ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-primary">
                      {session?.user?.name || session?.user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      My Closet ユーザー
                    </p>
                  </div>
                </div>

                {/* ナビゲーションメニュー */}
                <nav className="flex flex-col space-y-3">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        currentPage === item.key
                          ? "text-accent font-medium bg-blue-50"
                          : "text-muted-foreground hover:text-primary hover:bg-slate-50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-base">
                        {item.icon} {item.label}
                      </span>
                    </Link>
                  ))}
                </nav>

                {/* ログアウトボタン */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "ログアウト中..." : "ログアウト"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
