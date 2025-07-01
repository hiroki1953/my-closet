# スタイリスト機能 API 設計

## 概要

スタイリスト（うーちゃん）専用の管理機能 API エンドポイント設計

## 認証・認可

- スタイリストロール (`role: 'STYLIST'`) のユーザーのみアクセス可能
- NextAuth.js セッションでロール確認

## API エンドポイント

### 1. スタイリストダッシュボード

```
GET /api/stylist/dashboard
```

**レスポンス:**

```json
{
  "totalUsers": 25,
  "pendingEvaluations": 12,
  "pendingOutfits": 5,
  "pendingRecommendations": 8,
  "recentActivity": [...]
}
```

### 2. ユーザー管理

```
GET /api/stylist/users
GET /api/stylist/users/[userId]
```

**レスポンス:**

```json
{
  "users": [
    {
      "id": "user1",
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "profile": {...},
      "itemsCount": 20,
      "lastActivity": "2024-07-01",
      "evaluationStatus": "pending"
    }
  ]
}
```

### 3. アイテム評価

```
GET /api/stylist/users/[userId]/items
POST /api/stylist/items/[itemId]/evaluate
PUT /api/stylist/items/[itemId]/evaluate
```

**リクエスト (POST/PUT):**

```json
{
  "evaluation": "NECESSARY|UNNECESSARY|KEEP",
  "comment": "この色は肌に合っていてとても良いです"
}
```

### 4. コーディネート作成

```
GET /api/stylist/users/[userId]/items/available
POST /api/stylist/outfits
PUT /api/stylist/outfits/[outfitId]
```

**リクエスト (POST):**

```json
{
  "userId": "user1",
  "title": "カジュアルデート用コーディネート",
  "itemIds": ["item1", "item2", "item3"],
  "stylistComment": "清潔感のある大人カジュアル",
  "tips": "シャツの袖をまくると抜け感が出ます",
  "stylingAdvice": "ジャケットのボタンは開けて着用してください"
}
```

### 5. 購入提案

```
GET /api/stylist/users/[userId]/recommendations
POST /api/stylist/recommendations
PUT /api/stylist/recommendations/[recommendationId]
```

**リクエスト (POST):**

```json
{
  "userId": "user1",
  "itemType": "ジャケット",
  "description": "ネイビーのテーラードジャケット",
  "reason": "フォーマルシーンで使える万能アイテム",
  "priority": "HIGH"
}
```

## セキュリティ考慮事項

- 全エンドポイントでスタイリストロール確認
- ユーザーデータへのアクセス制限
- 入力値のバリデーション

## パフォーマンス考慮事項

- ページネーション対応
- 画像の最適化
- キャッシュ戦略
