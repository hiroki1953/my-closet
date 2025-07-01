# Closet Add Components

クローゼット追加機能のコンポーネント群です。

## コンポーネント構成

### `add-header.tsx` (Server Component)

- パンくずナビゲーション
- ページタイトルと説明
- 戻るリンク

### `add-form.tsx` (Client Component)

- メインフォームロジック
- ステート管理 (formData, loading, error)
- API 通信処理
- フォーム送信処理

### `image-upload.tsx` (Client Component)

- 画像アップロード機能
- ドラッグ&ドロップ対応
- **スマホカメラ機能** (capture="environment")
- 画像プレビュー表示
- モバイル専用カメラボタン

### `form-fields.tsx` (Server Component)

- フォームフィールド群
- カテゴリ選択
- 色選択
- ブランド、購入日、メモ入力

### `loading-state.tsx` (Server Component)

- ローディング状態表示
- 認証チェック中の表示

## 主な改善点

1. **最新ヘッダーコンポーネントの使用**

   - レスポンシブ対応
   - モバイルメニュー

2. **スマホカメラ対応**

   - capture 属性でカメラを直接起動
   - モバイル用カメラボタン追加
   - 再撮影機能

3. **コンポーネント化**

   - 責任の分離
   - 再利用可能性
   - メンテナンス性向上

4. **レスポンシブデザイン**
   - モバイルファースト
   - タッチフレンドリー

## 使用方法

```tsx
import { Header } from "@/components/layout/header";
import { AddHeader } from "@/components/closet/add/add-header";
import { AddForm } from "@/components/closet/add/add-form";
import { LoadingState } from "@/components/closet/add/loading-state";
```
