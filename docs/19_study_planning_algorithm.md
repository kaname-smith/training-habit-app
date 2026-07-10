# 19 Study Planning Algorithm

## 1. 目的

不完全な情報、短い期限、固定予定、複数科目、理解度の差を考慮し、説明可能で再計画可能な学習スケジュールを生成する。

初期版は「厳密な最適解」ではなく、入力の不確実性に耐えるヒューリスティックとする。

## 2. 処理段階

```text
Input audit
→ Unknown detection
→ Discovery task generation
→ Workload estimation
→ Available-time construction
→ Priority scoring
→ Time-block allocation
→ Daily execution
→ Actual-time feedback
→ Replanning
```

## 3. Input Audit

科目ごとに以下の欠落を検出する。

- 試験日不明
- 試験範囲不明
- 試験形式不明
- 資料不足
- 学習量推定不能
- 理解度未入力

欠落があればDiscovery Taskを生成する。

## 4. 優先度スコア案

```text
priority =
  deadlineUrgency
  × examImportance
  × masteryGap
  × taskReadiness
  × uncertaintyAdjustment
  × consequenceFactor
```

ただし乗算だけでは極端になりやすいため、実装時には正規化した加重和を第一候補とする。

```ts
score =
  0.30 * urgencyScore +
  0.20 * importanceScore +
  0.20 * masteryGapScore +
  0.15 * uncertaintyScore +
  0.10 * prerequisiteScore +
  0.05 * shortTaskBonus;
```

### uncertaintyScoreの扱い

- 不明事項を解消するDiscovery Taskには正の加点
- 不明な通常学習タスクを無理に大きく予定化しない
- 情報取得後に見積りを更新する

## 5. 利用可能時間

```ts
interface AvailabilityBlock {
  start: string;
  end: string;
  source: 'manual' | 'calendar' | 'recurring_schedule';
  energyLevel?: 'low' | 'medium' | 'high';
}
```

固定予定を除いた空き時間を生成する。

初期版では手入力を正式経路とし、Google Calendarは後から同じinterfaceへ変換する。

## 6. 割当ルール

- 深い理解・演習は高エネルギー時間へ
- 情報確認・資料整理は低エネルギー時間でも可
- 1ブロック25〜90分
- 連続学習後に休憩
- 試験前日は新規範囲より復習・過去問を優先
- 予定の100%を埋めず、10〜20%のバッファを残す
- 未完了タスクは翌日へ自動繰越しするが、理由を表示する

## 7. 再計画

各セッション後に次を更新する。

- 実績時間
- 完了率
- 理解度
- 残作業時間
- 新しく判明した範囲
- 疲労度

再計画では既に終了した予定を動かさず、未来のブロックだけ再配分する。

## 8. 説明可能性

各予定に「なぜ今これをするか」を表示する。

例：

```text
材料力学の試験日が近く、理解度が低く、演習問題が未着手のため最優先です。
```

```text
この科目は試験範囲が未確認なので、まずLMS告知の確認を15分割り当てました。
```

## 9. テスト

- 試験日不明ならDiscovery Taskが生成される
- 固定予定と重ならない
- 期限切れタスクを未来に配置しない
- 合計時間が空き時間を超えない
- 同点時の決定が再現可能
- 再計画で過去実績を変更しない
- タイムゾーンはAsia/Tokyoを基準に検証

## 10. 将来の最適化

データが十分になった後に検討：

- 制約充足問題
- 整数計画
- 優先度付き区間スケジューリング
- Monte Carloによる所要時間不確実性

初期版では複雑な最適化ライブラリを導入しない。
