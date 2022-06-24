import { assert, MRSerializable } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DPrefabActualImage } from "ts/mr/data/DPrefab";
import { DEventId, WalkEventArgs } from "ts/mr/data/predefineds/DBasicEvents";
import { DFactionId, MRData } from "ts/mr/data/MRData";
import { Helpers } from "ts/mr/system/Helpers";
import { SCommandResponse, SPhaseResult } from "ts/mr/system/SCommand";
import { RESystem } from "ts/mr/system/RESystem";
import { UAction } from "ts/mr/usecases/UAction";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LEntity } from "../LEntity";
import { LEventResult } from "../LEventServer";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LState } from "../states/LState";
import { CommandArgs, DecisionPhase, LBehavior, LNameView, testPickOutItem } from "./LBehavior";
import { DActionId, DBlockLayerKind } from "ts/mr/data/DCommon";
import { LMap } from "../LMap";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LMinimapMarkerClass } from "../LCommon";


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
@MRSerializable
export class LItemImitatorBehavior extends LBehavior {

    //private _itemId: DItemDataId = 0;
    private _itemEntityId: LEntityId = LEntityId.makeEmpty();

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemImitatorBehavior);
        b._itemEntityId = this._itemEntityId.clone();
        return b;
    }

    public constructor() {
        super();
    }

    onAttached(self: LEntity): void {
        assert(this._itemEntityId.isEmpty());

        REGame.eventServer.subscribe(MRBasics.events.preWalk, this);
        REGame.eventServer.subscribe(MRBasics.events.prePut, this);
    }
    
    onDetached(self: LEntity): void {
        assert(this._itemEntityId.hasAny());
        REGame.eventServer.unsubscribe(MRBasics.events.preWalk, this);
        REGame.eventServer.unsubscribe(MRBasics.events.prePut, this);
        this.itemEntity().clearParent();
    }

    onEnteredMap(self: LEntity, map: LMap): void {
        if (this._itemEntityId.isEmpty()) {
            const rand = REGame.world.random();
            const floorId = map.floorId();
            const list = map.land2().landData().appearanceTable.items[floorId.floorNumber()];
            const data = rand.selectOrUndefined(list);

            const item = (data) ?
                SEntityFactory.newEntity(data.spawiInfo, floorId) :
                SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.system.fallbackItemEntityId));

            item.setParent(this);
            this._itemEntityId = item.entityId();
        }
    }

    queryDisplayName(): LNameView | undefined {
        return this.itemEntity().getDisplayName();
    }
    
    queryCharacterFileName(): DPrefabActualImage | undefined {
        const e = this.itemEntity().data;
        const p = MRData.prefabs[e.prefabId];
        return p.image;
    }

    queryHomeLayer(): DBlockLayerKind | undefined {
        return DBlockLayerKind.Ground;
    }

    queryMinimapMarkerClass(): LMinimapMarkerClass | undefined {
        return LMinimapMarkerClass.Item;
    }
    
    onQueryReactions(self: LEntity, actions: DActionId[]): DActionId[] {
        for (const a of this.itemEntity().queryReactions()) {
            actions.push(a);
        }
        return actions;
    }

    public itemEntity(): LEntity {
        return REGame.world.entity(this._itemEntityId);
    }

    queryOutwardFactionId(): DFactionId | undefined {
        return MRData.system.factions.neutral;
    }

    [testPickOutItem](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const actor = args.sender;
        const self = args.self;
        if (Helpers.isHostileFactionId(actor.getOutwardFactionId(), self.getInnermostFactionId())) {
            this.parentAs(LState)?.removeThisState();
            
            self.removeFromParent();
            REGame.map.appearEntity(self, actor.mx, actor.my);
            UAction.postDropOrDestroyOnCurrentPos(RESystem.commandContext, self, self.getHomeLayer());

            return SCommandResponse.Canceled;
        }
        return SCommandResponse.Pass;
    }
    
    onEvent(cctx: SCommandContext, eventId: DEventId, args: any): LEventResult {
        const self = this.ownerEntity();

        if (eventId == MRBasics.events.preWalk) {
            const e = args as WalkEventArgs;

            // 敵対 Entity が、歩行によって同じ座標に移動しようとしたらステート解除
            if (Helpers.isHostileFactionId(e.walker.getOutwardFactionId(), self.getInnermostFactionId()) &&
                e.targetX == self.mx && e.targetY == self.my) {
                this.parentAs(LState)?.removeThisState();
                return LEventResult.Handled;
            }
            
        }
        else if (eventId == MRBasics.events.prePut) {
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

