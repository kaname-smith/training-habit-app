# Training Habit App Claude Kit

このリポジトリは、7月の期末試験期間に無理なく自宅トレーニングを習慣化し、8〜9月の本格的な身体づくりへ移行するための **ローカルファースト習慣化アプリ** を Claude Code に作らせるための仕様書一式です。

## 目的

- 7/7夜〜7/31の試験月に、短時間・低騒音・低疲労の自宅トレーニングを継続できるようにする。
- プロテイン摂取、睡眠、試験直前の軽量版メニューを含めて、毎日の判断をアプリが助ける。
- 8〜9月に本格的な筋力・筋肥大トレーニングへ移行できるよう、記録・習慣・フォーム意識を整える。

## Claude Code に最初に読ませるファイル

最重要ファイルは次の順です。

1. `CLAUDE.md` — Claude Code への最上位指示
2. `docs/01_product_requirement.md` — プロダクト要求仕様
3. `docs/02_training_recipe_july.md` — 7月のトレーニング内容
4. `docs/03_ui_ux_spec.md` — GUI/UX仕様
5. `docs/06_app_architecture.md` — 技術構成
6. `docs/09_testing_acceptance.md` — 受け入れ条件
7. `prompts/00_bootstrap_prompt.md` — Claude Code 起動直後に貼る宣言文

## 推奨アプリ構成

- Webアプリ / PWA
- React + TypeScript + Vite
- Tailwind CSS
- localStorage または IndexedDB によるローカル保存
- 将来的にスマートフォンから使いやすいレスポンシブUI
- 初期版はバックエンドなし

## 使い方の概要

```bash
mkdir training-habit-app
cd training-habit-app
git init
# このキットの中身をリポジトリ直下にコピー
claude
```

Claude Code が起動したら、`prompts/00_bootstrap_prompt.md` の内容を貼り付けます。

```text
/memory
```

で `CLAUDE.md` が読まれていることを確認してから、実装を始めます。


## 付属 Claude Code skills

このキットには、プロジェクトローカルの Claude Code skills も含めています。Claude Code 上で利用可能なら、以下を実行できます。

```text
/build-mvp
/ui-review
/ship-check
```

認識されない場合は、`prompts/` の該当プロンプトをそのまま貼り付けてください。

## 注意

このアプリは医療アドバイスではありません。痛み、めまい、体調不良がある場合は運動を中止し、必要に応じて医療専門家へ相談する設計にしてください。
