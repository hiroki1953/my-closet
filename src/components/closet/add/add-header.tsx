import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AddHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <Link
          href="/closet"
          className="hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          クローゼット
        </Link>
        <span>/</span>
        <span>服を追加</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        新しい服を追加
      </h2>
      <p className="text-muted-foreground text-sm md:text-base">
        うーちゃんがより良いコーディネートを提案できるよう、詳細な情報を入力してください
      </p>
    </div>
  );
}
