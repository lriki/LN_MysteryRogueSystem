Item
==========

[2021/2/13] アイテム効果や使い方の指定方法
----------

- 「食べる」と「飲む」など表記と演出だけ違うものもある
- 食べられる剣もある
- 「入れる」杖がある (草投げ・草受け)

「メモ欄を使って Behavior を追加する」という考えを基本にするのがいいかもしれない。



### ふきとばしの杖を作る場合 **見送り。シレン5の新種装備を実装できるようにするなら、魔法弾側が特殊効果を持つべきではない**

まずデータベースでアイテムを作る。メモは次のようにする。

```
<RE-Key:kKnockbackStaff>          # オプション。これがあると、ID 以外で検索できるようになる
<RE-EntityKind:Staff>            # 必須。ソートに使う
<RE-BasicStaff:kKnockbackMagicBallet>  # "振る" ことができる & その際 "Key:MagicBallet-Knockback" である魔法弾 Entity を飛ばす
```

魔法弾のアイテムを作る。

```
<RE-Key:kKnockbackMagicBallet>
<RE-EntityKind:MagicBallet>
<RE-Effect:Knockback(10)>       # 引数は吹き飛ばす距離。ダメージは "ダメージ" 欄で設定する
```

### ふきとばしの杖を作る場合2

```
<RE-Key:kKnockbackStaff>
<RE-EntityKind:Staff>
<RE-Ability:AKnockback(10)>        # 
<RE-Effect:Wave=EShotMagicBallet>  # "振った"
<RE-Effect:Hit=EAKnockback(10)
```

・・・これもしかして、先に Ability という別のデータ構造のリストを作っておいて、ここではそれをアタッチする方がよさそう？

### 土塊の杖を作る場合 (魔法弾が出ない)

```
<RE-Key:kFortStaff>
<RE-EntityKind:Staff>
<RE-Behavior:FortStaff>  # "LFortStaffBehavior" をアタッチする
```

### 草受けの杖を作る場合 (アイテムで定義できない特殊な魔法弾を出す)

```
<RE-Key:kGrassReceiver>
<RE-Behavior:FortStaff>  # "LGrassReceiverStaffBehavior" をアタッチする
```

### 薬草を作る場合 (基本的な草)

```
<RE-Key:kHerb>
<RE-EntityKind:Grass>
<RE-Behavior:CommonGrass>  # "飲む" ことができる & "当てた時" に相手に効果を発動する
```

Effect は省略可能。BasicGrass の実装として、"飲んだ時" "当てた時" に通常のアイテム効果を適用する。

なお CommonGrass は以下をまとめるユーティリティ。

```
<RE-Key:kHerb>
<RE-EntityKind:Grass>
<RE-Behavior:Command(Take)>    # "使う" ことができる。その際の Sequel 及びアクション名は "飲む"
<RE-UseEffect:self>    # "使った" ときに通常のアイテム効果を適用する。
<RE-HitEffect:self>    # 投げ当てた時に通常のアイテム効果を適用する。 (これが無い場合、1ダメージを与える)
```

### ドラゴン草を作る場合

CommonGrass を自分で実装するイメージ。

```
<RE-Key:kDragonGrass>
<RE-EntityKind:Grass>            # 必須
<RE-Behavior:Command(Take)>    # "使う" ことができる。その際の Sequel 及びアクション名は "飲む"
<RE-UseEffect:kDragonBreathSkill>    # "使った" ときにスキルを発動する
<RE-HitEffect:self>
```


### いかすしの巻物を作る場合 (Use に相当するコマンドが複数ある)

```
<RE-Key:kIkasushiScroll>
<RE-EntityKind:Grass>            # 必須
<RE-Command:Read>    # "読む"   ショートカットなどで単に"使う"ときは先頭のコマンドを使う、とか
<RE-Command:Eat>     # "食べる"
<RE-Effect:Read=eIkasushiScroll>    # "読む" とき
<RE-Effect:Eat=eIkasushiScroll>    # "食べる" とき
<RE-Effect:Hit=default>             # デフォルトの動作 (1ダメージを与える。省略可能)
```


### 最高の砂鉄を作る場合 (Use に相当するコマンドの名前だけ変えたい)

```
<RE-Key:kFlawlessIronSand>
<RE-EntityKind:Grass>
<RE-Command:Use="ばらまく">
<RE-Effect:Use=EFlawlessIronSand>
<RE-Effect:Hit=ERMMZItem>   # アイテムの効果として、目つぶしステートを付加しておく
```


### 最高の岩を作る場合 ("なげる" をオーバーライド)

```
<RE-Key:kFlawlessRock>
<RE-EntityKind:Grass>
<RE-Command:Throw>      # 明示的な指定は不要
<RE-Effect:Throw=FlawlessRock>
```


### 妖刀かまいたちを作る場合

```
<RE-Key:k>
<RE-EntityKind:Sowrd>
<RE-Ability:妖刀かまいたち>      # 3方向攻撃となるため処理の実装が必要
<RE-SynthesisAbility:三>      # 合成したときに付加する印
```

### 皮の盾を作る場合 (複数の効果を持つが、合成印はひとつ)

```
<RE-Key:k>
<RE-EntityKind:Shield>
<RE-Ability:さびよけ>
<RE-Ability:ハラモチ>
<RE-SynthesisAbility:ハラモチState>
```

印はStateとして実装する。(アイテムだと他と混ぜると数が多くなりすぎるし、スキルっていうのもちょっとイメージが違う)

### Behavior と Ability は何が違う？

- Behavior は主にEntity種別 (Actor,Monster,Item,Trap等) をもとスクリプト内部からアタッチされるもの
- Ability は主に Editor 上からユーザーによって編集されるもの

・・・という分け方はどうだろう？

いまのところ明確に違うのは、"Ability はひとつの特殊効果を表すもので、説明テキストを持つ" ことかな。
印の実装の他、シレン5の新種道具でも使う。



