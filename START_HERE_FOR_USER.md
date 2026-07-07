# START_HERE_FOR_USER — リポジトリへの置き方と Claude Code での宣言方法

## 1. 新規リポジトリを作る場合

```bash
mkdir training-habit-app
cd training-habit-app
git init
```

このフォルダの中身を、作った `training-habit-app` の直下にすべてコピーしてください。

コピー後の構成例：

```text
training-habit-app/
  CLAUDE.md
  README.md
  START_HERE_FOR_USER.md
  docs/
  prompts/
  assets/
  templates/
  .claude/
  .gitignore
```

## 2. Claude Code を開く

リポジトリ直下で次を実行します。

```bash
claude
```

Claude Code が起動したら、まず次を実行してください。

```text
/memory
```

`CLAUDE.md` が読み込まれていることを確認します。

## 3. 最初の宣言として貼る内容

`prompts/00_bootstrap_prompt.md` を開き、中身を Claude Code にそのまま貼り付けます。

短く始めたい場合は、次でも構いません。

```text
このリポジトリの CLAUDE.md と docs/ 以下をすべて読んで、7月の試験期間向け自宅トレーニング習慣化アプリの実装計画を作成してください。まだコード変更はせず、まず画面構成、技術構成、実装順序、テスト方針を提示してください。
```

## 4. 実装を始める宣言

計画が妥当なら、次を貼ってください。

```text
計画に同意します。まず MVP を実装してください。実装範囲は docs/10_development_roadmap.md の Phase 1 とし、完了後に型チェック、リント、テストを実行して、起動方法と確認方法を報告してください。
```

## 5. GUIをさらに磨かせる宣言

MVPが動いたあと、次を貼ります。

```text
UIを改善してください。docs/03_ui_ux_spec.md を基準に、スマホ第一・試験期間でも使いやすい・毎日起動したくなる見た目にしてください。単なる装飾ではなく、今日やることが3秒以内に分かる情報設計を優先してください。変更後に主要画面の確認手順を示してください。
```

## 6. コミット前レビュー

```text
現在の差分をレビューしてください。docs/09_testing_acceptance.md の受け入れ条件を基準に、機能不足、UIの弱点、型安全性、テスト不足、将来の拡張性の問題を指摘し、必要なら修正してください。
```

## 7. Git操作の例

```bash
git status
git add .
git commit -m "Add training habit app specifications"
```

Claude Code に実装してもらった後は、変更単位ごとにコミットしてください。
