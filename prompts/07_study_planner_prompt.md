# Study Planner Foundation Prompt

対象ブランチは `feature/study-planner-foundation` です。

最初のMVPはGoogle Calendar連携ではありません。以下を優先してください。

1. 科目・試験・資料の登録
2. unknown/confidence状態
3. Discovery Task生成
4. 固定予定の手入力
5. 説明可能な優先度計算
6. 空き時間への学習ブロック割当
7. セッションタイマー
8. 実績による再計画

Google Calendarはadapter interfaceだけ設計し、実API/OAuthは実装しないでください。

最初にdomain modelとpure functionsを実装し、UIより先にunit testで以下を固定してください。

- 不明な試験情報からDiscovery Taskが生成される
- 固定予定と学習予定が重ならない
- 利用可能時間を超えて割り当てない
- 優先順位の理由を生成できる
- 過去実績を変更せず未来だけ再計画する
