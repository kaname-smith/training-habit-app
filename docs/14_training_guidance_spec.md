# 14 Training Guidance Specification

## 1. 目的

トレーニング画面を、単なるチェックリストから「安全に、一定のペースで、迷わず実行するためのプレイヤー」へ拡張する。

## 2. 機能境界

### Phase T1: タイマー基盤

- カウントダウンタイマー
- セット間休憩タイマー
- 反復テンポガイド
- 音・振動・視覚通知設定
- 中断・再開

### Phase T2: 種目ガイド

- 対象部位
- 手順
- フォームキュー
- よくある誤り
- 代替・発展種目
- 安全注意

### Phase T3: 履歴連携

- 実際に完了した秒数
- 選択したテンポ
- 休憩時間
- セットごとのRIRまたは体感

## 3. タイマー設計

### 3.1 CountdownTimer

```ts
interface CountdownTimerConfig {
  durationSeconds: number;
  warningAtSeconds?: number[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
```

実装上は1秒ごとの単純減算だけに依存しない。開始時刻と終了予定時刻を保持し、タブが非アクティブになった後も実時間差から残り時間を再計算する。

状態：

```ts
type TimerState = 'idle' | 'running' | 'paused' | 'completed';
```

### 3.2 RepetitionPacer

```ts
type TempoPreset = 'fast' | 'medium' | 'slow' | 'custom';

interface RepTempo {
  id: TempoPreset;
  secondsPerRep: number;
  phases?: {
    eccentricSeconds: number;
    pauseSeconds: number;
    concentricSeconds: number;
  };
}
```

初期値：

- fast: 2秒/回
- medium: 3秒/回
- slow: 5秒/回

ユーザーに「速いほど良い」「遅いほど良い」と誤解させない。説明文は「動作ペースを一定に保つためのガイド」とする。

## 4. ExerciseDefinition拡張案

```ts
interface ExerciseDefinition {
  id: string;
  name: string;
  aliases?: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  executionMode: 'reps' | 'time';
  defaultReps?: number;
  defaultSeconds?: number;
  defaultSets: number;
  shortCue: string;
  setupSteps: string[];
  movementSteps: string[];
  breathingCue?: string;
  commonMistakes: string[];
  easierAlternativeIds: string[];
  harderAlternativeIds: string[];
  safetyNotes: string[];
  quietApartmentSafe: boolean;
  evidenceIds?: string[];
}
```

## 5. 画面設計

### 実行画面の優先順位

1. 種目名
2. 残り時間または残り回数
3. 開始・一時停止・完了
4. テンポ/タイマー表示
5. 短いフォームキュー
6. 詳細解説
7. 軽量化・中止

### 詳細解説パネル

- 「鍛える場所」
- 「やり方」
- 「よくあるミス」
- 「きつい場合」
- 「余裕がある場合」

## 6. アクセシビリティ

- 音だけで終了を通知しない
- 色だけでタイマーフェーズを示さない
- `prefers-reduced-motion` を尊重
- 画面消灯防止APIは初期対象外
- 振動API非対応端末でも動作する

## 7. 非目標

- カメラによるフォーム認識
- 回数の自動カウント
- 医療診断
- 心拍計連携
- 強制的なトレーニング処方
