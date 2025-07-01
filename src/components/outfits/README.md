# Outfits Components

コーディネート提案機能のコンポーネント群です。

## コンポーネント構成

### `outfits-header.tsx` (Server Component)

- ページタイトルと説明
- うーちゃんのアバター表示

### `outfits-grid.tsx` (Server Component)

- コーディネート提案の一覧表示
- カード形式でのレイアウト

### `outfit-card.tsx` (Server Component)

- 個別のコーディネート提案カード
- アイテム表示、コメント、Tips

### `empty-state.tsx` (Server Component)

- 提案がない場合の表示
- クローゼット追加への誘導

### `loading-state.tsx` (Server Component)

- ローディング状態表示

## 主な改善点

1. **最新ヘッダーコンポーネントの使用**

   - レスポンシブ対応
   - モバイルメニュー

2. **チャット機能の削除**

   - 将来実装予定のため現在は非表示

3. **コンポーネント化**

   - 責任の分離
   - 再利用可能性
   - メンテナンス性向上

4. **レスポンシブデザイン**
   - モバイルファースト
   - グリッドレイアウト最適化

## 使用方法

```tsx
import { Header } from "@/components/layout/header";
import { OutfitsHeader } from "@/components/outfits/outfits-header";
import { OutfitsGrid } from "@/components/outfits/outfits-grid";
import { LoadingState } from "@/components/outfits/loading-state";
```
