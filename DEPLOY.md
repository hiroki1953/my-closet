# My Closet デプロイガイド

このドキュメントはMy ClosetアプリケーションをVercelにデプロイする手順を説明します。

## 前提条件

1. Vercelアカウント
2. GitHubアカウント
3. PostgreSQLデータベース（Vercel Postgres、Railway、Supabaseなど）
4. Supabaseアカウント（画像ストレージ用）

## デプロイ手順

### 1. GitHubリポジトリの準備

```bash
# GitHubリポジトリを作成し、コードをプッシュ
git init
git add .
git commit -m "Initial commit: My Closet application"
git branch -M main
git remote add origin https://github.com/your-username/my-closet.git
git push -u origin main
```

### 2. データベースの準備

#### Option A: Vercel Postgres
1. Vercelのダッシュボードで「Storage」→「Create Database」
2. 「Postgres」を選択
3. データベース名を設定（例：my-closet-db）
4. 作成後、`DATABASE_URL`をコピー

#### Option B: Railway
1. [Railway](https://railway.app)でアカウント作成
2. 「New Project」→「Provision PostgreSQL」
3. 環境変数タブで`DATABASE_URL`をコピー

#### Option C: Supabase
1. [Supabase](https://supabase.com)でプロジェクト作成
2. Settings → Database → Connection stringをコピー

### 3. Supabase Storage設定（画像ストレージ用）

1. Supabaseプロジェクトでストレージバケット作成
2. バケット名：`clothing-images`
3. Public accessを有効化
4. API設定から以下をコピー：
   - Project URL
   - Anon key
   - Service role key

### 4. Vercelでのデプロイ

1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 5. 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を追加：

```
DATABASE_URL=postgresql://username:password@hostname:port/database
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-generated-secret-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
```

#### NEXTAUTH_SECRETの生成

```bash
openssl rand -base64 32
```

### 6. データベースマイグレーション

デプロイ後、Vercelのダッシュボードで以下のコマンドを実行：

```bash
npx prisma db push
```

または、ローカルで実行：

```bash
DATABASE_URL="your-production-database-url" npx prisma db push
```

### 7. 初期データの投入

```bash
DATABASE_URL="your-production-database-url" npm run db:seed
```

## デプロイ後の確認事項

1. **アプリケーションの動作確認**
   - サインアップ・ログイン機能
   - 画像アップロード機能
   - データベース接続

2. **スタイリストアカウントの作成**
   - 管理者用アカウントを手動で作成
   - `role`を`STYLIST`に変更

3. **パフォーマンステスト**
   - ページ読み込み速度
   - 画像表示速度
   - データベースクエリ応答時間

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
npm run build
```

### データベース接続エラー

1. `DATABASE_URL`の形式確認
2. データベースの接続制限確認
3. SSL設定の確認

### 画像アップロードエラー

1. Supabaseのバケット設定確認
2. CORS設定の確認
3. API キーの確認

## セキュリティ設定

1. **環境変数の保護**: 本番環境の環境変数は絶対に公開しない
2. **CORS設定**: Supabaseで適切なCORS設定
3. **データベースセキュリティ**: 最小権限の原則に従う

## 監視・メンテナンス

1. **エラーログ監視**: Vercelのログを定期確認
2. **パフォーマンス監視**: Vercel Analyticsの活用
3. **データベースメンテナンス**: 定期的なバックアップ
4. **アップデート**: 依存関係の定期更新

## カスタムドメイン設定（オプション）

1. Vercelのプロジェクト設定で「Domains」を選択
2. カスタムドメインを追加
3. DNS設定を更新
4. `NEXTAUTH_URL`環境変数を更新
