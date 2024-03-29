エディタで設定できる情報 - アイテム
==========

基本設定
----------

| 効果 | 実装状況 | 備考 |
|---|---|---|
| 名前 | ✅ OK |  |
| アイコン | ✅ OK |  |
| 説明 | ✅ OK | [説明] ウィンドウに表示するテキストとなります。 |
| アイテムタイプ | ⛔ 効果なし |  |
| 価格 | ✅ OK | 店頭での販売価格です。売値は 50% が自動的に設定されます。 |
| 消耗 | ⏹️ 未実装 | 現在の消耗の有無は、アクションに紐づいています。 |
| 範囲 | ⚠️ OK | 下記参照。 |
| 使用可能時 | ⛔ 効果なし |  |

### ⚠️ 範囲

- [敵], [単体] は、使用者の目の前のタイル上にいるユニットに対して効果を発動します。
- [敵], [全体] は、使用者と同じ部屋にいるユニットに対して効果を発動します。
- 上記以外の設定は全て使用者に対して効果を発動します。

発動
----------

| 効果 | 実装状況 | 備考 |
|---|---|---|
| 速度補正 | ⛔ 効果なし |  |
| 成功率 | ⏹️ 未実装 |  |
| 連続回数 | ⏹️ 未実装 |  |
| 得TP | ⏹️ 未実装 |  |
| 命中タイプ | ✅ OK |  |
| アニメーション | ✅ OK | 対象に表示するアニメーションとなります。 |

ダメージ
----------

| 効果 | 実装状況 | 備考 |
|---|---|---|
| タイプ | ✅ OK |  |
| 属性 | ✅ OK |  |
| 計算式 | ⚠️ OK | 下記参照。 |
| 分散度 | ✅ OK |  |
| 会心 | ✅ OK |  |

### ⚠️ 計算式

標準システムと同様に指定できますが、次のような違いがあります。

- mhp, mmp は使用できません。代わりに、パラメータ名の前に `max_` を付けると、各種パラメータの最大値を使えます。
    - 例えば、使用者の最大HP なら `a.max_hp` とする。
    - 例えば、対象者の「ちから」の最大値なら `b.max_pow` とする。
- オペランド `c` が使えます。これはダメージの発生に関与したアイテムエンティティです。例えば、武器をモンスターに投げ当てた時は次のようになります。
    - `a`: プレイヤー
    - `b`: モンスター
    - `c`: 武器アイテム

使用効果
----------

| 効果 | 実装状況 | 備考 |
|---|---|---|
| HP回復 | ⏹️ 未実装 |  |
| MP回復 | ⏹️ 未実装 |  |
| TP増加 | ⏹️ 未実装 |  |
| ステート付加 | ✅ OK |  |
| ステート解除 | ✅ OK |  |
| 強化 | ⏹️ 未実装 | Effects.js での ParameterBuff 設定で代用可能。 |
| 弱体 | ⏹️ 未実装 | Effects.js での ParameterBuff 設定で代用可能。 |
| 強化の解除 | ⏹️ 未実装 |  |
| 弱体の解除 | ⏹️ 未実装 |  |
| 特殊効果 | ⏹️ 未実装 |  |
| 成長 | ⏹️ 未実装 | Effects.js での ParameterValue 設定で代用可能。 |
| スキル習得 | ⏹️ 未実装 |  |
| コモンイベント | ⏹️ 未実装 |  |

