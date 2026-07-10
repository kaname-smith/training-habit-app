# StudyFit Expansion — START HERE

このフォルダは、既存の StudyFit Primer を壊さずに、次の2系統を拡張するための設計書一式です。

1. **Body / Training 改善**
   - トレーニングタイマー
   - 反復テンポ表示
   - 種目解説・対象筋・安全上の注意
   - 根拠を説明するEvidence Center
   - プロテイン商品カタログと栄養記録の一般化
   - アプリ内フィードバック記録

2. **Study Planner 新設**
   - 試験日・試験範囲・資料・出席状況の不確実性を含む初期調査
   - 履修科目と固定予定の登録
   - 情報収集タスクと学習タスクの統合
   - 説明可能な優先順位付け・時間割生成・再計画
   - 将来のGoogle Calendar連携を見据えた境界設計

## 推奨開発方式

- `main`: 公開中の安定版。直接実験しない。
- `feature/training-guidance-v1`: トレーニング・栄養・Evidence・Feedback改善。
- `feature/study-planner-foundation`: 学習管理機能の実験開発。
- 学習機能は `git worktree` を使い、別VS Codeウィンドウで開発する。

同じアプリとして統合する予定であり、共通UI、プロフィール、localStorage、export/import、GitHub Pagesを共有するため、現時点では別リポジトリに分けない。

## 最初にClaude Codeへ読ませる順序

1. `docs/13_real_use_feedback_round1.md`
2. `docs/14_training_guidance_spec.md`
3. `docs/15_nutrition_catalog_architecture.md`
4. `docs/16_evidence_center_spec.md`
5. `docs/17_feedback_loop_spec.md`
6. `docs/18_study_planner_product_spec.md`
7. `docs/19_study_planning_algorithm.md`
8. `docs/20_calendar_integration_strategy.md`
9. `docs/21_branch_repository_strategy.md`
10. `docs/22_acceptance_criteria_expansion.md`
11. `docs/23_references_and_evidence.md`
12. `docs/24_study_planner_foundation_decisions.md`(実装直前に確定した決定事項。解釈に迷ったら最優先で参照する)

Claude Codeへの初回宣言は `prompts/05_expansion_bootstrap_prompt.md` を使用してください。
