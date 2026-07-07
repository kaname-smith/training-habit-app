# StudyFit Primer (Training Habit App)

7月の期末試験期間に無理なく自宅トレーニングを習慣化し、8〜9月の本格的な身体づくりへ移行するための **ローカルファースト習慣化アプリ** です。React + TypeScript + Vite + Tailwind CSS で実装されており、データはすべて端末内の localStorage に保存されます(外部送信・バックエンド・ログイン・クラウド同期なし)。

## 目的

- 7/7夜〜7/31の試験月に、短時間・低騒音・低疲労の自宅トレーニングを継続できるようにする。
- プロテイン摂取、睡眠、試験直前の軽量版メニューを含めて、毎日の判断をアプリが助ける。
- 8〜9月に本格的な筋力・筋肥大トレーニングへ移行できるよう、記録・習慣・フォーム意識を整える。

## セットアップ

Node.js 20以上を推奨します。

```bash
npm install
```

## 実行方法

```bash
# 開発サーバー起動 (http://localhost:5173)
npm run dev

# 型チェック
npm run typecheck

# リント
npm run lint

# 単体・コンポーネントテスト (Vitest)
npm run test

# 本番ビルド
npm run build

# E2Eテスト (Playwright)
npm run e2e
```

### Playwright初回セットアップ

`npm run e2e` を初めて実行する前に、一度だけブラウザバイナリを取得してください(`npm install` には含まれません)。

```bash
npx playwright install chromium
```

## 実装状況

- **Phase 1(MVP)**: 初期設定・今日のダッシュボード・トレーニング実行・記録カレンダー・プロテイン/栄養・設定の6画面、習慣化ロジック、localStorage保存、単体テスト一式。
- **Phase 2(GUI/UX強化)**: 画面別のGUI改善(推奨カード強調、進捗ドット、カレンダー凡例・日詳細、栄養ステッパー、設定のセクション整理)、文言の`src/content/messages.ts`への一元化、アプリ内疑似通知バナー、Playwright E2Eスイート(`npm run e2e`)、PWA manifestの軽微な整備(`id`/`orientation`)。
- **Phase 3以降(未着手)**: Service Workerによるオフライン対応、PWAアイコンのPNG/マスカブル生成、ダークモードの画面固有の作り込み、実プッシュ通知は仕様上の理由(バックエンド前提のため)により対象外。

## 現在の段階：実利用テスト中(`v0.2.0-phase2`)

現在は `v0.2.0-phase2` タグの状態を「実利用テスト版」として固定し、7月の試験期間中に数日〜1週間程度実際に使ってみて、使用感・不具合・改善点を集める段階です。Phase 3への着手は、このテスト結果を踏まえてから判断します。実利用テストの観点・確認項目・判断基準は `docs/12_real_use_test_plan.md` を参照してください。

## 元となる仕様書

このアプリは以下の仕様書一式をもとに実装されています。

1. `CLAUDE.md` — Claude Code への最上位指示
2. `docs/01_product_requirement.md` — プロダクト要求仕様
3. `docs/02_training_recipe_july.md` — 7月のトレーニング内容
4. `docs/03_ui_ux_spec.md` — GUI/UX仕様
5. `docs/04_information_architecture.md` — 情報設計
6. `docs/05_data_model.md` — データモデル仕様
7. `docs/06_app_architecture.md` — 技術構成
8. `docs/07_habit_logic.md` — 習慣化ロジック
9. `docs/08_notifications_and_local_first.md` — 通知・ローカル保存方針
10. `docs/09_testing_acceptance.md` — 受け入れ条件
11. `docs/10_development_roadmap.md` — 実装ロードマップ

## 付属 Claude Code skills

このリポジトリには、プロジェクトローカルの Claude Code skills も含まれています。Claude Code 上で利用可能なら、以下を実行できます。

```text
/build-mvp
/ui-review
/ship-check
```

認識されない場合は、`prompts/` の該当プロンプトをそのまま貼り付けてください。

## 注意

このアプリは医療アドバイスではありません。痛み、めまい、体調不良がある場合は運動を中止し、必要に応じて医療専門家へ相談してください。
