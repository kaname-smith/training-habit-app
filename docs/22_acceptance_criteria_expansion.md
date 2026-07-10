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

- [ ] 科目を登録できる
- [ ] 試験日・範囲にunknown状態を持てる
- [ ] 資料不足を記録できる
- [ ] Discovery Taskを生成できる
- [ ] 固定予定を手入力できる
- [ ] 固定予定と重ならない学習ブロックを生成できる
- [ ] 優先理由を表示できる
- [ ] 実績後に未来分を再計画できる
- [ ] 計画は5〜15分粒度、実績タイマーは秒精度
- [ ] Google Calendarなしでも利用できる

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
