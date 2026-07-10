# 21 Branch and Repository Strategy

## 1. 推奨結論

**同一リポジトリの別ブランチで開発する。別リポジトリには分けない。**

理由：

- 同一アプリ内で使用する
- UIコンポーネントを共有する
- プロフィール、日付、設定、export/importを共有する
- GitHub Pagesの公開先を一本化できる
- データmigrationを一元管理できる

## 2. mainの役割

- GitHub Pages公開版
- テスト済み
- working tree clean
- 実験コードを直接入れない
- Pull Requestまたは明示的レビュー後にのみマージ

## 3. 推奨ブランチ

```text
main
├── feature/training-guidance-v1
└── feature/study-planner-foundation
```

トレーニング改善とStudy Plannerを同じ巨大ブランチで実装しない。

## 4. worktree推奨

Study Plannerは規模が大きいため、別フォルダへcheckoutする。

```bash
git worktree add ../training-habit-app-study \
  -b feature/study-planner-foundation main
```

これにより：

- `~/jisda/training-habit-app` はmainまたはトレーニング改善用
- `~/jisda/training-habit-app-study` はStudy Planner用
- 2つのVS Codeウィンドウを分離できる
- branch切替事故を減らせる

## 5. 別リポジトリにする条件

以下のいずれかが成立した場合に再検討する。

- Study機能を完全に別サービスとして公開する
- 別の技術スタックが必要
- 独立した認証・バックエンドを持つ
- リリース周期が完全に異なる
- 共通コードがほぼない
- 別チームが所有する

現状はいずれも該当しない。

## 6. 統合方法

1. feature branchで実装
2. typecheck/lint/test/build/e2e
3. UI実機確認
4. export/import migration確認
5. mainを取り込んで競合解消
6. Pull Requestまたはローカルレビュー
7. mainへマージ
8. Pages deploy確認

## 7. Feature Flag

Study Plannerは未完成状態でmainへ混入しない。必要であれば以下を使用する。

```ts
const features = {
  studyPlanner: false,
};
```

ただし、長期間の未使用コードをmainに置くより、完成までbranchで隔離することを優先する。

## 8. Study Planner Foundationの二段階マイルストーン(2026-07-11確定)

`feature/study-planner-foundation`は、単独で利用価値を持つMilestone S1(Situation Assessment)とMilestone S2(Planning and Execution)に分割して実装する。詳細は`docs/24_study_planner_foundation_decisions.md`を参照。

- S1が完成し品質基準(§6の統合方法に加えexport/import後方互換確認)を満たした場合、S2完成前でも`main`への統合候補にできる。ただし実際の統合(merge/push)は、その都度別途承認を得てから行う。
- 下部ナビゲーション最終形(今日 / Body / Study / 記録 / 設定)への変更とBodyハブ新設は、Training側の作業として先送りせず、Study Planner Foundation(S1)のスコープに含める。
