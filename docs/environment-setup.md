# 環境設定ガイド

このドキュメントでは、開発環境と本番環境の Supabase プロジェクトを分離する手順を説明します。

## 概要

- **本番環境**: 既存の Supabase プロジェクト（vvkcoufkuecqailekaeq）
- **開発環境**: 新しく作成する Supabase プロジェクト

## 手順

### 1. 新しい開発用 Supabase プロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. 「New Project」をクリック
3. プロジェクト名を入力（例: `my-closet-dev`）
4. データベースパスワードを設定
5. リージョンを選択（`Northeast Asia (Tokyo)`推奨）
6. プロジェクト作成を完了

### 2. 開発環境の環境変数設定

1. 作成した Supabase プロジェクトのダッシュボードで「Settings」→「API」に移動
2. 必要な情報を取得:

   - Project URL
   - anon public key
   - service_role secret key

3. 「Settings」→「Database」で接続情報を取得:

   - Connection string (URI 形式)

4. `.env`ファイルを更新:

```bash
# .envファイルの内容を以下のように更新
DATABASE_URL="postgresql://postgres.[NEW_PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[NEW_PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL=https://[NEW_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY]

NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="MMGmOo0VZqbAhTXDwiY07RTMc03s9hDaSx5VAphe+ZQ="

NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
NEXT_PUBLIC_APP_NAME=SenseUP Dev
NEXT_PUBLIC_APP_VERSION=0.1.0-dev
```

### 3. 開発環境のセットアップ

開発環境を一括でセットアップする場合:

```bash
npm run dev:full
```

または個別にセットアップする場合:

```bash
# 1. Supabaseストレージバケットの作成
npm run setup:dev

# 2. データベーススキーマの適用
npm run db:push

# 3. 開発用シードデータの投入
npm run db:seed

# 4. 開発サーバーの起動
npm run dev
```

### 4. 本番環境の設定確認

本番環境（Vercel）の環境変数が以下のように設定されていることを確認:

```bash
vercel env ls
```

必要に応じて環境変数を更新:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add DIRECT_URL
```

## トラブルシューティング

### データベース接続エラー

1. 環境変数の値が正しいか確認
2. Supabase プロジェクトが正常に作成されているか確認
3. ネットワーク接続を確認

### ストレージバケット作成エラー

1. `SUPABASE_SERVICE_ROLE_KEY`が正しいか確認
2. Supabase プロジェクトでストレージ機能が有効化されているか確認

### マイグレーションエラー

1. データベース URL 形式が正しいか確認
2. Prisma クライアントが最新の状態か確認: `npx prisma generate`

## 環境確認コマンド

現在の環境設定を確認するためのコマンド:

```bash
# 環境変数の確認
echo $NEXT_PUBLIC_SUPABASE_URL

# Supabase接続テスト
npm run setup:dev

# データベース接続テスト
npx prisma db push --preview-feature
```
