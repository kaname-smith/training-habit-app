# 20 Calendar Integration Strategy

## 1. 結論

Google Calendar連携は初期Study Plannerの必須条件にしない。まず手動の固定予定入力でスケジューラーを完成させ、その境界にCalendar Adapterを追加する。

## 2. 段階導入

### Calendar Phase 0: 手入力

- 授業
- 試験
- 通学
- アルバイト
- 既存予定
- 睡眠

繰り返し予定を登録可能にする。

### Calendar Phase 1: ICS import

- 外部通信なし
- カレンダーを書き出した `.ics` をユーザーが手動で読み込む
- 読み取り専用
- 予定をAvailabilityBlockへ変換

### Calendar Phase 2: Google Calendar read-only

- OAuth 2.0
- 最小権限のread-only scope
- 明示的な接続操作
- 接続解除・トークン失効方法を用意
- カレンダー予定をStudyFit内のbusy blockへ変換

### Calendar Phase 3: 書き込み

初期対象外。予定生成結果をGoogle Calendarへ書き込む場合は、重複作成、更新、削除、タイムゾーン、権限を別途設計する。

## 3. アーキテクチャ

```ts
interface CalendarEventSource {
  listBusyIntervals(range: DateRange): Promise<BusyInterval[]>;
}

class ManualCalendarSource implements CalendarEventSource {}
class IcsCalendarSource implements CalendarEventSource {}
class GoogleCalendarSource implements CalendarEventSource {}
```

スケジューラーはGoogle固有型に依存しない。

## 4. GitHub Pages上の注意

現在のアプリは静的Webアプリである。Google Calendar APIはREST APIであり、利用者の予定へアクセスするにはOAuth 2.0認可が必要になる。

ブラウザのみで実装する場合も、OAuth client設定、redirect URI、scope、token管理、公開アプリとしての同意画面設定が必要になる。したがって、試験直前の初期版に含めない。

## 5. 権限原則

- read-onlyから開始
- 必要最小限のscope
- 自動接続しない
- StudyFitのlocalStorage記録とCalendarデータを混同しない
- カレンダー内容をGitHubへ保存しない
- exportにカレンダー本文を含めるかはユーザー選択制

## 6. 代替案

試験まで2週間という制約下では、手動予定登録の方が実装リスクが低く、すぐ利用できる。Google Calendar連携は、Study Plannerのスケジューリングロジックが実利用で有効と確認された後に実装する。
