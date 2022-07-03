@MR属性
==========

@MR-Spawner
----------

出現テーブルマップのイベントの実行内容に注釈として記述することで、エンティティの出現条件を設定します。

| Name | Type   | Default | Description |
|------|--------|---------|-------------|
| data | string | - | 出現させるエンティティの MR-Key。 |
| troop | string | - | 出現させるトループの MR-Key。1か所に複数の Entity を出現させることができます。 data とは同時に指定できません。 |
| stack | number | 1 | 出現したエンティティのスタック数。 |
| rate | number | 100 | 出現率。 |
| overrideEvent | boolean | false | エンティティを出現させる際の見た目として、この @MR-Spawner が記述されているイベントを使用します。 |


### 例

```sh
@MR-Spawner
  data: "kEntity_スライム_A",
```
