# スタイリスト機能コンポーネント

このディレクトリには、My Closet アプリのスタイリスト（うーちゃん）機能に関連するコンポーネントが含まれています。

## 実装完了コンポーネント

### dashboard/

スタイリストダッシュボード関連のコンポーネント

- **stylist-dashboard.tsx**: メインダッシュボードコンテナ
- **stats-overview.tsx**: 統計情報の概要表示
- **user-list.tsx**: 担当ユーザー一覧
- **recent-activity.tsx**: 最近のアクティビティ履歴

### loading-state.tsx

スタイリスト機能全体で使用する統一されたローディング状態コンポーネント

## 使用方法

### スタイリストダッシュボード

```tsx
import { StylistDashboard } from "@/components/stylist/dashboard/stylist-dashboard";

export default function StylistPage() {
  return <StylistDashboard />;
}
```

### ローディング状態

```tsx
import { LoadingState } from "@/components/stylist/loading-state";

export default function SomeComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingState />;
  }

  return <div>コンテンツ</div>;
}
```

## 完成した機能

### 1. ダッシュボード機能

- 統計情報表示（ユーザー数、未評価アイテム数）
- 担当ユーザー一覧とステータス
- 最近のアクティビティ履歴
- クイックアクションボタン

### 2. ユーザー管理機能

- ユーザー一覧表示
- ユーザー詳細情報
- プロフィール確認
- アイテム・コーディネート統計

### 3. アイテム評価機能

- 3 段階評価システム（必要/キープ/不要）
- 評価コメント機能
- 評価履歴管理

### 4. コーディネート作成機能

- ユーザーアイテムからの選択
- カテゴリ別表示
- スタイリングコメント
- 着こなし Tips

### 5. 購入推奨機能

- アイテム推奨作成
- 優先度設定（高/中/低）
- ステータス管理

## 設計原則

### サーバーコンポーネント優先

可能な限りサーバーコンポーネントとして実装し、パフォーマンスを最適化

### 型安全性

TypeScript を活用し、すべての props とデータ構造に適切な型定義を提供

### 再利用性

各コンポーネントは独立して動作し、他の部分で再利用可能

### アクセシビリティ

ARIA 属性とキーボードナビゲーションをサポート

## 関連ページ

- `/src/app/stylist/` - スタイリスト関連のページ
- `/src/app/api/stylist/` - スタイリスト関連の API

## 認証

すべてのスタイリスト機能は `session.user.role === "STYLIST"` でアクセス制御されています。
