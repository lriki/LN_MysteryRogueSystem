状態異常
==========


[2020/11/6] Note
----------

State というクラスを1つ追加してみる。

- State は Attribute や Behavior と同じように、Entity にアタッチして使う。
- アタッチされた State は、その Entity に対して、状態異常の表現に必要な Attrubute と Behavior を生成してアタッチする。

### State 自体に Attribute 相当のフィールドや、Behavior 相当のハンドラを実装するのは？

Behavior を使いまわすことはある。

ある State は睡眠Behaviorだけだが、別の State は睡眠&スリップダメージ という実装になることも考えられる。（「睡眠」と「悪夢」とか）
このとき 睡眠Behavior は使いまわしたい。

### State と Attribute の違いは？

State は復活時などの全快によって全てデタッチされると考えなければならない。（マイナス状態だけ解除、みたいにちょっと制御する必要はあるが）

Attribute(BasicAttribute) は Entity 生成時に、種別や基礎ゲームシステムによってアタッチされるものであって、基本的に生成後にデタッチされることはない。

### Behavior = State ではないの？

- Behavior.onAttach() で Entity に Attribute を追加すればどう？

State は Entity に何かしら効果を与えているものとして、UI 上にリストアップすることができる。
良くあるものだと、状態異常のアイコンリスト。
Skyrim みたいにあまりにも大量に State が付くことがあれば、それ専用のリストウィンドウを用意することもある。

またそれに伴い、Database で定義された名称やアイコン、説明文と紐づける必要も出てくる。

### State は誰が持つ？

Item の「呪い」「祝福」は State と考えてもよさそう。

でも Tile や階段は普通は State は持たない。

呪い状態によってアイテムの効果が変わるようなケースでは、アイテムのBehaviorが「自分自身が呪いState を持っているか？」を確認できないとならない。

そういう意味で「呪い」は Required な State であるし、それを検索できる仕組みが無いとだめ。

### State を Entity とする？

極端なアイデアで、実現は難しくなさそうだけど、前述の呪い状態とかめんどうそう。

ただ State 自体は独立したインスタンスなので、Entity とするかは別として Entity と似たように動く。
sheduler から解除タイミングの通知を受け取って処理をしたりする。

Attribute/Behaviorをアタッチする仕組みは同じように必要かも。
「xターン経過で解除」みたいなのは多くの State で使う。

State によってバフがつくときは印と同じく EffectContext に乗せることになる。
State が行動決定に影響することもあるので、Entity に直接 Attach されている Behavior.onDecisionPhase() から同様のメソッドを呼び出す必要もある。

やっぱりふるまいは Entity にかなり近そう。


StateData は TraitData の集合。
State は Behavior の集合。

Note: コマンド通知時は owner, actor, reactor を分ける必要がありそう。
owner: アタッチされている Entity 自身
actor: コマンドが post された Entity。this が State の場合、その State がアタッチされている Unit 等の Entity.





