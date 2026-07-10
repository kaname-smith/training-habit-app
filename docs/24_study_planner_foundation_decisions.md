# 24 Study Planner Foundation — Decisions

このドキュメントは、`docs/18`〜`docs/22`のレビュー後にユーザーとClaude Codeの間で確定した、Study Planner Foundation実装前の意思決定を記録する。実装や仕様の解釈に迷った場合はこのドキュメントを優先する。

確定日: 2026-07-11

## 1. Study Plannerを最優先にする理由

期末試験まで約2週間しかなく、試験日・試験範囲・資料・現在の理解度が不明確な状態である。この不確実性を解消し、実際の試験勉強に使える最小機能を早期に投入することが、既存Training機能の改善より優先度が高いと判断した。Training改善(`feature/training-guidance-v1`)は中止ではなく、Study Planner Foundationの最小実用版(Milestone S1)完成後に着手する。現時点ではTraining側の重大不具合修正のみ許可する。

## 2. マイルストーン分割(S1 / S2)

`docs/18_study_planner_product_spec.md`・`docs/19_study_planning_algorithm.md`が示す機能一式を、独立して利用価値を持つ二段階に分割する。

### Milestone S1: Situation Assessment

「何を知らないかを明らかにして、試験準備の前提を集める」ことに特化した、単独で完結する機能。

1. 科目登録
2. 試験情報登録
3. 試験日・試験範囲・資料の確信度(`ConfidenceLevel`)入力
4. 資料の有無・収集状況の記録
5. 不明情報の自動検出(input audit / unknown detection)
6. Discovery Taskの生成
7. Discovery Taskの完了記録
8. 授業・試験・既存予定の手入力(固定予定データの収集のみ。空き時間算出はS2)
9. localStorage保存
10. JSON export/import対応

S1は`docs/19`のパイプラインのうち **Input Audit → Unknown detection → Discovery task generation** までに対応する。

S1が以下を満たせば、S2完成前でも`main`への統合候補にできる(実際の統合には都度別途承認が必要)。

- typecheck成功
- lint成功
- unit/component test成功
- build成功
- E2E成功
- スマホ実機確認
- export/import後方互換性確認

### Milestone S2: Planning and Execution

S1完成後に実装する。

1. 学習タスク登録(discovery以外の`StudyTask`)
2. 利用可能時間算出(S1で収集した固定予定から空き時間を構築)
3. 優先度スコア
4. 学習ブロック割り当て
5. 「なぜ今これを行うか」の説明
6. 今日の学習予定
7. セッションタイマー
8. 実時間記録
9. 未来の予定だけを対象とする再計画
10. Review画面

S2は`docs/19`の **Workload estimation → Available-time construction → Priority scoring → Time-block allocation → Daily execution → Actual-time feedback → Replanning** に対応する。

## 3. 下部ナビゲーション最終形

暫定タブ数を増やさず、Study Planner Foundation(S1)の時点で最終形へ変更する。

```text
今日 / Body / Study / 記録 / 設定
```

- 既存route(`/workout`, `/nutrition`)は削除せず維持する。下部タブから直接表示されなくなるだけで、Bodyハブから遷移できるようにする。
- このIA変更は**Study Planner FoundationのS1に含める**(Training側の担当として先送りしない)。

## 4. Bodyハブの役割

新規`BodyHubPage`(`/body`)を作り、以下への入口をまとめる。

- トレーニング(`/workout`)
- 栄養(`/nutrition`)
- Body側の概要

既存の`WorkoutPage`・`NutritionPage`・そのroute自体は変更しない。

## 5. Study内部の情報設計

`/study`を Study Overview とし、以下は下部タブに追加せず、Study Overview内のカードまたは上部ナビで移動する。

```text
Study Overview (/study)
├── Courses            (/study/courses)
├── Exams               (/study/exams)
├── Materials            (/study/materials)
├── Discovery Tasks     (/study/discovery)
├── Study Tasks          (/study/tasks)      … S2
├── Availability         (/study/availability)
├── Schedule             (/study/schedule)   … S2
└── Review               (/study/review)     … S2
```

S1時点では Courses / Exams / Materials / Discovery Tasks / Availability(手入力のみ)を実装し、Study Tasks / Schedule / Review はS2で追加する。

## 6. Study専用Context方針

既存`AppDataContext`へStudyの全collectionとCRUDを直接追加しない。Study専用のProviderを新設する。

```text
src/features/study/context/StudyDataContext.tsx
src/features/study/context/studyDataContextDefinition.ts
src/features/study/context/useStudyData.ts
```

