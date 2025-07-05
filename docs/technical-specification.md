# SenseUP（センスアップ） - 技術仕様書

**プロジェクト名**: My Closet
**バージョン**: 0.1.0
**最終更新**: 2025 年 7 月 5 日

## システム概要

### アーキテクチャ

- **フロントエンド**: Next.js 15 (App Router) + React 19
- **バックエンド**: Next.js Server Actions + API Routes
- **データベース**: PostgreSQL (Supabase)
- **認証**: NextAuth.js v5
- **ストレージ**: Supabase Storage
- **デプロイ**: Vercel

### 技術スタック詳細

#### 依存関係（package.json 基準）

**メインライブラリ**

```json
{
  "next": "15.3.4",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "typescript": "5.x"
}
```

**データベース・認証**

```json
{
  "@prisma/client": "6.10.1",
  "prisma": "6.10.1",
  "next-auth": "5.0.0-beta.29",
  "@auth/prisma-adapter": "2.10.0",
  "@supabase/supabase-js": "2.50.2"
}
```

**UI・スタイリング**

```json
{
  "tailwindcss": "3.4.17",
  "@radix-ui/react-avatar": "1.1.10",
  "@radix-ui/react-dialog": "1.1.14",
  "@radix-ui/react-dropdown-menu": "2.1.15",
  "@radix-ui/react-label": "2.1.7",
  "@radix-ui/react-progress": "1.1.7",
  "@radix-ui/react-select": "2.2.5",
  "@radix-ui/react-separator": "1.1.7",
  "@radix-ui/react-slot": "1.2.3",
  "@radix-ui/react-tabs": "1.1.12",
  "lucide-react": "0.525.0",
  "class-variance-authority": "0.7.1",
  "clsx": "2.1.1",
  "tailwind-merge": "3.3.1"
}
```

**機能ライブラリ**

```json
{
  "react-dropzone": "14.3.8",
  "react-image-crop": "11.0.10",
  "zustand": "5.0.6",
  "zod": "3.25.67",
  "date-fns": "4.1.0",
  "sonner": "2.0.5"
}
```

## データベース設計

### 主要テーブル（Prisma Schema）

#### User（ユーザー）

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  passwordHash      String?
  name              String?
  role              UserRole @default(USER)
  profile           Json?
  emailVerified     DateTime?
  image             String?
  assignedStylistId String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum UserRole {
  USER
  STYLIST
}
```

#### ClothingItem（衣類アイテム）

```prisma
model ClothingItem {
  id           String            @id @default(cuid())
  userId       String
  imageUrl     String
  category     ClothingCategory
  subcategory  String?
  color        String?
  brand        String?
  size         String?
  purchaseDate DateTime?
  status       ItemStatus        @default(ACTIVE)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}

enum ClothingCategory {
  TOPS
  BOTTOMS
  OUTERWEAR
  SHOES
  ACCESSORIES
}

enum ItemStatus {
  ACTIVE
  INACTIVE
  LOUNGEWEAR
}
```

#### ItemEvaluation（スタイリスト評価）

```prisma
model ItemEvaluation {
  id         String           @id @default(cuid())
  itemId     String
  stylistId  String
  evaluation EvaluationType
  comment    String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
}

