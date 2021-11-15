マップ間移動
==========

### ツクールのイベントによるマップ移動


階段等による Rogue システム内でのマップ移動
----------

基点は [階段Dialog] > [進むCommand] > [階段Behavior.onReaction]

[階段Behavior.onReaction] では、actor を次のマップへ `REGame.world.transfarEntity()` する。
※実際は `context->postTransfarEntity()`

actor 側の onAction で transfar するのではない点に注意。
これによって、Player だけではなくあらゆる Entity が階段を通じてフロア移動できるようになる。

Camera は PlayerEntity に追従しておく用にすることで、PlayerEntity が移動したら Camera も自動的に移動するようにしておく。

遷移エフェクト・フロア名表示
----------

`context->postTransfarEntity()` は、内部的には
- フェードアウト Sequel 実行
- `REGame.world.transfarEntity()` 呼び出し
- フロア名表示・フェードイン Sequel 実行
という3段階の Message が積まれる。

スケジューラ・コマンドチェーン実行中の遷移
----------

基本的にコマンドチェーン実行中に遷移が行われる。

前述の通り遷移エフェクトもコマンドチェーンからの発行を頼りにするため、コマンドチェーンの中断はNG。

一方スケジューリングは `マップ遷移が行われるときに` 中断する。
- 仲間をEnemyの後攻としている場合、Playerはフロア移動 > 敵が仲間を攻撃 > 仲間が倒れると着いてこない といったことが起こる。
- Player (FocusdEntity) 以外がフロア間を移動したときはターンを中断してほしくない。

実際の遷移のタイミング
----------

Land をまたぐときは RMMZ マップデータのロードが必須であるため、
performTransfer() などの実行が必須となる。

同一 Land 内でも、固定マップへ遷移するときもこのロードが必要となる。

- REIntegration で指定マップへの遷移 (というよりデータロード) を要求する
- RMMZ 側は performTransfer() のタイミングで REManager.performTransfer()


