import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ログインが必要なページの保護
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/closet") ||
    pathname.startsWith("/outfits") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/profile")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // 一般ユーザーがスタイリスト専用ページにアクセスしようとした場合
    if (pathname.startsWith("/stylist") && session.user?.role !== "STYLIST") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // スタイリスト専用ページの保護
  if (pathname.startsWith("/stylist")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    if (session.user?.role !== "STYLIST") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 認証済みユーザーがサインインページにアクセスした場合
  if (pathname.startsWith("/auth/signin") && session) {
    const redirectUrl =
      session.user?.role === "STYLIST" ? "/stylist" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/closet/:path*",
    "/outfits/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/stylist/:path*",
    "/auth/signin",
  ],
};
