# 04 Information Architecture — 情報設計

## 1. サイトマップ

```text
App
├── Onboarding
│   ├── Welcome
│   ├── Body weight
│   ├── Exam mode
│   └── Protein settings
├── Today
│   ├── Recommended plan
│   ├── Fatigue check
│   ├── Protein summary
│   └── Start workout
├── Workout
│   ├── Workout selection
│   ├── Exercise player
│   ├── Set completion
│   └── Finish summary
├── Records
│   ├── Calendar
│   ├── Monthly stats
│   └── Exercise progress
├── Nutrition
│   ├── Protein target
│   ├── Protein shake log
│   └── Meal protein estimate
└── Settings
    ├── Profile
    ├── Exam mode
    ├── Notifications
    ├── Data export
    └── Safety notice
```

## 2. 主要ユーザーフロー

### 2.1 初回利用

```text
アプリ起動
→ 初期設定
→ 今日のダッシュボード
→ 7/7導入メニュー
→ 完了記録
→ プロテイン記録
```

### 2.2 通常日

```text
アプリ起動
→ 今日のおすすめ確認
→ 筋トレA/B開始
→ セットを記録
→ 体感強度を入力
→ プロテイン記録
```

### 2.3 疲れている日

```text
アプリ起動
→ 疲労チェックで「疲れている」
→ 10分版を提案
→ 10分版実施または休息記録
```

### 2.4 試験前日

```text
アプリ起動
→ 試験モードが10分版を推奨
→ 10分版実施
→ 完了後「今日は十分」のメッセージ
```

## 3. 情報の優先順位

### ダッシュボード

1. 今日やるべきこと
2. 開始ボタン
3. 軽量版・休息への逃げ道
4. タンパク質状況
5. 月間進捗

### トレーニング中

1. 現在の種目
2. 回数・秒数
3. セット完了
4. フォーム注意
5. 中止・軽量化

### 記録画面

1. 今月の実施状況
2. 週ごとの実施回数
3. 種目別進歩
4. 詳細履歴

## 4. 文言設計

避ける文言：

- サボり
- 失敗
- 連続記録が途切れた
- もっと追い込め
- 根性

使う文言：

- 今日はこれで十分
- 試験月の目的は継続
- 休息も計画の一部
- 10分版でつなぐ
- 8月への助走

## 5. 状態の種類

```text
planned        予定あり
completed      通常完了
short_done     10分版完了
rest           休息
skipped        未記録
rescheduled    変更済み
```

`skipped` をユーザーに直接「失敗」と見せない。
