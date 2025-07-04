"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DeclineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecline: (reason: string) => void;
}

export function DeclineDialog({
  open,
  onOpenChange,
  onDecline,
}: DeclineDialogProps) {
  const [declineReason, setDeclineReason] = useState("");

  const handleDecline = () => {
    onDecline(declineReason);
    setDeclineReason("");
  };

  const handleCancel = () => {
    setDeclineReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>推奨を見送る</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600">
            この推奨を見送る理由をお聞かせください（任意）
          </p>
          <Textarea
            placeholder="例：予算の都合、好みに合わない、既に似たアイテムを持っているなど"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleDecline} className="flex-1">
              見送る
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                キャンセル
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
