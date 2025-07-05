# クローゼットコンサルアプリ要件定義書

## サービス名

**MY Closet**

- キャッチコピー：「うーちゃんがあなたの専属スタイリスト」

## 1. プロジェクト概要

### 1.1 サービス概要

利用者がクローゼットの服をアップロードし、専門コーディネーター「うーちゃん」がパーソナライズされたコーディネート提案を行う Web アプリケーション。

### 1.2 ターゲットユーザー

- **プライマリ**: 20-30 代の男性
- **具体的ペルソナ**:
  - 服に興味はないがオシャレになりたい人
  - モテたい・好印象を与えたい人
  - 垢抜けたい人
  - 自分で服を選ぶのが面倒・苦手な人

### 1.3 価値提案

- **「考えなくていい」**: 服選びの悩みから完全解放
- **モテる・好印象**: 女性ウケ・ビジネスシーンでの印象向上
- **時短**: 毎朝の服選び時間ゼロ
- **コスパ**: 手持ち服の最大活用 + 無駄な買い物防止

## 2. 機能要件

### 2.1 MVP 機能（Phase 1）

#### 2.1.1 ユーザー管理

- [x] ユーザー登録（メールアドレス + パスワード）
- [x] ログイン/ログアウト
- [x] プロフィール設定（身長、体重、好みのスタイル等）

#### 2.1.2 クローゼット機能

- [x] 服の写真アップロード（HEIC 形式対応）
- [x] 服の基本情報登録（カテゴリ、色、ブランド、購入時期）
- [x] 服の一覧表示
- [x] 服の編集・削除

#### 2.1.3 コーディネート提案機能

- [x] うーちゃん（管理者）による手動コーディネート作成
- [x] コーディネート画像の生成（服の組み合わせ表示）
- [x] コーディネートコメント機能
- [x] 着回しアドバイス

#### 2.1.4 コミュニケーション機能

- [ ] うーちゃんからのメッセージ機能
- [ ] ユーザーからの質問・リクエスト機能

#### 2.1.5 スタイリスト機能（うーちゃん専用）

- [x] スタイリスト専用ダッシュボード
- [x] ユーザー一覧・管理機能
- [x] ユーザー別クローゼット確認機能
- [x] 服のアイテム評価機能（必要/不要/キープ）
- [x] アイテムへのコメント機能
- [x] コーディネート作成ツール
- [x] コーディネートへのスタイリングコメント機能
- [x] 着こなしアドバイス機能

### 2.2 将来機能（Phase 2 以降）

#### 2.2.1 AI・自動化機能

- AI 自動コーディネート提案
- 服の自動カテゴライズ
- コーディネート評価・フィードバック機能

#### 2.2.2 ショッピング・提案機能

- ショッピング提案機能
- [x] 購入推奨アイテム提案（スタイリスト機能）
- アフィリエイト連携

#### 2.2.3 高度なスタイリスト機能

- ユーザー分析ダッシュボード
- 季節・トレンド対応提案
- 体型・好み分析機能

## 3. 技術要件

### 3.1 技術スタック

#### フロントエンド

- **フレームワーク**: React 19+ with Next.js 15
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API / Zustand
- **画像処理**: react-image-crop, react-dropzone

#### バックエンド

- **フレームワーク**: Next.js 15 (App Router)
- **サーバーサイド**: Next.js Server Actions
- **言語**: TypeScript
- **認証**: NextAuth.js v5
- **データベース ORM**: Prisma

#### データベース

- **メイン**: PostgreSQL (Supabase)
- **画像ストレージ**: Supabase Storage

#### インフラ・デプロイ

- **ホスティング**: Vercel (フルスタック)
- **データベース**: Supabase PostgreSQL
- **画像ストレージ**: Supabase Storage
- **CI/CD**: Vercel 自動デプロイ

### 3.2 アーキテクチャ

```
Next.js App (Client + Server Actions) <-> Supabase (Database + Storage)
                                      <-> NextAuth.js (Authentication)
```

## 4. データベース設計

### 4.1 主要テーブル

#### users

```sql
- id: UUID (Primary Key)
- email: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- name: VARCHAR(100)
- role: VARCHAR(20) DEFAULT 'user' (user, stylist)
- profile: JSONB (身長、体重、好み等)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### clothing_items

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- image_url: VARCHAR(500)
- category: VARCHAR(50) (tops, bottoms, shoes, accessories)
- color: VARCHAR(50)
- brand: VARCHAR(100)
- purchase_date: DATE
- status: VARCHAR(20) (active, inactive, disposed)
- created_at: TIMESTAMP
```

#### item_evaluations

```sql
- id: UUID (Primary Key)
- item_id: UUID (Foreign Key to clothing_items)
- stylist_id: UUID (Foreign Key to users)
- evaluation: VARCHAR(20) (necessary, unnecessary, keep)
- comment: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### outfits

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- title: VARCHAR(200)
- clothing_items: JSONB (アイテムIDの配列)
- stylist_comment: TEXT
- tips: TEXT
- styling_advice: TEXT
- created_by: UUID (うーちゃんのユーザーID)
- created_at: TIMESTAMP
```

