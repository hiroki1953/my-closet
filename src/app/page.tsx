import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const session = await auth();

  // 認証済みユーザーは役割に応じてリダイレクト
  if (session) {
    if (session.user?.role === "STYLIST") {
      redirect("/stylist");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ヘッダー */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold text-primary">My Closet</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              機能
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              うーちゃんとは
            </Link>
          </nav>
          <div className="flex space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">ログイン</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">無料で始める</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge
            variant="secondary"
            className="mb-6 bg-accent/10 text-accent border-accent/20"
          >
            うーちゃんがあなたの専属スタイリスト
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            もう服選びで
            <br />
            <span className="text-accent">悩まない</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            手持ちの服をアップロードするだけで、専門コーディネーター「うーちゃん」が
            <br />
            あなたにぴったりのコーディネートを提案します
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/auth/signup">
                無料で始める
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              デモを見る
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ※ クレジットカード不要・3分で完了
          </p>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">
            なぜMy Closetが選ばれるのか
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            毎朝の服選びから解放される3つの理由
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <CardTitle className="text-xl">考えなくていい</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed">
                うーちゃんが毎日のコーディネートを考えるので、
                あなたは何も悩む必要がありません
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💫</span>
              </div>
              <CardTitle className="text-xl">モテる・好印象</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed">
                女性ウケやビジネスシーンでの印象を 意識したコーディネート提案
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle className="text-xl">時短・コスパ</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed">
                手持ち服の最大活用で無駄な買い物を防止。
                毎朝の服選び時間もゼロに
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* うーちゃん紹介セクション */}
      <section id="about" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👩‍💼</span>
            </div>
            <h2 className="text-4xl font-bold text-primary mb-6">
              専属スタイリスト「うーちゃん」
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              あなた専用のコーディネーターとして、手持ちの服から最適な組み合わせを提案。
              <br />
              ファッションの知識がなくても、プロレベルのスタイリングが可能です。
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-accent">✨</span>
                    パーソナライズ提案
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    あなたの体型、好み、ライフスタイルに合わせたコーディネートを提案します
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-accent">💬</span>
                    24時間サポート
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    いつでもチャットで相談可能。スタイリングの疑問をすぐに解決できます
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            今すぐスタイリストライフを始めよう
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            3分で登録完了。明日の朝から服選びに悩まない生活が始まります。
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/auth/signup">
              無料で始める
              <span className="ml-2">→</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">My Closet</span>
            </div>
            <div className="flex space-x-6 text-sm text-white/70">
              <Link href="#" className="hover:text-white transition-colors">
                利用規約
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                お問い合わせ
              </Link>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
            © 2025 My Closet. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
