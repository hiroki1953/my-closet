# My Closet（マイクローゼット）

うーちゃんがあなたの専属スタイリストとして、20-30代男性向けのクローゼット管理とコーディネート提案を行うWebアプリケーションです。

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

### Vercelでのデプロイ

1. **Vercelアカウントの作成**: [vercel.com](https://vercel.com) でアカウントを作成
2. **GitHubリポジトリとの連携**: プロジェクトをGitHubにプッシュ
3. **Vercelでプロジェクトをインポート**: VercelでGitHubリポジトリを選択
4. **環境変数の設定**: Vercelの設定画面で環境変数を追加
5. **データベースの設定**: 本番用PostgreSQLデータベースを設定

### 必要な環境変数

- `DATABASE_URL`: PostgreSQLデータベースのURL
- `NEXTAUTH_URL`: アプリケーションのURL
- `NEXTAUTH_SECRET`: NextAuth.jsのシークレットキー
- `NEXT_PUBLIC_SUPABASE_URL`: Supabaseプロジェクトの URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー

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
