パラメータ
==========

ツクール互換のパラメータ
----------

- HP
- MP
- TP
- ATK（物理攻撃力）
- DEF（物理防御力）
- MAT（魔法攻撃力）
- MDF（魔法防御力）
- AGI（俊敏性） ⚠️下記参照
- LUK（運）

### AGI (俊敏性)

AGI は行動回数に関係します。

- 0~99 は等速で、100 ごとに行動回数が 1 増えます。AGI が 200 のユニットの行動回数は 3（いわゆる3倍速）です。
- AGI がマイナスになると、行動回数が減ります（いわゆる鈍足）。-1~-99 は2ラウンドに1回しか行動できません。-100 ごとにさらに行動回数が減ります。

MRシステムの標準パラメータ
----------

### FP (満腹度: Fullness Point)

ターンが経過すると少しずつ減っていき、 0 になると飢餓状態となって HP が減っていきます。

表示上は % ですが、内部的には 10000 を 100% とした値で管理されます。通常状態では 1 ターンに 10 減っていき、10 ターン経過すると表示上の 1% が減ることになります。

### POW (ちから: Power)

物理攻撃のダメージに関係する追加パラメータです。

エディタで指定できる [計算式] の .atk に、次のように影響します。

```js
atk + (atk * ((pow - 8) / 16))
```

要約すると次のようになります。

- ちからが 8 → 元の atk そのままとなる。
- ちからが 0 → 元の atk の半分となる。
- ちからが 24 → 元の atk の2倍となる。

### UP (強化値: Upgrade)

装備を強化、または劣化したときに付加される ± の修正値です。

このパラメータはアイテム Entity が持ちます。

### UC (使用回数: Usage Count)

杖など使用回数を持つアイテムの残り使用回数です。

このパラメータはアイテム Entity が持ちます。
