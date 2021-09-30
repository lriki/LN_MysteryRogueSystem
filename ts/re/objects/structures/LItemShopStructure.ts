import { SCommandContext } from "ts/re/system/SCommandContext";
import { REGame } from "../REGame";
import { LRoomId } from "../LBlock";
import { LEntity } from "../LEntity";
import { LStructure } from "./LStructure";
import { DItemShopTypeId } from "ts/re/data/DItemShop";

export class LItemShopStructure extends LStructure {
    private _roomId: LRoomId = 0;
    private _itemShopTypeId: DItemShopTypeId = 0;
    //private _monsterHouseState: MonsterHouseState = MonsterHouseState.Sleeping;

    public setup(roomId: LRoomId, itemShopTypeId: DItemShopTypeId): void {
        this._roomId = roomId;
        this._itemShopTypeId = itemShopTypeId;
    }

    public roomId(): LRoomId {
        return this._roomId;
    }

    public itemShopTypeId(): DItemShopTypeId {
        return this._itemShopTypeId;
    }

    onEntityLocated(context: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.x, entity.y);
        if (block._roomId == this._roomId) {
        }
    }
}

/*
[2021/9/30] 請求状態の条件
----------
爆発で商品が消滅しても、請求されない。
つまり、単に床から離れただけでは請求状態とはならないということ。

また様々な条件に対して ShopStructure や ShopkeeprBehavior 側で対策するのは拡張性に乏しくなる。

地雷と同じワナによる事故であっても、落とし穴にアイテムが落ちて消えた場合は請求される？（未確認）
地雷は請求されないが、バクハの巻物は請求される。（これはバクハの巻物の awarder がプレイヤーであることから判断できそう）

機械的に実装できる可能性があるとすれば、「勢力が Player である awarder の行動が影響で、商品が店の床から除かれたとき」だろう。
ただ Effect と必ず伴うわけではないため、EffectContext の扱いはもう少し頑張る必要があるかも。
この方法で本当に行けるかはわからないので、ひとつずつ検証するしかないだろう…。


### 「大洪水の罠」を拡張機能として実装するなら？

店主は「大洪水だ！階段へ急げ！」と具体的なメッセージを出してくる。
この状態は大部屋になった時と同じと考えられる。
店主が EffectContext を通して状態を変えられるようなものではないため、
この状態は ShopStructure 側で管理するべきだろう。


### 単に「拾われた」「床から離れた」を見るだけでは足りない

矢や杖など、拾われずとも使用されることで「価値」が減るものがある。
正直、価値が失われた原因を ShopStructure まで伝えるのは個々のアクション全部で頑張る必要がありそうで辛そう。
- スタックが減る
- 杖の使用回数が減る
- 装備の修正値が減る
- 壺の容量が減る
- 進行中のタイトルだと、装備の耐久力の低下も考えられる。
EffectContext を通すとも限らないので、処理を行う箇所を一元化することもできない…。

### 床にあるアイテムの「価値」の総和の変化で判断する？

この場合各所から通知を受け取る必要は無くなるが、代わりに原因が分からない。
地雷かバクハの巻物かを区別できない。

地雷(の爆破Effect)に対して、例えば店の元の価値を減らすような処理を入れるのもできるが、
それは他のアイテム消滅に関係する箇所に全部処理を入れるということになる。
そもそもやっぱり地雷側が店の都合を知っていなければならないのはおかしいだろう。






[2021/9/28] 泥棒の条件
----------
泥棒の条件は、
- 店主が店の入り口をふさぐ状態で、購入者が部屋の外に出ること。
アイテムを店の外に投げたりしただけでは、泥棒にならない。

また
- 値札のついたアイテムを持っている状態で店の外に立っているだけでは泥棒にならない。
例えば
- 店の外からアイテムを回収してもすぐに泥棒にはならない。（不思議の幻想郷の動作だが、「店主は慌てている」とメッセージが表示されるだけ）
- 店主に高跳び草を投げてから値札のついたアイテムを持ち出しても、店主が店に戻るまで泥棒にならない。（シレン2）
    - ただし店主を地雷に巻き込む等で倒す → アイテムを持ち出す では泥棒になる。店主の存在が影響するとは限らない。
      店主がいる・いないで何かしら特殊な処理が組まれていそう。

いずれにしても、値札アイテムが床上から除かれたかどうかは「店オブジェクト」で管理する必要がある。(店主Entityではなく)




[2021/9/28] 買い物の処理
----------

- 「話しかけ」で会話を始める。
- RMMZイベントで選択肢を提供する。(Prefabで定義する)

### どうやって選択肢の結果を伝える？
Activity にしたいところ。Recorder に保存したいので。

実現方法は次の「ちなみに行商人は？」を参照。
アイテム選択ダイアログが出ないが、代わりに◆プラグインコマンド「要求されている金額を変数に代入」みたいなコマンドを使うことになるだろう。



### ちなみに行商人は？

- アイテムを選択する
- 金額に合意する
という２つのダイアログを使うことになるが…
できれば HTTP のようにステートレスにしたいところ。
NPC同士の売買やRecorderへの保存がやりやすくなるかも。

「行商人との会話Dialog」を専用で作る必要がありそう。状態は Dialog 側で持ちたいので。
まぁ普通のイベントDialogに任意プロパティを持たせるようにしてもよいが…。

典型的には次のようなイベントとなる。

```
◆文章「いらっしゃい。」
◆プラグインコマンド「アイテム選択」     # 子VisualDialogを表示する。この結果は現在Dialogの slectedItems に保存される。
◆プラグインコマンド「選択アイテムの値段を変数に代入」
◆文章「\V[1]G になります。」
◆選択肢 はい
    ◆プラグインコマンド「アクティビティPost(Yes)」  # または、Dialogで一段ラップするのもありか。
    ◆文章「ありがとうございます。」
◆選択肢 いいえ
    ◆文章「またどうぞ。」
```

*/