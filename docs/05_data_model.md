# 05 Data Model — データモデル仕様

## 1. 方針

MVPはローカルファーストで実装する。最初は localStorage でよいが、将来的に IndexedDB やクラウド同期へ移行しやすい構造にする。

## 2. TypeScript型案

```ts
export type ExperienceLevel = 'beginner' | 'returning' | 'active';
export type WorkoutType = 'intro' | 'A' | 'B' | 'short' | 'rest' | 'walk';
export type WorkoutStatus = 'planned' | 'completed' | 'short_done' | 'rest' | 'skipped' | 'rescheduled';
export type PerceivedEffort = 'easy' | 'good' | 'hard' | 'too_hard';

export interface UserProfile {
  id: string;
  nickname?: string;
  bodyWeightKg: number;
  experienceLevel: ExperienceLevel;
  examMode: boolean;
  examEndDate: string; // ISO date
  proteinPerShakeG: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  target: string[];
  defaultReps?: number;
  defaultSeconds?: number;
  defaultSets: number;
  formCue: string;
  quietApartmentSafe: boolean;
  alternatives?: string[];
}

export interface WorkoutTemplate {
  id: string;
  type: WorkoutType;
  title: string;
  estimatedMinutes: number;
  description: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  seconds?: number;
  side?: 'left-right' | 'none';
  note?: string;
}

export interface DailyPlan {
  date: string; // ISO date
  recommendedWorkoutType: WorkoutType;
  reason: string;
  status: WorkoutStatus;
}

export interface WorkoutLog {
  id: string;
  date: string;
  workoutType: WorkoutType;
  startedAt?: string;
  completedAt?: string;
  effort?: PerceivedEffort;
  notes?: string;
  exerciseLogs: ExerciseLog[];
}

export interface ExerciseLog {
  exerciseId: string;
  completedSets: SetLog[];
}

export interface SetLog {
  setIndex: number;
  reps?: number;
  seconds?: number;
  completed: boolean;
  rir?: number; // reps in reserve, 0-5
}

export interface NutritionLog {
  date: string;
  proteinFromMealsG: number;
  shakeCount: number;
  manualProteinG?: number;
}

export interface FatigueCheckIn {
  date: string;
  sleepHours?: number;
  fatigueLevel: 1 | 2 | 3 | 4 | 5;
  examTomorrow?: boolean;
  recommendationOverride?: WorkoutType;
}
```

## 3. 保存キー案

```text
studyfit:userProfile
studyfit:dailyPlans
studyfit:workoutLogs
studyfit:nutritionLogs
studyfit:fatigueCheckIns
studyfit:settings
studyfit:schemaVersion
```

## 4. 初期データ

トレーニングテンプレート：

- intro
- workout A
- workout B
- short 10 min
- rest
- walk/stretch

7月の初期スケジュールは `docs/02_training_recipe_july.md` を基準に生成する。

## 5. タンパク質計算

```ts
const minProteinG = bodyWeightKg * 1.4;
const maxProteinG = bodyWeightKg * 1.6;
const generalAthleteUpperG = bodyWeightKg * 2.0;
const proteinFromShakesG = shakeCount * proteinPerShakeG;
const totalProteinG = proteinFromMealsG + proteinFromShakesG + manualProteinG;
```

UIでは7月目標として `1.4〜1.6g/kg/day` を表示し、詳細説明で一般的な運動者の参考範囲 `1.4〜2.0g/kg/day` に触れる。

## 6. データ移行

`schemaVersion` を保存する。

初期値：

```json
{
  "schemaVersion": 1
}
```

将来的にデータ構造が変わる場合は migration 関数を用意する。

## 7. エクスポート

MVPではJSONエクスポートがあると望ましい。

```json
{
  "exportedAt": "2026-07-31T12:00:00+09:00",
  "profile": {},
  "workoutLogs": [],
  "nutritionLogs": [],
  "fatigueCheckIns": []
}
```
