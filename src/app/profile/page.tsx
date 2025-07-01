"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { ProfileImageUpload } from "@/components/profile/profile-image-upload";

interface UserProfile {
  id?: string;
  height?: number;
  weight?: number;
  age?: number;
  bodyType?: string;
  personalColor?: string;
  profileImageUrl?: string;
  stylePreference?: string;
  concerns?: string;
  goals?: string;
  budget?: string;
  lifestyle?: string;
  isPublic: boolean;
}

const bodyTypeOptions = [
  { value: "STRAIGHT", label: "ストレート" },
  { value: "WAVE", label: "ウェーブ" },
  { value: "NATURAL", label: "ナチュラル" },
  { value: "UNKNOWN", label: "わからない" },
];

const personalColorOptions = [
  { value: "SPRING", label: "スプリング（イエベ春）" },
  { value: "SUMMER", label: "サマー（ブルベ夏）" },
  { value: "AUTUMN", label: "オータム（イエベ秋）" },
  { value: "WINTER", label: "ウィンター（ブルベ冬）" },
  { value: "UNKNOWN", label: "わからない" },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    isPublic: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        alert("プロフィールを保存しました");
      } else {
        alert("保存に失敗しました");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="dashboard" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>
          <p className="text-gray-600 mt-1">
            あなたに合ったスタイリング提案のために、詳細情報を教えてください
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">
              💡 より良い提案のために
            </h2>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 身長・体重：サイズ感の正確な提案に必要です</li>
              <li>
                • 骨格・パーソナルカラー：似合うデザインや色の提案に活用します
              </li>
              <li>• 顔写真：全体のバランスを考慮した提案ができます</li>
              <li>
                • 目標・悩み：あなたの理想に近づくスタイリングを提案します
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* プロフィール写真 */}
              <ProfileImageUpload
                currentImageUrl={profile.profileImageUrl}
                onImageChange={(imageUrl) =>
                  setProfile({ ...profile, profileImageUrl: imageUrl })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height">身長 (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={profile.height || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        height: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="weight">体重 (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="60"
                    value={profile.weight || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        weight: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="age">年齢</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={profile.age || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        age: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 体型・カラー分析 */}
          <Card>
            <CardHeader>
              <CardTitle>体型・カラー分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>骨格タイプ</Label>
                  <Select
                    value={profile.bodyType || ""}
                    onValueChange={(value) =>
                      setProfile({ ...profile, bodyType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="骨格タイプを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>パーソナルカラー</Label>
                  <Select
                    value={profile.personalColor || ""}
                    onValueChange={(value) =>
                      setProfile({ ...profile, personalColor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="パーソナルカラーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {personalColorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* スタイルの好み・目標 */}
          <Card>
            <CardHeader>
              <CardTitle>スタイルの好み・目標</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stylePreference">好みのスタイル</Label>
                <Textarea
                  id="stylePreference"
                  placeholder="例：カジュアル、きれいめ、ストリート系など"
                  value={profile.stylePreference || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, stylePreference: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="goals">なりたいイメージ・目標</Label>
                <Textarea
                  id="goals"
                  placeholder="例：女性にモテたい、ビジネスシーンで好印象を与えたい、垢抜けたいなど"
                  value={profile.goals || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, goals: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="concerns">気になる点・コンプレックス</Label>
                <Textarea
                  id="concerns"
                  placeholder="例：スタイルを良く見せたい、顔を小さく見せたいなど"
                  value={profile.concerns || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, concerns: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* ライフスタイル・予算 */}
          <Card>
            <CardHeader>
              <CardTitle>ライフスタイル・予算</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lifestyle">ライフスタイル</Label>
                <Textarea
                  id="lifestyle"
                  placeholder="例：オフィス勤務、リモートワーク、営業職、学生など"
                  value={profile.lifestyle || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, lifestyle: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="budget">予算感</Label>
                <Textarea
                  id="budget"
                  placeholder="例：1着1万円以下、季節ごとに5万円程度など"
                  value={profile.budget || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, budget: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* 保存ボタン */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "プロフィールを保存"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
