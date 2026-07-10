# 15 Nutrition Catalog Architecture

## 1. 目的

現行の「プロテイン杯数」と「食事由来タンパク質」を、将来ほかの栄養素へ拡張可能な一般モデルへ移行する。ただし、既存ユーザーデータを壊さない。

## 2. 設計原則

- 記録値は小数を許容する
- 商品と摂取記録を分離する
- 1杯、1本、100g等の単位を製品ごとに定義する
- 栄養素はIDベースで追加可能にする
- 既存の `shakeCount` はmigrationで新形式へ変換する
- 実記録はlocalStorageに残し、export/import対象にする

## 3. データモデル案

```ts
type NutrientId = 'protein' | 'carbohydrate' | 'fat' | 'energy_kcal' | string;

interface NutrientDefinition {
  id: NutrientId;
  label: string;
  unit: 'g' | 'mg' | 'kcal' | string;
  decimals: number;
  enabled: boolean;
}

interface CatalogItem {
  id: string;
  name: string;
  brand?: string;
  category: 'protein_powder' | 'drink' | 'food' | 'meal' | 'custom';
  servingLabel: string;       // 例: 付属スプーン2杯
  servingAmount: number;      // 例: 30
  servingUnit: string;        // 例: g
  nutrientsPerServing: Record<NutrientId, number>;
  notes?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NutritionIntakeLog {
  id: string;
  date: string;
  catalogItemId?: string;
  customLabel?: string;
  servingMultiplier: number; // 0.5, 1, 1.5等
  nutrients: Record<NutrientId, number>;
  recordedAt: string;
}
```

## 4. 製品カタログUX

### 商品一覧

- 商品名
- メーカー
- 1食量
- タンパク質/1食
- 使用中/アーカイブ

### 商品追加

最低入力：

- 商品名
- 1食の説明
- 1食量
- タンパク質量

任意入力：

- メーカー
- その他栄養素
- メモ

### 記録時

1. 商品を選択
2. 量を0.5 / 1 / 1.5 / 2食、または自由入力
3. 自動計算されたタンパク質量を確認
4. 保存

記録画面から商品追加画面へ移動し、追加後は元の記録フローへ戻す。

## 5. 食事入力

- タンパク質は0.1g単位
- HTML `step="0.1"`
- 内部ではnumberとして保持
- UI表示時に過剰な浮動小数誤差を丸める

## 6. Migration案

旧形式：

```ts
{
  date,
  proteinFromMealsG,
  shakeCount,
  manualProteinG
}
```

新形式では、旧 `shakeCount` を「Legacy protein shake」商品に変換する。既存設定 `proteinPerShakeG` を栄養値として利用する。

```ts
CURRENT_SCHEMA_VERSION = 2
```

migrationは冪等にし、元データを失敗時に消さない。移行前バックアップを生成可能にする。

## 7. 将来拡張

- 炭水化物
- 脂質
- エネルギー
- 食物繊維
- 水分
- 体重推移との関連表示

目標量を追加するときは、根拠ページと必ず紐付ける。
