# Training Improvements Implementation Prompt

対象ブランチは `feature/training-guidance-v1` です。

次の順で段階実装してください。

1. タイマーとテンポガイドのpure state logic
2. タイマーUIとcomponent tests
3. ExerciseDefinitionの解説拡張
4. Evidence Center
5. Nutrition catalogとschema migration
6. Feedback page
7. export/import更新
8. E2E更新

各段階でtypecheck/lint/testを実行し、小さくコミットしてください。

禁止事項：

- mainへ直接コミット
- 外部送信
- バックエンド追加
- カメラ認識
- 既存localStorageデータの破壊
- 根拠のない健康効果の断定
