# 18 Study Planner Product Specification

## 1. プロダクト目的

期末試験まで約2週間しかない状況で、試験日・試験範囲・授業資料・現在の理解度が不明確でも、まず不足情報を収集し、限られた時間を説明可能な方法で配分する。

## 2. 最重要原則

**不明なゴールを、既知であるかのように予定化しない。**

Study Plannerの最初の仕事は、学習予定の生成ではなく、予定生成に必要な前提条件を明らかにすることである。

## 3. モジュール構成

```text
Study
├── Overview
├── Courses
├── Exams
├── Materials
├── Discovery tasks
├── Study tasks
├── Schedule
├── Session timer
├── Review
└── Settings
```

## 4. 初期セットアップ

### 4.1 科目登録

- 科目名
- 曜日・時限
- 単位数
- 担当教員
- LMS/授業ページURL
- 出席状況
- 現在の理解度
- 重要度

### 4.2 試験情報

各項目は値だけでなく確信度を持つ。

```ts
type ConfidenceLevel = 'unknown' | 'low' | 'medium' | 'confirmed';

interface ExamInfo {
  courseId: string;
  examDate?: string;
  examDateConfidence: ConfidenceLevel;
  scopeText?: string;
  scopeConfidence: ConfidenceLevel;
  format?: 'written' | 'oral' | 'report' | 'unknown';
  allowedMaterials?: string;
  weightPercent?: number;
}
```

### 4.3 資料状況

- シラバス
- 講義スライド
- 教科書範囲
- 課題
- 過去問
- 友人・教員からの確認
- 欠落資料

## 5. Discovery Task

不明情報を埋める行動を正式なタスクとして扱う。

例：

- UTAS/LMSで試験日を確認
- シラバスを確認
- 授業資料を全件ダウンロード
- 友人に試験範囲を確認
- 教員の告知を検索
- 過去問の有無を確認

Discovery Taskは、試験範囲が不明な科目では通常の勉強より先に高優先度になる。

## 6. 学習タスク

```ts
interface StudyTask {
  id: string;
  courseId: string;
  title: string;
  taskType: 'discovery' | 'reading' | 'lecture_recovery' | 'problem_solving' | 'memorization' | 'past_exam' | 'review';
  estimatedMinutes: number;
  remainingMinutes: number;
  prerequisiteTaskIds: string[];
  deadline?: string;
  importance: 1 | 2 | 3 | 4 | 5;
  uncertainty: 1 | 2 | 3 | 4 | 5;
  masteryBefore?: 1 | 2 | 3 | 4 | 5;
  masteryAfter?: 1 | 2 | 3 | 4 | 5;
  status: 'backlog' | 'ready' | 'scheduled' | 'in_progress' | 'done' | 'blocked';
}
```

## 7. 時間管理

「秒刻み」は実行タイマーで行う。予定表そのものを秒単位で組むと変更に弱くなるため、計画粒度は原則5分または15分とする。

- 計画：5〜15分粒度
- 学習セッション計測：秒精度
- 休憩：分単位
- 実績：秒または分で保存

## 8. Daily Study画面

- 今日の最優先3項目
- まず確認すべき不明事項
- 空き時間
- 次の学習ブロック
- セッション開始
- 遅れた場合の再計画

## 9. 共通アプリ設計

BodyとStudyで共有：

- App shell
- 下部ナビゲーション
- プロフィール
- 日付処理
- export/import
- feedback
- settings
- design tokens

別ドメインとして分離：

- workout
- nutrition
- study courses
- scheduling
- calendar integration

## 10. 非目標（初期）

- 自動で大学LMSへログイン
- メールの無断取得
- Google Calendarへの書き込み
- AIが試験範囲を断定
- 数学的最適性を保証するスケジューラー
