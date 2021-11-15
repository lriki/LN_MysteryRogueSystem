状態異常
==========


[2020/11/20] 戦闘不能～番付表示～ゲームオーバー・戦闘不能～復活草 考察
----------

復活草を複数所持していることを考慮すると、コマンドの投げ方を考えないとならない。

例えばステート付加時に持ち物に対して onStateChanged() みたいな呼び出しを行うとしても、
これまでの仕組みみたく非同期で行くなら postStateChanged()。
post 時点では複数の復活草にコマンドが送られる。

仮に 復活草の onStateChanged() で今度は自身に 効果発動Action を送るとすると、
送る時点では別の復活草が効果発動したかどうかはまだ決定していないので、
複数の復活草 Entity に同時に 効果発動Action が送られる。


[2020/11/18] Entity とするまでもないのでは？Behavior でいいのでは？
----------

例えば、
- SleepStateBehavior をアタッチする
- onAttach() とかで SleepStateAttribue をアタッチして、経過ターン数はここでカウントする
とか。

→ ダメ。というか、同じ状態異常が与えられたときに経過ターン数をリセットするのが割と一般的な実装だけど、それをやるのがかなり面倒になる。

…と思ったけど別に Attribute と Behavior を一つにまとめた SleepStateBehavior にしてもいいし、Behavior < StateBehavior < SleepStateBehavior という継承関係にして、
StateBehavior に経過ターンやステートID保持など共通処理を持たせてもかまわない。

Entity にするメリットは、
- Behavior を後から追加できる
…くらいか。
State 自体をターン経過で悪化させたり、別 State に変化させたりするのは Behavior でもできる。

例えば、毒とマヒの効果を同時に持ったステートを作りたいとき、普通の毒BehaviorとマヒBehaviorをアタッチすればいいような感じになる。
…でも経過ターンの管理は単一の Attr でやったほうがいいので、この時は１つの共有 Attr と複数の Behavior をひとつの Entity が持つことになる。

よく考えてみるとこれはツクールの State のデータ構造とほとんど同じ。
Trait=Behaviorになってるだけ。

ただこれだと Static な Behavior にしてしまえばよくなる。
Entity にする必要なし。現時点の SkillBehavior と似たような感じ。

でもそれで十分かもしれない。
State に対して Dynamic に Trait を追加したいようなことはまずない。
というか、それをやりたいなら別の State を ActorEntity に追加する。
逆に複雑になりすぎそう。



[2020/11/9] State を Entity とする？
----------

いったん Entity にしてみる。
ちょうど、病原体がそのへんを漂っていたり、他の Entity にくっついたりして効果を適用するイメージ。

基本的に State は Attribute+Behavior なので、Entity にする・しないで変わることと言えば
World.entities のリストに入るか同かくらい。

Entity 扱いしなかったとしても、例えば UnitAttributes.states に LState のインスタンスを直接持たせるのはシリアライズの点からあんまりよくない。
Enttiy と同じように、グローバルなリストにインスタンスは持っておいて、Id で参照することになる。


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





