Traits
==========

FixedDamage
----------

与えるダメージ値を、計算式にかかわらず固定の値にします。回復には影響しません。

```
<RE-Trait: FixedDamage(param, value)>
```

| 名前 | 説明 |
|------|------|
| param | 対象パラメータ名。 |
| value | ダメージ値。 |

### 例

```sh
# HP ダメージを 10 固定にする
<RE-Trait: FixedDamage("HP", 10)>
```
