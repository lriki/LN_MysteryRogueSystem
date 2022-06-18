import { MRSerializable } from "ts/re/Common";
import { DTextManager } from "ts/re/data/DTextManager";
import { MRBasics } from "ts/re/data/MRBasics";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBehavior, LNameView } from "./LBehavior";




/**
 * お金
 */
@MRSerializable
export class LGoldBehavior extends LBehavior {
    /*
    [2021/9/29] 金額の持ち方
    -----------
    ### upgradeValue や capacity と共有してみる？
    しないほうがよさそう。
    それぞれ値の範囲が決まっている。 (-ベース~+99 など)

    ### GoldBehavior のフィールドとして持つ？
    お金専用の処理が組みやすいが、Editorからいろいろ設定するときに専用のGUIが必要になってしまう。

    ### Goldパラメータを作る
    安牌かも。
    実質お金という固有のアイテムでしか使わないパラメータではあるが、これを利用することで
    - アイテムのダメージ計算として "a.gold/10" のように指定し、EffectContext を使用した通常のダメージが使える。
    - 出現テーブルでエンティティのパラメータとして金額氏を指定できる。特定のダンジョンやフロアでは落ちているお金の金額が大きい、といった表現ができる。
    */

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LGoldBehavior);
        return b;
    }

    public constructor() {
        super();
    }

    onAttached(self: LEntity): void {
        const params = self.params();
        params.acquireParam(MRBasics.params.gold);
    }

    queryDisplayName(): LNameView | undefined {
        const data = this.ownerEntity().data;
        return {
            name: this.gold().toString() + DTextManager.currencyUnit,
            iconIndex: data.display.iconIndex,
            upgrades: 0,
        }
    }

    onCheckLooksLikeGold(): boolean {
        return true;
    }
    
    public gold(): number {
        return this.ownerEntity().actualParam(MRBasics.params.gold);
    }

    public setGold(value: number) {
        this.ownerEntity().setActualParam(MRBasics.params.gold, value);
    }
}

