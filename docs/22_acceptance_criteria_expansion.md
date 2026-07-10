# 22 Expansion Acceptance Criteria

## A. Training Guidance

- [ ] 時間種目にカウントダウンタイマーがある
- [ ] 一時停止・再開・リセットができる
- [ ] タブ非アクティブ後も時間が大きくずれない
- [ ] セット間休憩タイマーがある
- [ ] 回数種目で速い/中/遅いテンポを選べる
- [ ] 音なしでも状態が分かる
- [ ] 種目ごとに対象部位と簡単な手順がある
- [ ] よくあるミスと代替種目がある
- [ ] 痛みがある場合の中止注意がある

## B. Evidence Center

- [ ] アプリのルールと出典が対応している
- [ ] WHO、厚生労働省等の初期資料が登録されている
- [ ] 対象者・限界・最終確認日が表示される
- [ ] 外部資料を大量転載していない
- [ ] 医療助言ではないことが明記される

## C. Nutrition Catalog

- [ ] プロテイン商品を登録できる
- [ ] 1食量とタンパク質量を小数で登録できる
- [ ] 記録時に商品を選べる
- [ ] 0.5食等の倍率で記録できる
- [ ] 食事由来タンパク質を0.1g単位で入力できる
- [ ] 既存データがmigrationで維持される
- [ ] export/importが新形式に対応する

## D. Feedback

- [ ] アプリ内で気づきを記録できる
- [ ] 分類、説明、状態を保持できる
- [ ] 外部送信しない
- [ ] export/import対象に含まれる

## E. Study Planner Foundation

### E1. Milestone S1(Situation Assessment)— 実装済み(2026-07-11、`feature/study-planner-foundation`ブランチ、`docs/24`参照)

- [x] 科目を登録できる(CoursesPage、カスケード削除含む)
- [x] 試験日・範囲にunknown状態を持てる(ExamsPage、`ConfidenceLevel`)
- [x] 資料不足を記録できる(MaterialsPage、`MaterialStatus`。`not_applicable`含む)
- [x] Discovery Taskを生成できる(DiscoveryTasksPage、画面表示時に自動生成、冪等)
- [x] 固定予定を手入力できる(AvailabilityPage、単発ブロックのみ)
- [x] Courses UI 実装済み
- [x] Exams UI 実装済み
- [x] Materials UI 実装済み
- [x] Discovery Tasks UI 実装済み
- [x] Availability UI 実装済み
- [x] Study S1 Golden Path E2E 実装済み(`e2e/study-s1-golden-path.spec.ts`)
- [x] `typecheck` / `lint` / `test` / `build` / `e2e` 成功済み(featureブランチ上で確認済み。main統合時に再確認する)
- [x] スマホ実機確認(ローカルLANプレビュー、2026-07-11完了)
- [ ] スマホ実機確認(GitHub Pages本番URL。main統合・push・再デプロイ後に実施予定)

### E2. Milestone S2(Planning and Execution)— 未実装

- [ ] 固定予定と重ならない学習ブロックを生成できる
- [ ] 優先理由を表示できる
- [ ] 実績後に未来分を再計画できる
- [ ] 計画は5〜15分粒度、実績タイマーは秒精度
- [ ] Google Calendarなしでも利用できる(S1のAvailabilityPageは対応済みだが、S2の空き時間算出・学習ブロック割当は未実装)

## F. Quality Gates

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

- [ ] 全コマンド成功
- [ ] mainへ直接実験コミットしていない
- [ ] localStorage migrationの回帰テストがある
- [ ] スマホ実機で主要導線を確認
- [ ] GitHub Pages base pathでbuild確認
