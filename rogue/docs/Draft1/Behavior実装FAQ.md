Behavior実装FAQ
==========

Action と Reaction の関係や、それぞれがどのような視点で動作を実装するべきか迷うことが多いので、そのメモ。

これが絶対というわけではないけど、実装方針は次ような感じ。

- Action も Reaction も、this 以外が持つ Attribute を変更してはならない。

コマンドを新たに post するのは、どちらで行ってもよい。
Attribute やその他のオブジェクトのフィールドを直接変更するような処理は、これに従う。


例: アイテムを拾う
----------

- Actor: PlayerEntity
- Reactor: ItemEntity

onPreXXXX でコマンド可否判定は済んでいるため、onAction の時点ではアイテムは必ず拾える状態にあると考えてよい。

onAction:
- Reactor を Map から取り除く。
- Reactor を Inventory に追加する。

重要なのは、Actor の onAction では Reactor (相手側) が何者なのか、どんな Attribute を持っているのか気にしないようにすること。

もし onAction 側で「Rector の種別が Item だったら拾う」ような判断をしてしまうと、
後々拡張されるすべての Entity 種別をここで確認しなければならなくなり、拡張性が著しく低下する。

「拾えるかどうか」は Reactor 側の onPreReaction でチェックする。
仮にすべての onPreReaction が「取得可能」を返すのであれば、モンスターでも階段でも拾うことができる。


例: 攻撃
----------

- Actor: PlayerEntity
- Reactor: EnemyEntity

Dialog からは AttackAction を post する。

PlayerEntity.onAction(AttackAction):
- 装備や状態変化など、関係 Entity を集めて EffectContext を作る。
- 攻撃 Sequel
- 攻撃範囲内の Tile へ ApplyEffectCommand を post する。EffectContext を引数として与える。

EnemyEntity.onAction(ApplyEffectAction):
- 受け取った EffectContext へ自身のパラメータを与えて最終評価結果を得る。それをもとにパラメータを変化させたり、Sequel を開始する。
- EffectContext を通じて攻撃者にフィードバックする。


例: 階段降りとフロア移動
----------

- Actor: PlayerEntity
- Reactor: ExitPointEntity

実際に World.transfarMap() を呼び出すのは Actor(Player) 側ではない点に注意。
Player を別のフロアに移動させるのは、階段、ワナ、アイテム効果など、Player 以外の Entity の役目となる。
それぞれ「降りられた」「踏まれた」「読まれた」など onReaction またはそこから発行される効果発動 Action にてマップ遷移を行う。










