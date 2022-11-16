投げ当てと副効果
==========

このチュートリアルでこれまで作成してきたアイテムは飲んだ時にHPを回復するだけでした。
ここでは草・薬アイテムとして一般的な次の効果を実装します。

- 飲んだ時に満腹度(FP)を少量回復する。
- 投げ当てた時に相手の HP を回復する。ただし、このとき FP は回復しない。

リアクション、エミッター、エフェクトの関連は次のようになります。

```mermaid
flowchart LR
    Reaction1["Reaction#1(飲んだ)"]
    Reaction2["Reaction#2(投げ当てた)"]
    Emittor1["Emittor#1(kEmittor_ポーションA_Main)"]
    Emittor2["Emittor#2(kEmittor_ポーションA_投げ当て)"]
    Effect1["Effect#1(kEffect_ポーションA_Main)"]
    Effect2["Effect#2(kEffect_FP回復5)"]

    Reaction1 --> Emittor1
    Reaction2 --> Emittor2
    Emittor1 --> Effect1
    Emittor1 --> Effect2
    Emittor2 --> Effect1
```

次の要素は既に作成しています。

- [飲んだ]リアクション
- kEmittor_ポーションA_Main
- kEffect_ポーションA_Main

ここでは次の要素を新たに作成し、それぞれの関連性を設定していきます。

- [投げ当てた]リアクション
- kEmittor_ポーションA_投げ当て
- kEffect_FP回復5

満腹度(FP)の回復
----------

満腹度(FP) はRPGツクールの標準パラメータではありません。MRシステム用の追加パラメータとして扱われます。追加パラメータはRPGツクールのデータベースから編集することはできません。設定ファイルでエフェクトを追加する必要があります。

`data/mr/Effects.js` に次のような設定を追加します。

```js
"kEffect_FP回復5": Effect({
    parameterValues: [
        ParameterValue({
            parameterKey: "fp",    // FPを、
            type: "recovery",      // 回復する。
            formula: "500",        // 値は5%。
            silent: true,          // メッセージを表示しない。
        }),
    ],
}),
```

!!! note パラメータFPについて
    パラメータの詳細は次のチュートリアルで説明します。
    FPはパーセンテージでウィンドウに表示されますが、内部的には 10000 を 100% とする整数値です。

!!! warning
    v0.8.0 では `kEffect_FP回復5` は Effects.js に既に追加されています。
    これを利用してもかまいません。そうでない場合、別の Key 名を使ってください。

続いて、 `data/mr/Emittors.js` に次の設定を追加します。

```js
"kEmittor_ポーションA_Main": Emittor({
    targetEffectKeys: [
        "kEffect_ポーションA_Main",
        "kEffect_FP回復5",
    ],
}),
```

この設定は `kEmittor_ポーションA_Main` が発動したときに、 `kEffect_ポーションA_Main(HP回復効果)` と `kEffect_FP回復5` の2つの効果を同時に適用することを示しています。

設定したらテストプレイで動作確認してみましょう。

使用前:
![](img/sub-effects-1.png)

使用後: 
![](img/sub-effects-2.png)


!!! tip デバッグコマンド
    動作確認のために毎回 HP や FP を減らすのは大変です。 [デバッグ機能](../1-first/8-debug-command.md) で説明したコンソールで次のコマンドを実行すると、それぞれプレイヤーの HP を 10、FP を 1000(10%) にできます。
    ```
    MR.setPlayerParameter("hp", 10)
    MR.setPlayerParameter("fp", 1000)
    ```

投げ当て
----------

まずは投げ当て用のエミッターを追加しましょう。 `data/mr/Emittors.js` に次の設定を追加します。

```js
"kEmittor_ポーションA_投げ当て": Emittor({
    targetEffectKeys: [
        "kEffect_ポーションA_Main",
    ],
}),
```

先ほどと異なり、こちらには FP 回復エフェクトが無い点に注意してください。

続いて、 `data/mr/Entities.js` の `kEntity_ポーションA` に次の設定を追加します。

```diff
 "kEntity_ポーションA": Entity({
     reactions: [
         Reaction({
             actionKey: "kAction_Eat",
             emittorKeys: ["kEmittor_ポーションA_Main"],
             commandName: "飲む",
         }),
+        Reaction({
+            actionKey: "kAction_Collide",
+            emittorKeys: ["kEmittor_ポーションA_投げ当て"],
+        }),
    ],
 }),
```

設定したらテストプレイで動作確認してみましょう。

モンスターに投げ当てることで、相手の HP が回復します。

![](img/sub-effects-3.png)

