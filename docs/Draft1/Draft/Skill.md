スキル
==========

Behavior ではなく「スキル」という特殊能力の管理単位が欲しい。

- GB2 の吸収の壺は「XXXXの能力」を Entity として持ち歩ける
- GB2 のあくまだんしゃく系は↑の仕組みを利用して他Enemyのスキルを発動できる。
- 4,5 には「技」という概念があり、特殊能力の実行は Entity に直接 Attach される Behavior だけの役割ではない。

検討済みの中だと、火炎草あたりの処理が近いかも。
「飲まれる」という Reaction から、別 Entity の動作を起こす。


### スキルを持つ人

UnitAttribute でいいかな。

### Skill は Entity?

実行内容を記述する Skill 自体は Entity としない方がよさそう。

Behavior と似ているが、
- 絶対に状態を持ってはならない (後述の SkillEntity のため)
- Behavior と比較したとき使うのは onAction のみで、他のハンドラは不要

### SkillEntity

「使う」などの Action をうけて、指定 Entity に対してスキル発動を行う Entity.
吸収の壺に入る「のうりょく」はこれになる。

発動すると、
- actor の見た目をモンスターに返る Sequel
- 動作実行
- 見た目を戻す Sequel
という順にコマンドを実行する。


