import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DItem, DItemDataId } from "ts/data/DItem";
import { DPrefabImage } from "ts/data/DPrefab";
import { DEventId, WalkEventArgs } from "ts/data/predefineds/DBasicEvents";
import { REData } from "ts/data/REData";
import { Helpers } from "ts/system/Helpers";
import { SPhaseResult } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { BlockLayerKind } from "../LBlockLayer";
import { LEntity } from "../LEntity";
import { LEventResult } from "../LEventServer";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LState } from "../states/LState";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";


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

    //private _itemId: DItemDataId = 0;
    private _itemEntityId: LEntityId = LEntityId.makeEmpty();

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemImitatorBehavior);
        b._itemEntityId = this._itemEntityId.clone();
        return b
    }

    public constructor() {
        super();
        console.log("LItemImitatorBehavior");
    }

    onAttached(): void {
        assert(this._itemEntityId.isEmpty());
        const item = SEntityFactory.newItem(REData.getItemFuzzy("kキュアリーフ").item().id);
        item.setParent(this);
        this._itemEntityId = item.entityId();

        REGame.eventServer.subscribe(DBasics.events.preWalk, this);
    }
    
    onDetached(): void {
        assert(this._itemEntityId.hasAny());
        REGame.eventServer.unsubscribe(DBasics.events.preWalk, this);
        this.itemEntity().clearParent();
    }

    queryHomeLayer(): BlockLayerKind | undefined {
        return BlockLayerKind.Ground;
    }

    public itemEntity(): LEntity {
        return REGame.world.entity(this._itemEntityId);
    }
    
    queryCharacterFileName(): DPrefabImage | undefined {
        const e = this.itemEntity().data();
        const p = REData.prefabs[e.prefabId];
        return p.image;
    }

    queryOutwardFactionId(): number | undefined {
        return REData.system.factions.neutral;
    }

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        return SPhaseResult.Handled;
    }

    onEvent(eventId: DEventId, args: any): LEventResult {
        const self = this.ownerEntity();

        if (eventId == DBasics.events.preWalk) {
            const e = args as WalkEventArgs;

            // 敵対 Entity が、歩行によって同じ座標に移動しようとしたらステート解除
            if (Helpers.isHostileFactionId(e.walker.getOutwardFactionId(), self.getInnermostFactionId()) &&
                e.targetX == self.x && e.targetY == self.y) {
                this.parentAs(LState)?.removeThisState();
                return LEventResult.Handled;
            }
        }
        return LEventResult.Pass;
    }
}