enum EvaluationType {
  NECESSARY
  UNNECESSARY
  KEEP
}
```

#### Outfit（コーディネート）

```prisma
model Outfit {
  id             String   @id @default(cuid())
  userId         String
  title          String
  description    String?
  clothingItems  Json     // アイテムIDの配列
  stylistComment String?
  tips           String?
  createdBy      String   // スタイリストID
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### PurchaseRecommendation（購入推奨）

```prisma
model PurchaseRecommendation {
  id          String                    @id @default(cuid())
  userId      String
  stylistId   String
  itemType    String
  description String
  reason      String
  priority    RecommendationPriority    @default(MEDIUM)
  status      RecommendationStatus      @default(PENDING)
  createdAt   DateTime                  @default(now())
  updatedAt   DateTime                  @updatedAt
}

enum RecommendationPriority {
  HIGH
  MEDIUM
  LOW
}

enum RecommendationStatus {
  PENDING
  VIEWED
  PURCHASED
  DECLINED
}
```

## API 設計

### RESTful API Routes

#### 認証関連

- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/signin` - ログイン
- `POST /api/auth/signout` - ログアウト

#### ユーザー機能

- `GET /api/clothing-items` - 衣類一覧取得
- `POST /api/clothing-items` - 衣類追加
- `PUT /api/clothing-items/[id]` - 衣類更新
- `DELETE /api/clothing-items/[id]` - 衣類削除
- `GET /api/outfits` - コーディネート一覧
- `GET /api/outfits/[id]` - コーディネート詳細
- `GET /api/user/recommendations` - 購入推奨一覧
- `PUT /api/user/recommendations/[id]` - 推奨ステータス更新

#### スタイリスト機能

- `GET /api/stylist/dashboard` - ダッシュボードデータ
- `GET /api/stylist/users` - 担当ユーザー一覧
- `GET /api/stylist/users/[id]` - ユーザー詳細
- `GET /api/stylist/users/[id]/closet` - ユーザークローゼット
- `POST /api/stylist/evaluations` - アイテム評価作成
- `POST /api/stylist/outfits` - コーディネート作成
- `POST /api/stylist/recommendations` - 購入推奨作成

#### ファイルアップロード

- `POST /api/upload/clothing-item` - 衣類画像アップロード
- `POST /api/upload/profile-image` - プロフィール画像アップロード

## フロントエンド設計

### ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (user)/            # ユーザー機能ページ
│   ├── (stylist)/         # スタイリスト機能ページ
│   └── api/               # API Routes
├── components/            # Reactコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   ├── closet/           # クローゼット関連
│   ├── outfits/          # コーディネート関連
│   └── stylist/          # スタイリスト関連
├── lib/                  # ユーティリティ
│   ├── auth.ts           # NextAuth設定
│   ├── prisma.ts         # Prismaクライアント
│   ├── supabase.ts       # Supabase設定
│   └── image-conversion.ts # 画像変換処理
└── types/                # TypeScript型定義
```

### 主要コンポーネント

#### UI 基盤（Radix UI ベース）

- `Button` - ボタンコンポーネント
- `Dialog` - モーダルダイアログ
- `DropdownMenu` - ドロップダウンメニュー
- `Select` - セレクトボックス
- `Tabs` - タブコンポーネント
- `Progress` - プログレスバー

#### 機能コンポーネント

- `ImageUpload` - 画像アップロード（HEIC 対応）
- `ClothingItemCard` - 衣類アイテムカード
- `OutfitCard` - コーディネートカード
- `ItemEvaluationForm` - アイテム評価フォーム

## セキュリティ・認証

### NextAuth.js 設定

- **プロバイダー**: Credentials（メール・パスワード）
- **アダプター**: Prisma Adapter
- **セッション戦略**: JWT
- **暗号化**: NextAuth.js 標準暗号化

### ロールベースアクセス制御

- **USER**: 自分のデータのみアクセス可能
- **STYLIST**: 担当ユーザーのデータアクセス・評価・提案作成

### データバリデーション

- **Zod**: スキーマベースバリデーション
- **Prisma**: データベースレベルの型安全性
- **TypeScript**: コンパイル時の型チェック

## パフォーマンス最適化

### 画像処理

- **クライアントサイド圧縮**: Canvas API による最適化
- **HEIC 変換**: ブラウザ対応フォーマットへの自動変換
- **複数フォーマット対応**: JPG, PNG, WebP, HEIC 等

### データベース最適化

- **コネクションプール**: pgbouncer による効率的な接続管理
- **インデックス**: 主要検索フィールドのインデックス設定
- **クエリ最適化**: Prisma による効率的なクエリ生成

### フロントエンド最適化

- **Next.js Image**: 自動画像最適化
- **動的インポート**: コード分割による初期ロード時間短縮
- **Zustand**: 軽量状態管理ライブラリ

## 環境設定

### 開発環境

```env
DATABASE_URL="postgresql://localhost:5432/my_closet_dev"
DIRECT_URL="postgresql://localhost:5432/my_closet_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret"
```

### 本番環境（Vercel）

```env
DATABASE_URL="postgresql://...@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"
DIRECT_URL="postgresql://...@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="production-secret"
```

## 品質保証

### テスト戦略

- **単体テスト**: 重要なユーティリティ関数
- **統合テスト**: API Routes
- **E2E テスト**: 主要ユーザーフロー

### コード品質

- **ESLint**: Next.js 推奨設定
- **TypeScript**: strict mode 有効
- **Prettier**: コードフォーマット統一

### モニタリング

- **Vercel Analytics**: パフォーマンス監視
- **Error Tracking**: 本番エラー監視（推奨）
- **Database Monitoring**: Supabase 監視ダッシュボード

---

この技術仕様書は、2025 年 7 月 5 日時点のソースコードに基づいて作成されています。