**配置: `AppDataProvider`の内側、かつ `/study/*` route配下にのみネストする(route-scoped)。**

```tsx
<AppDataProvider>
  <AppShell>
    <Routes>
      ...
      <Route
        path="/study/*"
        element={
          <StudyDataProvider>
            <StudyRoutes />
          </StudyDataProvider>
        }
      />
      ...
    </Routes>
  </AppShell>
</AppDataProvider>
```

理由:

- 既存の`profile`ゲート(未設定ならOnboarding)を引き続き利用できる。
- `/study`を訪れない限りStudyのstorage読み込みが発生せず、初期ロードが軽い。
- export/import/resetは`src/storage/repositories.ts`のstorage層関数(`exportAllData`/`importAllData`/`resetAllData`/`validateDataExport`)がStudyのstorage keyも直接読み書きすることで実現し、React state層(`StudyDataContext`)を経由しない。SettingsとStudyは別routeのため、reset/import操作時にStudyDataProviderは通常マウントされておらず、次回`/study`訪問時に自動的に最新storageから再読み込みされる。AppDataContextとの直接的なstate同期コードは不要。
- 既存`AppDataContext`(Training側が今後も変更する)の再レンダリング範囲やcontext値変更の影響を受けない。

アプリ全体で共有するもの(Study側もこの共通層と連携する):

- export/import
- reset
- schemaVersion
- 共通プロフィール(`UserProfile`)
- 日付処理(`src/domain/schedule.ts`のUTC-epoch-ms方式を踏襲)
- 共通デザインシステム(`src/components/ui/*`)

## 7. Storage key命名とschemaVersion規則

Study用storage keyは既存命名規則に従い、明示的に名前空間を付ける。

```text
studyfit:studyCourses
studyfit:studyExamInfos
studyfit:studyMaterials
studyfit:studyTasks
studyfit:studyAvailabilityBlocks
studyfit:studyScheduleBlocks
studyfit:studySessionLogs
```

S1では`studyCourses` / `studyExamInfos` / `studyMaterials` / `studyTasks`(discoveryのみ)/ `studyAvailabilityBlocks`を使用する。`studyScheduleBlocks` / `studySessionLogs`はS2で追加する。

schemaVersionの運用規則(確定済み、再掲):

- 新しい任意キーを追加し、古いデータがそのまま読める場合は必ずしもversionを上げない
- 既存フィールドの意味・型・構造を変更する場合はversionを上げる
- 既存データを変換するmigrationが必要な場合はversionを上げる
- validatorは過去versionを明示的に扱う
- migration後も元のユーザーデータを失わない

Study側の新規storage keyは既存データの変換を伴わない追加のみのため、`CURRENT_SCHEMA_VERSION`は据え置きで構わない。export/importではStudyフィールドをoptionalとして扱い、Study未対応の旧export(現行のv1形式)を引き続きimportできるようにする(後方互換テストを必須とする)。version bumpが必要になった時点(例: Nutrition catalog migration)では、実装者はその時点の`main`最新versionを確認し、番号を競合させない。

## 8. Discovery TaskとStudyTaskの関係

Discovery Taskは独立エンティティにせず、`StudyTask`の一種として扱う。

```ts
type StudyTaskType =
  | 'discovery'
  | 'learning'
  | 'practice'
  | 'review'
  | 'administrative';
```

「Discovery task generation」はアルゴリズムの処理段階を指し、生成結果は`StudyTask`(`taskType: 'discovery'`)として保存する。

## 9. Feature flag方針

Study Planner Foundationはbranch/worktreeで隔離し、完成・テスト・実機確認が終わるまで`main`へマージしない。そのためfeature flagは追加しない。以下のいずれかが発生した場合のみ追加を再検討する。

- 未完成機能を`main`へ先行マージする必要が生じた
- 同一ビルド内でStudy機能のON/OFFを切り替える必要が生じた
- 段階的ロールアウトが必要になった

## 10. Google Calendar / OAuth / ICSの扱い

今回(S1・S2とも)実装しない。`docs/20_calendar_integration_strategy.md`が定義する`CalendarEventSource`インターフェースの設計のみS2で行い、`ManualCalendarSource`相当(手入力)のみ実装する。OAuth・ICS・Google Calendar APIの実装はこのFoundationの対象外。

## 11. 中間リリース(mainへの統合)の品質基準

S1・S2それぞれの完成時点で、以下をすべて満たした場合のみ`main`への統合候補とする。実際の統合(merge/push)は、この基準を満たした後も**都度別途承認を得てから**行う。

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

