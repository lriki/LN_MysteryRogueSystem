変数
==========

MR-ExitResultDetail
----------

ランドから出て `ExitMap` へ移動した時の原因が格納されます。値は次の通りです。

| 値  | 意味 |
|-----|------|
| 200 | ゴールに到達した。 |
| 200 | 脱出の巻物などによって冒険を中断した。 |
| 400 | ゲームオーバーによって Land から出された。 |
| 401 | 冒険をあきらめた。 |

次のように分類されます。

- 2xx 番: 攻略成功。
- 3xx 番: 冒険中断。ペナルティ無し。
- 4xx 番: 冒険失敗。ペナルティ有り。(持ち物を失う等)


MR-ExitResult
----------

`MR-ExitResultDetail` の値を 100 で割った値が格納されます。

MR-CommndResult1
----------

各種プラグインコマンドを実行した結果が格納されます。

値はプラグインコマンドによって様々です。
