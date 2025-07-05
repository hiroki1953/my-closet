# My Closet

**キャッチコピー：「うーちゃんがあなたの専属スタイリスト」**

20-30 代男性向けのクローゼット管理アプリ。専属スタイリスト「うーちゃん」がパーソナライズされたコーディネート提案を行う Web アプリケーションです。

## 🎯 ターゲットユーザー

- **プライマリ**: 20-30 代の男性
- **ペルソナ**:
  - 服に興味はないがオシャレになりたい人
  - モテたい・好印象を与えたい人
  - 垢抜けたい人
  - 自分で服を選ぶのが面倒・苦手な人

## 💎 価値提案

- **「考えなくていい」**: 服選びの悩みから完全解放
- **モテる・好印象**: 女性ウケ・ビジネスシーンでの印象向上
- **時短**: 毎朝の服選び時間ゼロ
- **コスパ**: 手持ち服の最大活用 + 無駄な買い物防止

## 🚀 主要機能

### ユーザー機能

- **クローゼット管理**: 服の写真登録とカテゴリ別管理（HEIC 対応の画像アップロード）
- **ステータス管理**: 使用中・使わない・部屋着の分類管理
- **スタイリスト評価の確認**: プロのスタイリストによるアイテム評価の閲覧
- **コーディネート閲覧**: パーソナライズされた着こなし提案の確認
- **購入推奨**: スタイリストからの購入提案の確認・管理

### スタイリスト機能（うーちゃん専用）

- **ユーザー管理**: 担当ユーザーの一覧と詳細管理
- **アイテム評価**: 服のアイテム評価（必要/不要/キープ）とコメント機能
- **コーディネート作成**: ユーザー向けの着こなし提案作成とスタイリングコメント
- **購入提案**: 新しいアイテムの購入推奨と理由説明
- **スタイリストダッシュボード**: 効率的なワークフロー管理

## 🛠 技術スタック

### フロントエンド

- **Next.js 15.3.4** - App Router 対応の React フレームワーク
- **React 19.0.0** - UI ライブラリ
- **TypeScript 5.x** - 型安全な開発
- **Tailwind CSS 3.4.17** - ユーティリティファースト CSS
- **Radix UI** - アクセシブルな UI コンポーネント
- **React Dropzone 14.3.8** - ファイルアップロード（HEIC 対応）
- **React Image Crop 11.0.10** - 画像編集機能

### バックエンド・データベース

- **Next.js Server Actions** - サーバーサイド処理
- **Prisma 6.10.1** - ORM とデータベースクライアント
- **PostgreSQL** - リレーショナルデータベース（Supabase）
- **NextAuth.js 5.0.0-beta.29** - 認証システム

### インフラ・ストレージ

- **Supabase** - データベース・認証・ストレージ
- **Vercel** - フロントエンドホスティング・デプロイ

### 開発ツール

- **ESLint 9.x** - コード品質管理
- **tsx 4.20.3** - TypeScript 実行環境
- **Zustand 5.0.6** - 軽量状態管理
- **Zod 3.25.67** - スキーマバリデーション

## セットアップ

### 1. 依存関係のインストール

```bash
## 📁 プロジェクト構成

```

my-closet/
├── prisma/ # データベース関連
│ ├── schema.prisma # Prisma スキーマ定義
│ ├── seed.ts # 初期データ投入スクリプト
│ └── migrations/ # マイグレーションファイル
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── api/ # API ルート
│ │ │ ├── auth/ # 認証 API
│ │ │ ├── clothing-items/ # 衣類管理 API
│ │ │ ├── outfits/ # コーディネート API
│ │ │ ├── stylist/ # スタイリスト機能 API
│ │ │ ├── upload/ # ファイルアップロード API
│ │ │ └── user/ # ユーザー管理 API
│ │ ├── auth/ # 認証ページ
│ │ ├── closet/ # クローゼット管理
│ │ ├── dashboard/ # ダッシュボード
│ │ ├── outfits/ # コーディネート
│ │ ├── profile/ # プロフィール
│ │ ├── recommendations/ # 購入推奨
│ │ └── stylist/ # スタイリスト機能
│ ├── components/ # 再利用可能コンポーネント
│ │ ├── closet/ # クローゼット関連
│ │ ├── dashboard/ # ダッシュボード関連
│ │ ├── layout/ # レイアウト関連
│ │ ├── outfits/ # コーディネート関連
│ │ ├── stylist/ # スタイリスト関連
│ │ └── ui/ # 基本 UI コンポーネント
│ ├── lib/ # ユーティリティ
│ │ ├── auth.ts # 認証設定
│ │ ├── image-conversion.ts # 画像変換処理
│ │ ├── prisma.ts # Prisma クライアント
│ │ └── supabase.ts # Supabase 設定
│ └── types/ # TypeScript 型定義
├── public/ # 静的ファイル
├── scripts/ # セットアップスクリプト
└── docs/ # ドキュメント

