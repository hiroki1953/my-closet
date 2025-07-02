# My Closet（マイクローゼット）

うーちゃんがあなたの専属スタイリストとして、20-30 代男性向けのクローゼット管理とコーディネート提案を行う Web アプリケーションです。

## 機能概要

### ユーザー機能

- **クローゼット管理**: 服の写真登録とカテゴリ別管理
- **ステータス管理**: 使用中・使わない・部屋着の分類管理
- **スタイリスト評価の確認**: プロのスタイリストによるアイテム評価の閲覧
- **コーディネート閲覧**: パーソナライズされた着こなし提案の確認

### スタイリスト機能

- **ユーザー管理**: 担当ユーザーの一覧と詳細管理
- **アイテム評価**: 服のアイテム評価（必要/不要/キープ）とコメント
- **コーディネート作成**: ユーザー向けの着こなし提案作成
- **購入提案**: 新しいアイテムの購入推奨

## 技術スタック

- **フロントエンド**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **バックエンド**: Next.js Server Actions, Prisma ORM
- **データベース**: PostgreSQL
- **認証**: NextAuth.js
- **画像ストレージ**: Supabase Storage
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成し、必要な環境変数を設定してください：

```bash
cp .env.example .env.local
```

### 3. データベースのセットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーション
npx prisma db push

# 初期データの投入
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

## デプロイ

### Vercel でのデプロイ

1. **Vercel アカウントの作成**: [vercel.com](https://vercel.com) でアカウントを作成
2. **GitHub リポジトリとの連携**: プロジェクトを GitHub にプッシュ
3. **Vercel でプロジェクトをインポート**: Vercel で GitHub リポジトリを選択
4. **環境変数の設定**: Vercel の設定画面で環境変数を追加
5. **データベースの設定**: 本番用 PostgreSQL データベースを設定

### 必要な環境変数

#### 開発環境 (.env)

- `DATABASE_URL`: PostgreSQL データベースの URL（開発用）
- `DIRECT_URL`: PostgreSQL データベースの直接接続 URL（開発用）
- `NEXTAUTH_URL`: http://localhost:3000
- `AUTH_SECRET`: NextAuth.js のシークレットキー
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL（開発用）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の匿名キー（開発用）
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase のサービスロールキー（開発用）

#### 本番環境 (Vercel 環境変数)

- `DATABASE_URL`: PostgreSQL データベースの URL（本番用）
- `DIRECT_URL`: PostgreSQL データベースの直接接続 URL（本番用）
- `NEXTAUTH_URL`: https://your-app.vercel.app
- `AUTH_SECRET`: NextAuth.js のシークレットキー
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL（本番用）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の匿名キー（本番用）
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
