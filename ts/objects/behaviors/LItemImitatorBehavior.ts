import { DItem, DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBehavior } from "./LBehavior";


/**
 * Item に化けるモンスター。
 * 
 * [2021/6/20] 化けるItem自体のEntityと合成するか、それは内包して見た目だけコントールするか
 * ----------
 * 
 * 後者で行ってみる。
 * 
 * 後者の場合、基本的にはこの Behavior で名前、アイコン、種別、コマンドリストなどをオーバーライドして対応できる。
 * アイテムによっては 水がめの [くむ]、草投げの杖の [いれる]、いかすしの巻物の [たべる] など基本と異なるコマンドがあるが、
 * それは内包しているアイテム Entity に対して中継すればよいだけ。説明文、使用回数や修正値もこのように参照できる。
 * 
 * 前者の場合、真のアイテム種別などをモンスターEntity自身が持ってしまうことになるため、
 * 種別の区別が必要になる色々な処理に細工が必要になる。
 * たとえば、ひま投げで投げられた化けモンスターが、合成の壺や草効果の壺に入った時。
 * 壺側の処理として、Entityが２つの種類を持つ可能性を考慮するのは何か違うきがするし、
 * そういった処理を常に気を付けながら実装しなければならないのはNG.
 * 
 * どちらの場合にしても、例えば草、杖といった "種別" は、表示用と処理用の2つが必要になる。
 * 
 * [2021/6/21] アイテム化けはスキルおよびステートとして扱う
 * ----------
 * 
 * こうしないと、完全にあるモンスター専用の Behavior を作る必要がある。
 * それはカスタマイズ性を著しく下げるため避けたいところ。
 * その場合は既存の AI の仕組みをオーバーライドする必要もあり、AI 側はそのような使われ方を想定して実装しなければならず負担が大きい。
 * 
 * アイテム化けスキルは「敵対Entityが視界内にいなければ優先的に発動する」スキルとして実装する。
 * またこのスキルは「アイテム化けステートを付加する」のみの効果とする。
 * 
 * 
 * 
 * 
 */
export class LItemImitatorBehavior extends LBehavior {

    private _itemId: DItemDataId = 0;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemImitatorBehavior);
        b._itemId = this._itemId;
        return b
    }

    public constructor() {
        super();
        console.log("LItemImitatorBehavior");
    }
    
    public queryCharacterFileName(): string | undefined {
        return "Damage2";
    }


    /*
    public itemDataId(): DItemDataId {
        return this._itemId;
    }

    public itemData(): DItem {
        return REData.items[this._itemId];
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.itemId)
            return this._itemId;
        else
            super.onQueryProperty(propertyId);
    }
    */

}