````

## 🏗️ セットアップ

### 前提条件
- Node.js 18.17.0以上
- npm または yarn
- PostgreSQLデータベース（Supabase推奨）

### 1. インストール

```bash
git clone [repository-url]
cd my-closet
npm install
````

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
# データベース
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"

# NextAuth
NEXTAUTH_SECRET="xxx"
NEXTAUTH_URL="http://localhost:3000"

# アプリケーション設定
NEXT_PUBLIC_MAX_FILE_SIZE=15728640  # 15MB
NEXT_PUBLIC_APP_NAME="SenseUP"
```

### 3. データベースセットアップ

```bash
# Prismaクライアント生成
npx prisma generate

# データベーススキーマ適用
npx prisma db push

# 初期データ投入
npm run db:seed

# または統合セットアップ
npm run setup:dev
```

### 4. 開発サーバー起動

```bash
# 開発サーバー起動
npm run dev

# または完全セットアップ + 開発サーバー
npm run dev:full
```

## 🚀 開発・デプロイ

### スクリプト一覧

```bash
# 開発
npm run dev              # Next.js開発サーバー起動
npm run dev:full         # 完全セットアップ + 開発サーバー

# ビルド・本番
npm run build            # Viteビルド（※現在はNext.jsと併用）
npm run preview          # Viteプレビュー
npm run start            # Next.js本番サーバー

# データベース
npm run db:push          # スキーマをデータベースに適用
npm run db:seed          # 初期データ投入
npm run db:migrate       # マイグレーション実行

# セットアップ
npm run setup:dev        # 開発環境セットアップ
npm run setup:storage    # Supabaseストレージセットアップ
npm run test:storage     # ストレージポリシーテスト

# その他
npm run lint             # ESLintチェック
```

### Vercel デプロイ

1. **GitHub リポジトリとの連携**
2. **環境変数の設定**（Vercel ダッシュボード）
3. **自動デプロイの確認**

### 本番環境の環境変数

```env
# 本番データベース（Supabase）
DATABASE_URL="postgresql://postgres.xxx:xxx@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=30"
DIRECT_URL="postgresql://postgres.xxx:xxx@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5"

# 本番NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="production-secret"
```

## 🔧 特徴的な技術実装

### 画像アップロード・変換

- **HEIC 対応**: iPhone の HEIC 形式を自動的に JPEG 変換
- **クライアントサイド最適化**: Canvas API による画像圧縮・リサイズ
- **複数フォーマット対応**: JPG, PNG, WebP, HEIC, GIF, BMP 等

### データベース設計

- **Prisma ORM**: 型安全なデータベースアクセス
- **PostgreSQL**: Supabase によるスケーラブルなデータベース
- **コネクションプール**: pgbouncer による効率的な接続管理

### 認証・セキュリティ

- **NextAuth.js**: モダンな認証システム
- **ロールベースアクセス制御**: USER/STYLIST の権限管理
- **Session 管理**: 安全なセッション処理

### 状態管理

- **Zustand**: 軽量で使いやすい状態管理
- **React Context**: 認証状態のグローバル管理
- **Server Actions**: サーバーサイド処理の統合

## 📱 主要画面・機能

### ユーザー画面

- **ダッシュボード**: 今日のコーデ、週間予定、うーちゃんからの提案
- **クローゼット**: 服の一覧・カテゴリフィルター・検索
- **服登録**: カメラ撮影・ドラッグ&ドロップアップロード
- **コーディネート**: 着こなし提案の詳細・理由説明

### スタイリスト画面

- **スタイリストダッシュボード**: 担当ユーザー管理・作業効率化
- **アイテム評価**: 個別評価・コメント機能
- **コーディネート作成**: 組み合わせ提案・スタイリングアドバイス
- **購入提案**: 推奨アイテム・理由・優先度設定

## 🎨 デザインシステム

### カラーパレット

