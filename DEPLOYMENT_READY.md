# My Closet - デプロイ完了ガイド

## 🎉 デプロイ準備完了！

My Closetアプリケーションのデプロイ準備が完了しました。以下の手順でVercelにデプロイできます。

## 📋 事前準備チェックリスト

- ✅ **コードの本番対応**: PostgreSQL対応、セキュリティヘッダー追加済み
- ✅ **ビルドテスト**: エラーなしでビルド完了確認済み
- ✅ **環境設定**: `.env.example`と`vercel.json`設定済み
- ✅ **ドキュメント**: `DEPLOY.md`で詳細手順記載済み
- ✅ **Git準備**: 最新コミット完了

## 🚀 次のステップ

### 1. GitHubリポジトリの作成とプッシュ

```bash
# GitHubで新しいリポジトリを作成後
git remote add origin https://github.com/your-username/my-closet.git
git push -u origin main
```

### 2. Vercelでのデプロイ

1. **Vercelアカウント**: [vercel.com](https://vercel.com)でアカウント作成
2. **プロジェクトインポート**: GitHubリポジトリを選択
3. **設定確認**: 
   - Framework: Next.js（自動検出）
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. 環境変数の設定

Vercelの設定画面で以下を追加：

```env
DATABASE_URL=postgresql://username:password@hostname:port/database
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=生成したシークレットキー
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
```

### 4. データベースの準備

**推奨オプション（簡単）**: Vercel Postgres
- Vercelダッシュボード → Storage → Create Database → Postgres
- 作成後、`DATABASE_URL`をコピーして環境変数に設定

**他のオプション**: Railway、Supabase、PlanetScale

### 5. データベースマイグレーション

デプロイ後、Vercelの Functions タブで実行：

```bash
npx prisma db push
```

## 🛠️ 必要なサービス登録

### Supabase（画像ストレージ用）
1. [supabase.com](https://supabase.com)でプロジェクト作成
2. Storage → New bucket → `clothing-images`（public）
3. Settings → API から URL とキーをコピー

### データベース（選択制）
- **Vercel Postgres**（推奨）: Vercelダッシュボードから直接作成
- **Railway**: [railway.app](https://railway.app)
- **Supabase**: データベースも兼用可能

## 📱 アプリ機能

### ユーザー向け機能
- クローゼット管理（服の登録・分類）
- スタイリスト評価の確認
- コーディネート閲覧
- ステータス管理（使用中・使わない・部屋着）

### スタイリスト向け機能
- ユーザー管理ダッシュボード
- アイテム評価システム
- コーディネート作成ツール
- 購入推奨機能

## 🎯 初期セットアップ（デプロイ後）

1. **管理者アカウント作成**: スタイリスト用アカウントの`role`を`STYLIST`に変更
2. **テストデータ投入**: `npm run db:seed`でサンプルデータ作成
3. **動作確認**: 各機能の動作テスト
4. **パフォーマンステスト**: 画像アップロード・表示速度確認

## 📞 サポート

デプロイで問題が発生した場合は、`DEPLOY.md`の詳細手順を参照してください。

---

**🚀 準備完了！** あとはGitHubにプッシュしてVercelでデプロイするだけです！
