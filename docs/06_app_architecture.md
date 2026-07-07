# 06 App Architecture — 技術構成

## 1. 推奨スタック

新規実装の場合：

```text
React + TypeScript + Vite
Tailwind CSS
Vitest
React Testing Library
Playwright
localStorage / IndexedDB-ready storage layer
PWA manifest
```

## 2. ディレクトリ構成案

```text
src/
  app/
    App.tsx
    routes.tsx
    providers.tsx
  components/
    ui/
    layout/
    workout/
    nutrition/
    records/
  features/
    onboarding/
    today/
    workout/
    records/
    nutrition/
    settings/
  data/
    seedWorkouts.ts
    julyPlan.ts
  domain/
    workoutTypes.ts
    nutritionTypes.ts
    habitTypes.ts
    calculations.ts
    schedule.ts
  storage/
    storageClient.ts
    repositories.ts
    migrations.ts
  styles/
    globals.css
  tests/
```

## 3. アーキテクチャ方針

- UIとドメインロジックを分離する。
- タンパク質計算、スケジュール生成、習慣判定は pure function にする。
- localStorage 直接アクセスを各画面に散らさない。
- `storage/` に保存層を集約する。
- MVP後にIndexedDBへ置き換え可能にする。

## 4. 画面ルーティング案

```text
/              Today
/onboarding    Initial setup
/workout       Workout selection or current workout
/workout/:id   Workout player
/records       Calendar and logs
/nutrition     Protein tracking
/settings      Settings
```

ルーティングライブラリは必要なら React Router を使う。MVPでは状態ベースの簡易ルーティングでもよいが、拡張性を考えると React Router が望ましい。

## 5. コンポーネント設計

主要コンポーネント：

```text
TodayCard
WorkoutRecommendationCard
FatigueCheckCard
ProteinProgressCard
WorkoutExerciseCard
SetCheckButton
WorkoutCompleteSheet
MonthlyCalendar
ProteinCalculator
BottomTabNav
SafetyNotice
```

## 6. 状態管理

MVPでは React state + custom hooks で十分。

推奨hook：

```text
useUserProfile
useDailyPlan
useWorkoutLogs
useNutritionLogs
useTodayRecommendation
```

Zustand等は必要になったら導入する。

## 7. ストレージ層

```ts
interface StorageClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}
```

localStorage実装でも Promise interface にしておくと、IndexedDBへ移行しやすい。

## 8. PWA

MVPで最低限：

- manifest
- アイコン仮設定
- installable を意識したメタ情報

Service Worker は Phase 2 でもよい。

## 9. エラーハンドリング

- 保存失敗時はトーストまたは控えめなエラーメッセージ
- localStorage破損時はリセット選択肢
- 不正データはmigrationまたはdefault値で復旧

## 10. 品質チェックコマンド例

プロジェクト作成後、Claude Code は package.json に合わせて次を整える。

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

存在しない場合は scripts を追加する。