- **メイン**: ダークネイビー (#1a202c)
- **アクセント**: ブルー (#3b82f6)
- **サブ**: グレー系 (#f7fafc, #e2e8f0)

### コンポーネント設計

- **Radix UI**: アクセシブルな基盤コンポーネント
- **Tailwind CSS**: ユーティリティファーストアプローチ
- **CVA**: 条件付きスタイリングの型安全性

## 🔄 開発フロー

### Git ワークフロー

```bash
# 機能ブランチ作成
git checkout -b feature/新機能名

# 開発・コミット
git add .
git commit -m "feat: 新機能の実装"

# プッシュ・プルリクエスト
git push origin feature/新機能名
```

### コード品質

- **TypeScript**: 型安全性の確保
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット統一（推奨）
- **Prisma**: データベースの型安全性

## 📚 ドキュメント

### API 設計

- [スタイリスト API 設計](docs/stylist-api-design.md)
- [環境構築ガイド](docs/environment-setup.md)

### 実装レポート

- [スタイリスト機能実装](docs/stylist-implementation-report.md)

## 🤝 貢献ガイド

### 開発ルール

1. **ブランチ戦略**: feature/xxx から main へのプルリクエスト
2. **コミットメッセージ**: Conventional Commits 準拠
3. **テスト**: 新機能には適切なテストを追加
4. **ドキュメント**: 重要な変更はドキュメント更新

### 課題・要望

GitHub の Issues で管理：

- **Bug 報告**: バグの詳細と再現手順
- **Feature 要望**: 新機能の詳細な要求仕様
- **改善提案**: UI/UX、パフォーマンス改善

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**開発チーム**: SenseUP Development Team
**最終更新**: 2025 年 7 月 5 日
**バージョン**: 0.1.0

- `SUPABASE_SERVICE_ROLE_KEY`: Supabase のサービスロールキー（本番用）

## 環境分離

このプロジェクトは開発環境と本番環境で異なる Supabase プロジェクトを使用します：

- **開発環境**: 新しく作成した Supabase プロジェクト
- **本番環境**: 既存の Supabase プロジェクト（vvkcoufkuecqailekaeq）

### 開発環境の初期セットアップ

新しい開発者がプロジェクトに参加する場合：

1. 新しい Supabase プロジェクトを作成
2. `.env`ファイルを作成し、開発用の Supabase 情報を設定
3. 開発環境のセットアップを実行:

```bash
npm run setup:dev    # Supabaseバケット等のセットアップ
npm run db:push      # データベーススキーマの適用
npm run db:seed      # 開発用データの投入
npm run dev          # 開発サーバー起動
```

または一括実行:

```bash
npm run dev:full     # 上記すべてを一括実行
```

## ユーザーガイド

### 初回セットアップ

1. アカウント登録を行う
2. プロフィール情報（身長、体重、好みのスタイル）を入力
3. クローゼットに服を登録開始

### 基本的な使い方

1. **服の登録**: カメラで服を撮影し、カテゴリを選択して登録
2. **スタイリスト評価の確認**: 登録した服に対するプロの評価を確認
3. **ステータス管理**: 服を「使用中」「使わない」「部屋着」に分類
4. **コーディネート確認**: スタイリストからの着こなし提案を確認

### スタイリスト用機能

スタイリストアカウントでログインすると以下の機能が利用できます：

1. **ユーザー管理**: 担当ユーザーの一覧表示と詳細確認
2. **アイテム評価**: ユーザーの服に対する評価とコメント
3. **コーディネート作成**: ユーザー向けの着こなし提案作成
4. **購入提案**: 新しいアイテムの購入推奨

## 開発情報

### プロジェクト構造

```
src/
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント
├── lib/                    # ユーティリティとライブラリ
├── types/                  # TypeScript型定義
prisma/                     # Prismaスキーマとマイグレーション
public/                     # 静的ファイル
```

### 主要コンポーネント

- `ClothingItemCard`: 服のアイテム表示カード
- `ItemsGrid`: 服の一覧表示グリッド
- `OutfitCard`: コーディネート表示カード
- `UserEvaluationView`: ユーザー向け評価表示
- `StylistDashboard`: スタイリスト用ダッシュボード

### API エンドポイント

- `GET /api/clothing-items`: 服のアイテム一覧取得
- `PATCH /api/clothing-items/[id]`: アイテムの更新
- `GET /api/outfits`: コーディネート一覧取得
- `GET /api/user/stats`: ユーザー統計情報取得

## ライセンス

このプロジェクトはプライベートプロジェクトです。
