Command
==========


Action と Reaction
----------

すべての行動は Query - Action - Reaction の組み (QAR-Sequence) によって実行される。例えば次のようになる。

- "(相手へ)攻撃できるか" - "(自分は)攻撃する" - "(相手は)攻撃される"
- "(相手は)拾えるか" - "(自分は)拾う" - "(相手は)拾われる"
- "(相手は)投げられるか" - "(自分は)投げる" - "(相手は)投げられる"

3 つの要素はそれぞれ Command として、同期または非同期通信の仕組みに乗って各 Entity 間をやりとりする。

最も基本的な行動の流れは次の通り。

1. Dialog や AI から、目標の Entity に対して QueryCommand を送信する。
2. QueryCommand を受信した (Entity にアタッチされている) Behavior は、Query を処理可能かを返す。
3. Dialog や AI から、操作対象の Entity に対して、ActionCommand を送信する。
4. ActionCommand を受信した Behavior は、必要に応じてリソースや行動を消費し、目標の Entity に対して ReactionCommand を送信する。
5. ReactionCommand を受信した Behavior は、各効果を発動したりダメージを適用したりする。ここから新たに QAR-Sequence が始まることもある。

Player が Enemy に攻撃するシーケンス例：

```plantuml
Dialog -> Enemey: 1
Dialog <- Enemey: 2
Dialog -> Plyer: 3
Enemey <- Plyer: 4
Enemey -> Enemey: 5
```

> 実際に直接 Enemy にコマンドを飛ばすことは無く、「目の前の Block」へコマンドを飛ばすことになる。

### Command の実行タイミング

- Query: 同期
- Action: 非同期
- Reaction: 非同期


### 留意点

Query では、実際に効果のある Reaction が行えるかではなく、何らかの Reaction を返す可能性があるかを返す。

> e.g.) シレン2-聖域の巻物
> Dialog から「拾う」を選択することはでき、「拾う」Action を起こすことで行動をひとつ消費する。
> しかし床に張り付いている場合は、聖域の巻物Behavior の Reaction でメッセージの表示が行われ、Inventory への追加は行われない。

Aボタンは状況に応じて、多岐にわたる Action を実行できる。例えば、"攻撃する", "話す", "壁を掘る", "罠を壊す" など。
これら適切な Action を起こすためには、目の前の Block に対して、キャラクターがとりえる行動を Query によって確認する必要がある。

> e.g.) シレン2-壁の中のパコレプキン
> - つるはしを装備しているときは、壁掘りが行われる。
> - パコレプキンの腕輪や、銀の矢が合成されたつるはしを装備しているときは、モンスターへの攻撃が行われる。壁は掘られない。
> これは、攻撃側が自分のとりえる行動を順に目の前の Block に対して Query として送った時、Block の中にいる "壁" Behavior が、"壁掘り" を受領できるかどうかを返してあげることで判断する。
>
> なおこのケースでは、モンスター側が自分が今いる地形を確認して攻撃を受けないように Reaction するのはNG.
> 地形によって攻撃が通らなくなる似たような仕組みとして、シレン5等の "扉" がある。地形側でガードするべき。

Query が返す情報はあくまで「参考情報」である点に注意。

例えば、壁Behavior が "攻撃" Query に対して "処理しない" を返しても、Player は "空振り" という形で攻撃することができる。
そのためこの場合だと、壁Behaviorは貫通属性の無い攻撃に対しては "何もせず処理" しないと、壁の中にいるモンスターに攻撃が通ってしまうことになる。




------------------

行動はできるだけ細かい単位にすること。壁掘りを例にすると、"攻撃" と "壁掘り" は分けて考える。






例：
- Action は "拾う"、"投げる"。
- Reaction は "拾われる"、"投げられる（飛ばされる）"。

REGame_Behavior.onAction (旧HC3 onExecuteCommand)
REGame_Behavior.onReaction (旧HC3 onExecuteReaction)

### 実装ルール

- onAction は、`他人の状態(Attribute)を変更してはならない。`
- onReaction は、`他人の状態(Attribute)を変更してもかまわない。`


### 実装例. 薬草を投げつけられてダメージを受けるゴーストタイプ

- ...
- 
- 薬草Behavior は対象のタイプを知っていてはならない。


