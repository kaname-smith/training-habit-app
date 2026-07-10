# 16 Evidence Center Specification

## 1. 目的

StudyFitで提示するトレーニング頻度、活動量、栄養目標、安全上の注意について、利用者が根拠・適用範囲・限界を確認できるようにする。

Evidence Centerは「権威の名前を並べるページ」ではなく、アプリの判断規則と根拠資料の対応を説明するページとする。

## 2. 情報構造

### EvidenceTopic

```ts
interface EvidenceTopic {
  id: string;
  title: string;
  category: 'physical_activity' | 'strength_training' | 'nutrition' | 'recovery' | 'safety';
  appRule: string;
  plainLanguageSummary: string;
  applicability: string;
  limitations: string[];
  sourceIds: string[];
  lastReviewedAt: string;
}
```

### EvidenceSource

```ts
interface EvidenceSource {
  id: string;
  organization: string;
  title: string;
  year: number;
  url: string;
  sourceType: 'government_guideline' | 'international_guideline' | 'position_stand' | 'systematic_review';
  language: string;
}
```

## 3. 初期トピック

### 3.1 身体活動の基本

- WHOは成人に週150〜300分の中強度有酸素活動等を推奨し、主要筋群の筋力強化を週2日以上行うことを示している。
- 「少しでも動く方がよい」「座位時間を減らす」という考え方をアプリの低負担設計に反映する。

### 3.2 日本の身体活動・筋力トレーニング

- 厚生労働省「健康づくりのための身体活動・運動ガイド2023」を参照。
- 成人について筋力トレーニングを週2〜3日取り入れる推奨がある。
- 個人差を踏まえ、可能なものから取り組むという安全原則を明示する。

### 3.3 タンパク質

- 厚生労働省「日本人の食事摂取基準（2025年版）」を公衆衛生上の基礎資料として示す。
- 運動者向けの高い摂取量を示す場合は、政府基準とスポーツ栄養学会等のポジションスタンドを区別する。
- アプリの1.4〜1.6g/kg/dayは一般成人の必須量そのものではなく、運動習慣を持つ利用者向けの実用目標としていることを説明する。

## 4. 表示要件

各トピックに以下を表示する。

- このアプリのルール
- 根拠の要約
- 誰に当てはまりやすいか
- 例外・注意
- 出典リンク
- 最終確認日

## 5. 更新方針

- ソース本文を大量転載しない
- 内容変更を追跡できるよう、更新日と参照年版を保持
- 少なくとも年1回、または主要ガイドライン改訂時に再確認
- 医療状態別の個別処方はしない

## 6. UI

- 設定または下部ナビゲーションの「根拠」から開く
- カテゴリフィルター
- 重要度ではなくテーマ別に整理
- 外部リンクを開く前に公式サイトであることを表示
