// クローゼットヘッダー（サーバーコンポーネント）
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClosetHeaderProps {
  totalItems: number;
  statusFilter: "ACTIVE" | "INACTIVE" | "ROOMWEAR";
  onStatusFilterChange: (status: "ACTIVE" | "INACTIVE" | "ROOMWEAR") => void;
}

export function ClosetHeader({
  totalItems,
  statusFilter,
  onStatusFilterChange,
}: ClosetHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          マイクローゼット
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          {totalItems > 0
            ? `${totalItems}点のアイテムをカテゴリ別に管理しましょう`
            : "あなたの服をカテゴリ別に管理しましょう"}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">使用中</SelectItem>
            <SelectItem value="INACTIVE">使わない</SelectItem>
            <SelectItem value="ROOMWEAR">部屋着</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild className="self-start sm:self-auto">
          <Link href="/closet/add">
            <span className="mr-2">+</span>
            服を追加
          </Link>
        </Button>
      </div>
    </div>
  );
}
