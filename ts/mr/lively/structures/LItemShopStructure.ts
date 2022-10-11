import { SCommandContext } from "ts/mr/system/SCommandContext";
import { MRLively } from "../MRLively";
import { LEntity } from "../LEntity";
import { LStructure } from "./LStructure";
import { DItemShopTypeId } from "ts/mr/data/DItemShop";
import { LItemBehavior } from "../behaviors/LItemBehavior";
import { assert, MRSerializable } from "ts/mr/Common";
import { UMovement } from "ts/mr/utility/UMovement";
import { LEntityId } from "../LObject";
import { DFactionId, MRData } from "ts/mr/data/MRData";
import { LRoomId } from "../LCommon";

// 店の入り口情報
@MRSerializable
export class LShopEntrance {
    private _index;
    private _homeX = 0;
    private _homeY = 0;
    private _gateX = 0;
    private _gateY = 0;

    public constructor(index: number) {
        this._index = index;
    }

    public setup(homeX: number, homeY: number, gateX: number, gateY: number): void {
        assert(UMovement.blockDistance(homeX, homeY, gateX, gateY) == 1);
        this._homeX = homeX;
        this._homeY = homeY;
        this._gateX = gateX;
        this._gateY = gateY;
    }

    public index(): number {
        return this._index;
    }

    public homeX(): number {
        return this._homeX;
    }

    public homeY(): number {
        return this._homeY;
    }

    public gateX(): number {
        return this._gateX;
    }

    public gateY(): number {
        return this._gateY;
    }
}

@MRSerializable
export class LItemShopStructure extends LStructure {
    private _roomId: LRoomId = 0;
    private _itemShopTypeId: DItemShopTypeId = 0;
    private _sellngItems: LEntityId[] = [];
    //private _initialSumOfPrices: number = 0;
    private _gates: LShopEntrance[] = [];
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

    public clientFaction(): DFactionId {
        return MRData.system.factions.player;
    }

    public addShopEntrance(homeX: number, homeY: number, gateX: number, gateY: number): LShopEntrance {
        const entrance = new LShopEntrance(this._gates.length);
        entrance.setup(homeX, homeY, gateX, gateY);
        this._gates.push(entrance);
        return entrance;
    }

    public shopEntrance(shopkeeperIndex: number): LShopEntrance {
        return this._gates[shopkeeperIndex];
    }

    // 対価を得ずに所有(床置き)を失っている商品
    public getLossItems(): LEntity[] {
        const result: LEntity[] = [];
        const room = MRLively.map.room(this._roomId);
        for (const id of this._sellngItems) {
            const item = MRLively.world.entity(id);
            if (item.floorId.equals(MRLively.map.floorId()) && room.contains(item.mx, item.my)) {
                const block = MRLively.map.block(item.mx, item.my);
                assert(block.containsEntity(item)); // 一応、本当に Block に含まれているかチェックする
                // 所有
            }
            else {
                result.push(item);
            }
        }
        return result;
    }

    // どんなアイテムをいくつアイテムを生成するかは地形等の情報により変わるため、
    // このクラスの中ではなく MapBuilder 側で決める。その決まった情報をこの関数にセットする。
    public setInitialItems(items: LEntity[]): void {
        //this._initialSumOfPrices = 0;
        for (const item of items) {
            //this._initialSumOfPrices += item.data().buyingPrice;
            const b = item.getEntityBehavior(LItemBehavior);
            assert(b.shopStructureId() == 0);
            b.setShopStructureId(this.id());
            this._sellngItems.push(item.entityId());
        }
    }

    // 請求額
    public getBillingPrice(): number {
        const items = this.getLossItems();
        return items.reduce((r, i) => r + i.queryPrice().sellingPrice, 0);
    }

    // 買取中の未精算額
    public getDepositPriece(): number {
        return 0;
    }


    public commitBilling(): void {
        const items = this.getLossItems();
        for (const item of items) {
            this._sellngItems.mutableRemove(id => id.equals(item.entityId()));
            item.getEntityBehavior(LItemBehavior).setShopStructureId(0);
        }
    }

    
    // actor に対して請求状態であるかを判断する
    // ※現状では請求対象は Player 勢力のみであるため、商品が失われた原因までは考慮していない
    public checkBilling(/*actor: LEntity*/): boolean {
        return this.getLossItems().length > 0;
    }

    public updateSecuritySystemState(): void {

    }

    onEntityLocated(cctx: SCommandContext, entity: LEntity): void {
        const block = MRLively.map.block(entity.mx, entity.my);
        if (block._roomId == this._roomId) {
        }
    }
}

/*

[2021/10/2] 請求状態の条件 - パラメータ変化の検知
----------

杖の使用回数や壺の残容量は値段に影響する。

気になるのが壺。
杖の使用回数は Param の仕組みとして現在値を減算するだけでよいが、
壺は中に入っているアイテムの数で算出するべき。
つまり、Param の "現在値" は変化させない方がよい。
というか、変化させるとアイテムの数と多重管理になるので不具合の温床になる。

それが意味するのは、壺についてはパラメータ変化のイベントを発行するなどで通知を行うことができない、ということ。
より拡張を考えるなら、例えば腕輪にヒビが入っていたら値段を下げるとかも考えられそう。

店側が知りたいのは、お店初期状態との差。x
- 初期の値札付きアイテムとの値段の差。
- その減算が発生した原因の人(Entity)

…とはいえ、本当に「誰がどれだけ店に損失を与えたか」を覚えておくべきなのだろうか？

基本的には Player 勢力しか買い物はしない。
AI に買い物をさせるのは単純に実装が大変というのもあるが、そもそもそんなNPCを作る意味があるのか、作って面白いシステムになるのか疑問。
たとえば Player 妨害を目的として、店売りアイテムを買いあさるようになNPCやモンスターは考えられるが、
そういった買い手に通常の売買の処理が必要とは限らない。
オープンワールドでNPC同士が売買するようなシステムを考えるならNPCごとに所持金を持たせるのはアリだが、
ダンジョンではフロアをまたいだら基本的にNPCは消える。

他勢力に Player 同様の買い物処理が必要なケースは、PvP だろう。
ただ複数の仲間を動かすシステムを見ているとわかるが、操作ストレスがものすごい。
斬新ではあるけど、PvPシステムの実装はおそらく無いだろう。

そうすると店は「Player勢力にだけアイテムを売る」を前提としてよい。
また「Player以外は店売りアイテムに触らない」を徹底すれば、パラメータ減少の原因は Player と考えてよい。

店側は
- 減算の原因を知る必要がある
が、
- 減算の原因を覚えておく必要はない
となる。

前者は地雷等の事故による商品消失の処理に必要。
このときは店が覚えている「初期アイテム状態」自体を減らす必要がある。

- 事故でないのに、店の価値が元よりも下がったら、それは Player の責任。

という考えにできるだろう。

この考えを元にすると、価値のチェックは床上アイテムを総なめして値段を計算するだけでよくなる。
「事故」をなんとか検出すればよい。

### 風来のブーンの実装

アイテムの使用回数は見ていないようだった。

Shop クラスは @store で、商品アイテムをキー、支払い責任者を値とする Map で管理していた。
Item は owner の Shop を参照しており、自分が削除された時の処理 (Item.on_die) から、引数で受け取った原因 actor とともにこの Map に登録する。


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