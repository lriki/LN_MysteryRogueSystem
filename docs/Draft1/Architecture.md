Architecture
==========

```plantuml
[REGameManager]
[REScheduler]

```

REGame_* クラス群
----------

コアスクリプトの Game_* クラス群と同じく、動的な状態とその CRUD に関係するメソッドを持つ。

ただしコアスクリプトとは異なり、このクラス自体がセーブデータにシリアライズされることは無い。

シリアライズデータは REGame_*Data が持つ。


