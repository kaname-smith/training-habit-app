# 17 Feedback Loop Specification

## 1. 目的

実利用中に生じた不満、疑問、改善案をその場で記録し、次の開発サイクルへ戻せるようにする。

## 2. プライバシー方針

- 外部送信しない
- localStorageに保存
- JSON export/import対象に含める
- GitHub Issueへ自動投稿しない
- ユーザーが手動で内容をコピーできる

## 3. データモデル

```ts
type FeedbackCategory =
  | 'bug'
  | 'confusing'
  | 'improvement'
  | 'feature_request'
  | 'evidence_question'
  | 'other';

interface UserFeedbackEntry {
  id: string;
  category: FeedbackCategory;
  title: string;
  description: string;
  route?: string;
  context?: Record<string, string | number | boolean>;
  status: 'new' | 'reviewed' | 'planned' | 'resolved' | 'wont_fix';
  createdAt: string;
  updatedAt: string;
}
```

## 4. 画面要件

- 新規フィードバック
- 一覧
- 詳細編集
- 状態変更
- コピー
- 削除
- JSONエクスポートへの同梱

入力負荷を下げるため、タイトルは任意でもよい。現在の画面URL、アプリバージョン、日時は自動付与可能。

## 5. 開発利用

実利用テスト後、Claude Codeへ渡すときは個人データを除き、フィードバック項目のみを抽出したJSONまたはMarkdownへ変換する。

## 6. 非目標

- SaaS型フィードバック送信
- GitHub API連携
- スクリーンショット自動収集
- 個人情報収集
