# StudyFit Expansion Bootstrap Prompt

このブランチでは、既存のStudyFit Primerを壊さずに、実利用フィードバックに基づく改善とStudy Plannerの設計を行います。

まず以下を読んでください。

- `CLAUDE.md`
- `docs/13_real_use_feedback_round1.md`
- `docs/14_training_guidance_spec.md`
- `docs/15_nutrition_catalog_architecture.md`
- `docs/16_evidence_center_spec.md`
- `docs/17_feedback_loop_spec.md`
- `docs/18_study_planner_product_spec.md`
- `docs/19_study_planning_algorithm.md`
- `docs/20_calendar_integration_strategy.md`
- `docs/21_branch_repository_strategy.md`
- `docs/22_acceptance_criteria_expansion.md`
- `docs/23_references_and_evidence.md`
- `docs/24_study_planner_foundation_decisions.md`

まだコード変更はしないでください。

最初に次を報告してください。

1. 現在のブランチ名、HEAD、working tree状態
2. 既存アーキテクチャで再利用できる部分
3. Training改善とStudy Plannerを分ける実装計画
4. localStorage schema migrationへの影響
5. export/importへの影響
6. 新規画面・route・データ型の見込み
7. テスト戦略
8. mainへ影響を与えない進行方法
9. 最初の小さな実装単位
10. 不明点・リスク

Training改善とStudy Plannerを同時に一括実装しないでください。計画承認後、指定されたブランチの範囲だけ実装してください。
