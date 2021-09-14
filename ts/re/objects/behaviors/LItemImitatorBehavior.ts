import { assert } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { DBasics } from "ts/re/data/DBasics";
import { DPrefabImage } from "ts/re/data/DPrefab";
import { DEventId, WalkEventArgs } from "ts/re/data/predefineds/DBasicEvents";
import { REData } from "ts/re/data/REData";
import { Helpers } from "ts/re/system/Helpers";
import { REResponse, SPhaseResult } from "ts/re/system/RECommand";
import { RESystem } from "ts/re/system/RESystem";
import { UAction } from "ts/re/usecases/UAction";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { BlockLayerKind } from "../LBlockLayer";
import { LEntity } from "../LEntity";
import { LEventResult } from "../LEventServer";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LState } from "../states/LState";
import { CommandArgs, DecisionPhase, LBehavior, LNameView, testPickOutItem } from "./LBehavior";


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
    }

    onAttached(self: LEntity): void {
        assert(this._itemEntityId.isEmpty());
        const item = SEntityFactory.newItem(REData.getItemFuzzy("kキュアリーフ").item().id);
        item.setParent(this);
        this._itemEntityId = item.entityId();

        REGame.eventServer.subscribe(DBasics.events.preWalk, this);
        REGame.eventServer.subscribe(DBasics.events.prePut, this);
    }
    
    onDetached(self: LEntity): void {
        assert(this._itemEntityId.hasAny());
        REGame.eventServer.unsubscribe(DBasics.events.preWalk, this);
        REGame.eventServer.unsubscribe(DBasics.events.prePut, this);
        this.itemEntity().clearParent();
    }

    queryDisplayName(): LNameView | undefined {
        return this.itemEntity().getDisplayName();
    }
    
    queryCharacterFileName(): DPrefabImage | undefined {
        const e = this.itemEntity().data();
        const p = REData.prefabs[e.prefabId];
        return p.image;
    }

    queryHomeLayer(): BlockLayerKind | undefined {
        return BlockLayerKind.Ground;
    }
    
    onQueryReactions(actions: DActionId[]): DActionId[] {
        for (const a of this.itemEntity().queryReactions()) {
            actions.push(a);
        }
        return actions;
    }

    public itemEntity(): LEntity {
        return REGame.world.entity(this._itemEntityId);
    }

    queryOutwardFactionId(): number | undefined {
        return REData.system.factions.neutral;
    }

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        return SPhaseResult.Handled;
    }

    [testPickOutItem](args: CommandArgs, context: SCommandContext): REResponse {
        const actor = args.sender;
        const self = args.self;
        if (Helpers.isHostileFactionId(actor.getOutwardFactionId(), self.getInnermostFactionId())) {
            this.parentAs(LState)?.removeThisState();
            
            self.removeFromParent();
            REGame.map.appearEntity(self, actor.x, actor.y);
            UAction.postDropOrDestroy(RESystem.commandContext, self, self.getHomeLayer(), 0);

            return REResponse.Canceled;
        }
        return REResponse.Pass;
    }
    
    onEvent(context: SCommandContext, eventId: DEventId, args: any): LEventResult {
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
        else if (eventId == DBasics.events.prePut) {
            /*
            const e = args as PutEventArgs;
            if (Helpers.isHostileFactionId(e.actor.getOutwardFactionId(), self.getInnermostFactionId())) {
                this.parentAs(LState)?.removeThisState();
                
                self.removeFromParent();
                REGame.map.appearEntity(self, e.actor.x, e.actor.y);
                UAction.postDropOrDestroy(RESystem.commandContext, self, self.getHomeLayer(), 0);

                return LEventResult.Handled;
            }
            */
        }
        return LEventResult.Pass;
    }
}