- 全コマンド成功
- `main`へ直接実験コミットしていない
- localStorage export/importの後方互換テストがある(Study未対応の旧exportをimportできる)
- スマホ実機で主要導線を確認
- GitHub Pages base pathでbuild確認

## 12. 関連ドキュメント

- `docs/18_study_planner_product_spec.md` — プロダクト仕様(§11に本ドキュメントへの参照を追記)
- `docs/19_study_planning_algorithm.md` — アルゴリズム仕様(§11にS1/S2対応を追記)
- `docs/21_branch_repository_strategy.md` — ブランチ戦略(§8に本ドキュメントへの参照を追記)
- `docs/22_acceptance_criteria_expansion.md` — 受け入れ基準(E章がStudy Planner Foundation全体の基準。本ドキュメントのS1/S2分割と合わせて読む)

## 13. MaterialStatusの確定(2026-07-11追記、Phase 0補正)

Phase 0実装時のレビューで、`MaterialItem.status`に`'not_applicable'`(不要・存在しないと確認済み)を追加した。

- `missing` / `partial`: Discovery Task対象(不足扱い)
- `complete` / `not_applicable`: Discovery Task対象外(解消済み扱い)

`not_applicable`が無いと、過去問等が実際に存在しない科目でDiscovery Taskが永久に残るため。`AvailabilityBlock`は展開済みの単発時間帯のみを表し、S1では繰り返しルールを導入しない(§7参照)。

## 14. importは全置換であること(2026-07-11追記、Phase 1確定)

`importAllData`はBody系・Study系を問わず常に「全置換」である。Studyフィールドを持たない旧export(Study Planner登場前のexport)をimportすると、Study系データは(旧exportに存在しないため)空配列に上書きされる。Body系データが復元されればStudy系データが消えても構わないという前提であり、部分import(Bodyのみ/Studyのみを選んで復元する機能)は現時点では実装しない。

Study UIが実装されStudyデータが実運用で蓄積される段階(Phase 4以降)で必要性が確認できた場合にのみ、部分importの追加を検討する。

## 15. Phase 4完了時点の追加事項(2026-07-11追記)

Study Planner S1の5モジュール(Courses / Exams / Materials / Discovery Tasks / Availability)の実装が完了した(`feature/study-planner-foundation`ブランチ)。main統合前レビューにあたり、以下を記録する。

- **AvailabilityBlockは確定どおり単発ブロックのまま実装した。** 繰り返しルール(`recurrenceRule`等)はS1では持たせていない。毎週の予定はその都度1件ずつ登録する運用とし、AvailabilityPage上にその旨を表示している。
- **`datetime-local`のネイティブ値をそのまま`start`/`end`に保存している**(例:`"2026-07-13T10:00"`)。タイムゾーン情報を持たないローカル時刻文字列であり、秒精度もない。Phase 0/1のテストで使っていた完全ISO形式(`"...T10:00:00.000Z"`)とは表現が異なるが、型は単なる`string`のため矛盾はない。
- **S2でこれらの値をスケジューリング(空き時間算出・学習ブロック割当)に使う場合は、この「タイムゾーンなしのローカル時刻文字列」という前提を踏まえて日時比較・ソートロジックを設計し直す必要がある。** 特に日をまたぐ判定やAsia/Tokyo基準の検証(`docs/19`§9)を行う際は、現状のnaiveな文字列比較(`localeCompare`によるソート等)では不十分になる可能性がある。
- **Discovery Tasksは現時点で科目ごとのグルーピング表示をしていない。** タイトル文字列に科目名が埋め込まれているため実用上は判別できるが、科目数が増えた場合は一覧の可読性が下がる可能性がある。
- **Studyデータが実運用で蓄積された後は、将来的に部分import(Bodyのみ/Studyのみを選んで復元する機能)が必要になる可能性がある。** 現時点(§14)ではimportは常に全置換であり、Study未対応の旧exportをimportするとStudy系データが空配列に上書きされる。この挙動は現状許容しているが、実運用開始後に問題が顕在化した場合はPhase 4以降で再検討する。
- **既存E2E(`navigation.spec.ts`)で、下部ナビの短いラベル(「記録」等)とStudy側カードの文言(「...を記録する」等)が部分一致で衝突する事象が実際に発生した。** Playwrightの`getByRole('link', {name})`は既定で部分一致するため、今後Study側に新しい文言を追加する際は、既存の下部ナビラベルとの部分一致衝突がないか確認し、必要に応じて`exact: true`を使う。
- **スマホ実機確認はローカルLANプレビューで完了済み(2026-07-11)。** GitHub Pages本番URLでの確認は、main統合・push・再デプロイ後に別途実施する。
