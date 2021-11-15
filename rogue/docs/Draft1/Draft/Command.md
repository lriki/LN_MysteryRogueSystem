Command
==========


Action と Reaction
----------

すべての行動は **Query - Action - Reaction - Result** の組み (QARR-Sequence) によって実行される。例えば次のようになる。

例えば次のようになる。

- "(相手へ)攻撃できるか" - "(自分は)攻撃する" - "(相手は)攻撃される" - "攻撃は当たったか？"
- "(相手は)拾えるか" - "(自分は)拾う" - "(相手は)拾われる" - "拾われたか？"
- "(相手は)投げられるか" - "(自分は)投げる" - "(相手は)投げられる" - "投げられたか？"

3 つの要素はそれぞれ Command として、同期または非同期通信の仕組みに乗って各 Entity 間をやりとりする。

最も基本的な行動の流れは次の通り。

1. Dialog や AI から、目標の Entity に対して QueryCommand を送信する。
2. QueryCommand を受信した (Entity にアタッチされている) Behavior は、Query を処理可能かを返す。
3. Dialog や AI から、操作対象の Entity に対して、ActionCommand を送信する。
4. ActionCommand を受信した Behavior は、必要に応じてリソースや行動を消費し、目標の Entity に対して ReactionCommand を送信する。
5. ReactionCommand を受信した Behavior は、各効果を発動したりダメージを適用したりする。ここから新たに QAR-Sequence が始まることもある。
6. 送信元 Entity に対して、ResultCommand を返す。
7. ResultCommand を受信した Behavior は、後処理を行う。

Player が Enemy に攻撃するシーケンス例：

```plantuml
Dialog -> Enemey: 1 (Query)
Dialog <- Enemey: 2
Dialog -> Plyer: 3
Plyer -> Plyer: 4 (Action)
Enemey <- Plyer: 4
Enemey -> Enemey: 5 (Reaction)
Enemey -> Plyer: 6
Plyer -> Plyer: 7 (Result)
```

> 実際に直接 Enemy にコマンドを飛ばすことは無く、「目の前の Block」へコマンドを飛ばすことになる。

### Query

Query では、実際に効果のある Reaction が行えるかではなく、何らかの Reaction を返す可能性があるかを返す。

`ゲーム状態を一切状態を変更してはならない。`

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

Query が返す情報はあくまで「参考情報」である点に注意。ガードが必要な場合は必ず Action または Reaction で対策すること。

例えば、壁Behavior が "攻撃" Query に対して "処理しない" を返しても、Player は "空振り" という形で攻撃することができる。
そのためこの場合だと、壁Behaviorは貫通属性の無い攻撃に対しては "何もせず処理" しないと、壁の中にいるモンスターに攻撃が通ってしまうことになる。

### Action


### Reaction


### Result

実行結果を、行動者にフィードバックする仕組み。Query 以外の Command はすべて非同期通信であるため、Reaction 送信元は、その結果を直ちに知ることはできない。

`他人の状態(Attribute)を変更してはならない。`

> e.g.) シレン2-つるはし
> e.g.) シレン2-使い捨ての剣・盾
> e.g.) シレン2-スパークソード
> 壁を掘ったり、攻撃が "当たった" 結果として、一定確率で壊れてしまうような仕組みの実装に Result が必要となる。


> [2020/9/27-2] やっぱり EffectContext と関係持たせなくていいかも。
> 複数の Behavior に結果を返す必要がある、というのはその通りなんだけど、それに EffectContext を利用できるかというとかなり微妙。
>
> そもそも結果の送信先となる Entity は、すべて sender に関連づいているはず。(装備品、状態異常など)
> であれば、postCommand の時点で sender はすべての Behavior の onCollectRelationship() みたいなのを呼び出して、その中で今発行する Command に関係するすべての Entity を集める。
> そしてそれを CommandContext がスタックし、onAction, onReaction に対応する結果として各 Behavior の onResult を呼び出す、のがいい気がしてきた。
>
> でももっとよく考えると、onCollectRelationship() もいらなそう。
> 現状そんなに条件付きで影響範囲を細分化する予定もないので、onAction 等と同じく、Entity にアタッチされているすべての Behavior に送る、でいいと思う。

~~Result は EffectContext が把握している関係 Entity すべてに送信する。~~

> [2020/9/27] 
> 以下の例で攻撃されたかどうかを、Command を発行した Behavior 自身へ返す仕組みを考えていたが、別の Behavior で結果を受けとって何かしたいこともある。
> 例えば攻撃が当たらなかったときに、次のような動きになる Behavior が考えられる。
> - 次回攻撃は必中状態にする
> - 一歩下がる AI

