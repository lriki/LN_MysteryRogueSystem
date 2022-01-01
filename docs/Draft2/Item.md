Item
==========

[2021/4/25] アイテム効果や使い方の指定方法
----------

以前 `Draft1/Item` で考えたけど、時間たって見直したらやっぱり複雑かも。
薬草作るときにまた Behavior の分類少し考えたので、それで整理してみる。

### 薬草 (一般的な草)

```
<MR-Key: kItem_薬草>
<MR-Kind: Grass>
<MR-Behavior: Eatable(command="食べる", subject_effect=self)>
<MR-Behavior: Throwable()>
<MR-Behavior: Hittable(subject_effect=self)>
```

### ドラゴン草を作る場合

### いかすしの巻物 (コマンドが複数あるもの)

```
<MR-Key: kItem_kいかすしの巻物>
<MR-Kind: Grass>
<MR-Behavior: Readable(command="読む", subject_effect=self)>
<MR-Behavior: Eatable(command="食べる", subject_effect=kSkill_FP30回復)>  # Skill が持つ Effect を使う
<MR-Behavior: Throwable()>
<MR-Behavior: Hittable(subject_effect=self)>
```

### 矢

動きとしては、撃ったときに残弾1でなければ Entity を複製して throw.

```rb
<MR-Key: kItem_銀の矢>
<MR-Kind: Arrow>
<MR-Behavior: Wavable()>
<MR-Behavior: Shootable(command="撃つ")>
<MR-Behavior: Hittable(target_effect=self)>
<MR-Behavior: 投擲貫通()> or <RE-Ability:kAbility_投擲貫通>
```

### ふきとばしの杖 (一般的な杖)

```
<MR-Key: kItem_ふきとばしの杖>
<MR-Kind: Grass>
<MR-Behavior: Wavable(command="振る", subject_effect=self, this_effect=kShotMagicBullet)>
<MR-Behavior: Throwable()>
<MR-Behavior: Hittable(subject_effect=self)>
<RE-Ability:kAbility_Knockback10>
```

```
<MR-Key: kAbility_Knockback10>
<MR-Kind: Ability>
<MR-Behavior: Knockback(10)>     # 追加効果として、ふきとばしを適用する
```

以下の杖にも共通するが、杖の能力の合成 (新種道具) のようなものを考えなければ、Ability は不要。
`kItem_ふきとばしの杖` に直接 `<MR-Behavior: Knockback(10)>` を書いてかまわない。


### トンネルの杖 (魔法弾と投げ当てた時の効果が異なる)



### 火柱の杖 (魔法弾が出ない。振った・投げ当てたところから火柱発生)

```
<MR-Key: kItem_薬草>
<MR-Kind: Grass>
<MR-Behavior: Wavable(command="振る")>
<MR-Behavior: Throwable()>
<MR-Behavior: Hittable()>
<RE-Ability:kAbility_正面火柱>
```

```
<MR-Key: kAbility_正面火柱>
<MR-Kind: Ability>
<MR-Behavior: 正面火柱()>    # どの Activity に反応するかはこの中が判断する
```

振った時は目の前から、投げ当てた時は当たった Block から火柱が立ち始める。
その判断は火柱Behaviorの中で行う。

### 土塊の杖 (魔法弾が出ない)

### 草受けの杖を作る場合 (アイテムで定義できない特殊な魔法弾を出す)

```
<MR-Key: kItem_薬草>
<MR-Kind: Grass>
<MR-Behavior: Wavable(command="振る")>
<MR-Behavior: Throwable()>
<MR-Behavior: Hittable()>
<MR-Behavior: 草受け()>
```

### 最高の岩を作る場合

```
<MR-Key: kFlawlessIronSand>
<RE-EntityKind:Material>
<MR-Behavior: Throwable(command="投げる", this_effect=k最高の岩)>
<MR-Behavior: Hittable(subject_effect=self)>
```

`投げる` の効果をオーバーライドする。

### 最高の砂鉄を作る場合

```
<MR-Key: kFlawlessIronSand>
<RE-EntityKind:Material>
<MR-Behavior: Usable(command="ばらまく", this_effect=kFlawlessIronSand)>
<MR-Behavior: Throwable()>
<MR-Behavior: Hittable(subject_effect=self)>   # あらかじめアイテムの効果として、目つぶしステートを付加しておく
```




