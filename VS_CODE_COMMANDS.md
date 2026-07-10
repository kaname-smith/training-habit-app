# VS Code / WSL Commands

以下は、既存リポジトリが `~/jisda/training-habit-app` にある前提です。

## 0. 重要な注意

- WSLターミナルで実行する
- `which node`, `which npm`, `which claude` が `/mnt/c/...` を指していないことを確認
- `main` がcleanであることを確認してからbranchを作る
- ダウンロードしたZIPを直接既存ファイルへ上書きせず、一時ディレクトリへ展開して差分を確認する

## 1. 環境確認

```bash
cd ~/jisda/training-habit-app
which node
which npm
which claude
git status
git branch --show-current
git pull --ff-only origin main
```

期待：

```text
On branch main
nothing to commit, working tree clean
```

## 2. 設計書を取り込む

ダウンロードした `studyfit_expansion_spec_bundle.zip` をリポジトリ直下へ一時的に置いた場合：

```bash
cd ~/jisda/training-habit-app
rm -rf /tmp/studyfit-expansion
mkdir -p /tmp/studyfit-expansion
unzip studyfit_expansion_spec_bundle.zip -d /tmp/studyfit-expansion
cp -a /tmp/studyfit-expansion/studyfit_expansion_spec_bundle/. .
rm -rf /tmp/studyfit-expansion
rm studyfit_expansion_spec_bundle.zip

git status
git diff --check
```

## 3. 設計書専用branchでコミット

```bash
git switch -c docs/studyfit-expansion-plan
git add EXPANSION_START_HERE.md VS_CODE_COMMANDS.md docs prompts .claude/skills/plan-studyfit-expansion
git diff --cached --stat
git commit -m "Add StudyFit expansion specifications"
```

設計書をmainへ入れる場合は、まずこのbranchをpushして内容を確認する。

```bash
git push -u origin docs/studyfit-expansion-plan
```

mainへ統合する操作は、レビュー後に行う。

## 4. Training改善branch

設計書branchをmainへ統合済みなら：

```bash
cd ~/jisda/training-habit-app
git switch main
git pull --ff-only origin main
git switch -c feature/training-guidance-v1
code .
```

Claude Codeを開く：

```bash
claude
```

最初に貼る：

```text
prompts/05_expansion_bootstrap_prompt.md と prompts/06_training_improvements_prompt.md を読んでください。まだコード変更はせず、Training改善だけの詳細計画を提示してください。
```

## 5. Study Plannerをworktreeで分離

```bash
cd ~/jisda/training-habit-app
git switch main
git pull --ff-only origin main
git worktree add ../training-habit-app-study \
  -b feature/study-planner-foundation main
```

別のVS Codeウィンドウで開く：

```bash
code ../training-habit-app-study
```

または：

```bash
cd ../training-habit-app-study
code .
claude
```

Claude Codeへ貼る：

```text
prompts/05_expansion_bootstrap_prompt.md と prompts/07_study_planner_prompt.md を読んでください。まだコード変更はせず、Study Planner Foundationだけの詳細計画を提示してください。
```

## 6. worktree確認

```bash
git worktree list
git branch --list
```

## 7. 日常作業

```bash
git status
npm install
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

変更は小さくコミットする。

```bash
git add <files>
git commit -m "Add countdown timer foundation"
```

## 8. mainを最新化するとき

各feature branch内で：

```bash
git fetch origin
git merge origin/main
```

または履歴を直線化する方針ならrebaseを使うが、共同作業中やpush済みbranchでは慎重に扱う。

## 9. worktree削除

Study Planner branchをマージまたは破棄した後だけ実行する。

```bash
git worktree remove ../training-habit-app-study
git worktree prune
```

branchを残す場合は削除しない。

## 10. mainへ直接実装していないことの確認

```bash
git branch --show-current
git status
git log --oneline -5
```

Trainingなら `feature/training-guidance-v1`、Studyなら `feature/study-planner-foundation` と表示されることを確認する。