> [2020/9/27] 「拾う」アクションの例:
> 
> Reaction の後、sender 側で処理が必要なこともある。
> 例えば床に張り付いた聖域の巻物の処理では、
> - sender 側がアイテム固有の事情を処理するのはおかしいので、はがれないメッセージの処理は reciver側の聖域の巻物Behavior で行う。
> - 拾うことができない原因が reciver 側にあるので、sender 側ではメッセージを表示しない。データ的な取得も行わない。
> 
> また実際のデータ的なアイテム取得はどちら側で行うべきかについては、
> インベントリに直接入れるのか、壺に入れるのか、といった区別をする必要があるので、データ的な取得を行うのは sender 側でなければならない。
> 
> onResult の仕組みが必要となるが、例えば手封じの壺など「アイテムを拾えない」というような状態異常を考える場合、sender の onResult の前に
> 状態異常の onResult が割り込みをかけられなければならない。
> またトドの壺のように離れたところにあるアイテムを拾うようなケースも考えられる。
> いろいろなケースを考えると、拾う動作ひとつとっても EffectContext が必要になってくる。


### Command の実行タイミング

- Query: 同期
- Action: 非同期
- Reaction: 非同期
- Result: 非同期

Action, Reaction, Result は同期にすることはできない。代表的なものとしては、それぞれの実行タイミングで Dialog を表示する可能性があるため。
Web検索するとよく出てくるローグのサンプルのほとんどは CUI であるため同期でも大きな問題にはならないのだが、GUI を持つとなるとアニメーション完了まで実行を待つようなケースも考慮しなければならない。

> e.g.) シレン2-物知りの杖
> これは魔法弾が当たった瞬間に Dialog を表示し、プレイヤーが何かボタンを押したらウィンドウを閉じてシーケンス実行を続ける。
> 実行タイミングとしては Reaction の時。

> e.g.) シレン2-おしうり
> エネミーフェーズでこちらに対してお店の処理をかけてくる。また、買ったかどうかでその後の動きがかわる。
> すべて非同期で処理し、Result も返してあげる必要がある。

onPreAction, onPreReaction
----------

onAction(reciver側), onReaction(target側) を実行する前の実行可否を判断するための仕組み。

postCommand() で送信される Command の実行前に呼び出される。

なお、postCommand() は actor と reactor をうけとり、これらの処理をまとめて行う。
実際の実行順は、

1. onPreAction
2. onPreReaction
3. onAction
4. onReaction

> [2020/9/27] 必要になった経緯:
> アイテムを「置く」とき、アイテム側(target側) の種類によってどのように置かれるか変わることがあるため。
> シレン2の没データ "土偶アイテム" は、「置く」と足元ではなく目の前に土偶が出現する。これは普通のアイテムとは動作が異なる。




[deprecated: see EffectContext] コマンドチェーン
----------

Scheduler からの行動実行通知を起点として、実行される一連のコマンド列。Result を呼び出し元へ伝えていく。

例えば矢を打ち、敵を倒し、経験値を得るようなケース。
敵を倒したら経験値を得るのはプレイヤーや仲間。モンスターはレベルアップする等差がある。

Note:

レベルアップの処理をするのは、経験値によるレベルアップを実装する Behavior. (ExperienceLeveldBehavior とか)
これは攻撃したり矢を打つ Behavior とは全く別物なので、コマンドチェーンとか Result とかは全く関係ない。
何か対策する必要があるが…


Note:魔法反射された場合、術者は維持するが経験値の取得者は変わる。



Behavior の実装
----------

Behavior クラスを派生させて、以下のメソッドを実装する必要がある。

- Behavior.onQuery
- Behavior.onAction
- Behavior.onReceiverReaction
- Behavior.onResult (もしかしたら onAction で Prmise 使うかも)

Behavior のインスタンスは Entity にアタッチして利用し、onQuery, onAction, onResult はアタッチされた Entity のコマンド受信に反応して呼び出される。

onReceiverReaction だけは、onAction から送信した相手 Entity を処理するために呼び出される点に注意。

> NOTE: 以前までは onReceiverReaction は存在せず、代わりに アクション側Behavior と、非アクション側Behavior の2種類を用意していた。
> しかしこうすると関連する処理が離れたクラスに実装されてるため、ただでさえ複雑になりがちなコードの見通しが悪くなる。
> 
> さらに、非アクション側Behavior を実質すべての Entity に割り当てる必要があったりと、設定漏れの危険が非常に大きくなる。
> これは新たなモンスターの特殊能力を追加するような場合、致命的になる。
>
> 基本的に Behavior はアタッチされている Entity 以外のことを知らなくても動くように実装しなければならないのだが、
> このケースだとルールを守る以上にゲームの実装難易度が跳ね上がるので却下。


Action Command と Reaction Command
----------

この2つは Command の種類 (型) としては同一だが、isReaction フィールドの値によって、Command がどちらを表現するかが変わる。



