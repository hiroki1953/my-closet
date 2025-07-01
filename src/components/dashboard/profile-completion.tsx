import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfileCompletionProps {
  completionPercentage: number;
  missingFields: string[];
}

export function ProfileCompletion({
  completionPercentage,
  missingFields,
}: ProfileCompletionProps) {
  if (completionPercentage >= 80) {
    return null; // プロフィールがほぼ完成している場合は表示しない
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📝 プロフィールを完成させましょう
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>完成度</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {missingFields.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">未入力の項目:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              {missingFields.map((field, index) => (
                <li key={index}>• {field}</li>
              ))}
            </ul>
          </div>
        )}

        <Link href="/profile">
          <Button size="sm" className="w-full">
            プロフィールを完成させる
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