#### purchase_recommendations

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- stylist_id: UUID (Foreign Key)
- item_type: VARCHAR(100)
- description: TEXT
- reason: TEXT
- priority: VARCHAR(20) (high, medium, low)
- status: VARCHAR(20) (pending, viewed, purchased, declined)
- created_at: TIMESTAMP
```

#### messages

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- sender_type: VARCHAR(20) (user, stylist)
- content: TEXT
- read_at: TIMESTAMP
- created_at: TIMESTAMP
```

## 5. UI/UX 要件

### 5.1 デザインコンセプト

- **テーマ**: ミニマル、クール、プロフェッショナル
- **カラー**:
  - メイン: ダークネイビー (#1a202c)
  - アクセント: ブルー (#3b82f6)
  - サブ: グレー系 (#f7fafc, #e2e8f0)
- **フォント**: モダンで読みやすいサンセリフ
- **雰囲気**: 「頼れる相棒」「スマート」「効率的」

### 5.2 主要画面

#### 5.2.1 ユーザー画面

1. **ダッシュボード**: 今日のコーデ、週間コーデ予定、うーちゃんからの提案
2. **クローゼット画面**: 服の一覧（カード型表示）、カテゴリフィルター
3. **服登録画面**: 簡単撮影、自動カテゴライズ提案
4. **コーディネート詳細画面**:
   - 「なぜこの組み合わせ？」の理由説明
   - 「どんなシーンで？」の用途説明
   - 「女性からの印象」ポイント
5. **メッセージ画面**: うーちゃんとのチャット形式

#### 5.2.2 スタイリスト画面（うーちゃん専用）

1. **スタイリストダッシュボード**:
   - 担当ユーザー一覧
   - 未評価アイテム数
   - 新規コーディネート作成状況
   - 購入提案ステータス
2. **ユーザー管理画面**:
   - ユーザー一覧・詳細
   - 各ユーザーのプロフィール確認
   - クローゼット概要
3. **アイテム評価画面**:
   - ユーザー別クローゼット表示
   - アイテム評価機能（必要/不要/キープ）
   - 評価コメント機能
   - カテゴリ別フィルター
4. **コーディネート作成画面**:
   - ユーザーのアイテムから組み合わせ選択
   - ドラッグ&ドロップでコーディネート作成
   - スタイリングコメント・Tips 入力
   - 着こなしアドバイス機能
5. **購入提案画面**:
   - アイテム提案作成
   - 提案理由・優先度設定
   - ユーザー別提案管理

### 5.3 レスポンシブ対応

- モバイルファースト設計
- タブレット、デスクトップ対応

## 6. 開発スケジュール

### Phase 1 (MVP) - 4-5 週間

- **Week 1**: Next.js + Supabase 環境構築、NextAuth.js 認証
- **Week 2**: Server Actions でクローゼット機能、Prisma ORM
- **Week 3**: ユーザー向けコーディネート機能
- **Week 4**: スタイリスト機能（ダッシュボード、アイテム評価、コーディネート作成）
- **Week 5**: UI 調整、レスポンシブ対応、テスト

### Phase 2 - 3-4 週間

- **Week 6-7**: 購入提案機能、高度なスタイリスト機能
- **Week 8**: ユーザーフィードバック機能、通知機能
- **Week 9**: パフォーマンス最適化、SEO 対策、リリース準備

## 7. 運用要件

### 7.1 セキュリティ

- HTTPS 通信
- パスワードハッシュ化
- JWT 認証
- 画像ファイルのバリデーション

### 7.2 パフォーマンス

- 画像の自動圧縮・最適化
- CDN 利用による高速配信
- データベースクエリ最適化

### 7.3 監視・ログ

- エラー監視（Sentry 等）
- アクセスログ
- パフォーマンス監視

## 8. ビジネス要件

### 8.1 収益モデル（将来）

- 月額サブスクリプション
- プレミアム機能
- アフィリエイト（服の購入提案）

### 8.2 成功指標（KPI）

- **定着率**: 週 3 回以上のアプリ利用
- **服登録数**: ユーザー 1 人あたり平均 20 着以上
- **コーディネート満足度**: 「モテる」「好印象」の体感スコア
- **時短効果**: 朝の服選び時間の短縮測定
- **購買改善**: 「無駄な服を買わなくなった」率

## 9. リスクと対策

### 9.1 技術リスク

- **画像処理パフォーマンス**: クライアントサイドでの圧縮実装
- **データベース設計**: 初期段階での十分な設計検討

### 9.2 運用リスク

- **うーちゃんの作業負荷**: 効率的なワークフロー構築
- **スケーラビリティ**: 段階的な機能拡張計画

## 10. 開発環境

### 10.1 必要ツール

- Node.js 18+
- Git
- VS Code + 関連拡張機能
- GitHub Copilot
- Docker (開発環境統一用)

### 10.2 開発フロー

1. GitHub Issues での機能管理
2. Feature Branch でのコード管理
3. Vercel でのプレビューデプロイ
4. GitHub Copilot + Server Actions での高速開発
5. Prisma Studio でのデータベース管理

---

**作成日**: 2025 年 6 月 30 日
**更新日**: 2025 年 7 月 5 日
**作成者**: AI 開発チーム
**バージョン**: 1.1 - 実装完了状況を反映
