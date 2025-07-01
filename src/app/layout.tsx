import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Closet（マイクロ） - うーちゃんがあなたの専属スタイリスト",
  description:
    "20-30代男性向けのクローゼット管理アプリ。うーちゃんがパーソナライズされたコーディネート提案をします。",
  keywords: [
    "ファッション",
    "コーディネート",
    "スタイリスト",
    "メンズファッション",
    "クローゼット管理",
  ],
  authors: [{ name: "My Closet Team" }],
  robots: "index, follow",
  openGraph: {
    title: "My Closet（マイクロ） - うーちゃんがあなたの専属スタイリスト",
    description: "20-30代男性向けのクローゼット管理アプリ",
    type: "website",
    locale: "ja_JP",
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} antialiased`}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
