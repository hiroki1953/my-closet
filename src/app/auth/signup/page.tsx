"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Stylist {
  id: string;
  name: string;
  email: string;
  profile?: Record<string, unknown>;
}

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER" as "USER" | "STYLIST",
    stylistId: "",
  });
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [stylistsLoading, setStylistsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // スタイリスト一覧を取得
  useEffect(() => {
    const fetchStylists = async () => {
      if (formData.role === "USER") {
        setStylistsLoading(true);
        try {
          const response = await fetch("/api/stylists");
          if (response.ok) {
            const data = await response.json();
            setStylists(data);
          }
        } catch (error) {
          console.error("スタイリスト取得エラー:", error);
        } finally {
          setStylistsLoading(false);
        }
      }
    };

    fetchStylists();
  }, [formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (value: "USER" | "STYLIST") => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      stylistId: value === "STYLIST" ? "" : prev.stylistId, // スタイリストの場合はstylistIdをクリア
    }));
  };

  const handleStylistChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      stylistId: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // パスワード確認
    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      setLoading(false);
      return;
    }

    try {
      // ユーザー登録
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          stylistId: formData.role === "USER" ? formData.stylistId : undefined,
        }),
      });

      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        setError(data.error || "登録に失敗しました");
        return;
      }

      // 登録成功後、自動ログイン
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("ログインに失敗しました");
      } else {
        // ロールに応じてリダイレクト
        if (formData.role === "STYLIST") {
          router.push("/stylist");
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">My Closet</h1>
          </div>
          <p className="text-muted-foreground">専属スタイリストがサポート</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>新規登録</CardTitle>
            <CardDescription>
              アカウントを作成してMy Closetを始めましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">お名前</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="田中太郎"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">アカウントタイプ</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="アカウントタイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">一般ユーザー</SelectItem>
                    <SelectItem value="STYLIST">スタイリスト</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.role === "STYLIST"
                    ? "スタイリストとしてユーザーのコーディネートを提案します"
                    : "コーディネート提案を受けるユーザーとして登録します"}
                </p>
              </div>

              {/* スタイリスト選択（一般ユーザーの場合のみ表示） */}
              {formData.role === "USER" && (
                <div className="space-y-2">
                  <Label htmlFor="stylist">担当スタイリスト（任意）</Label>
                  <Select
                    value={formData.stylistId}
                    onValueChange={handleStylistChange}
                    disabled={stylistsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          stylistsLoading
                            ? "スタイリストを読み込み中..."
                            : "スタイリストを選択してください（任意）"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {stylists.map((stylist) => (
                        <SelectItem key={stylist.id} value={stylist.id}>
                          {stylist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    担当スタイリストを選択すると、その方からコーディネート提案を受けられます
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="6文字以上で入力"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード確認</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="再度パスワードを入力"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "登録中..." : "アカウント作成"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                既にアカウントをお持ちですか？{" "}
                <Link
                  href="/auth/signin"
                  className="text-accent hover:underline"
                >
                  ログイン
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
