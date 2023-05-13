import { assert, MRSerializable } from "ts/mr/Common";
import { MRLively } from "./MRLively";
import { LEntity } from "./entity/LEntity";
import { LBehaviorId, LEntityId } from "./LObject";
import { DEventId } from "ts/mr/data/predefineds/DBasicEvents";
import { LBehavior } from "./internal";
import { LEventResult } from "./LEventServer";
import { LJournal } from "./LJournal";
import { MRData } from "../data";
import { DLandId } from "../data/DCommon";
import { LInventoryBehavior } from "./entity/LInventoryBehavior";

export type LPartyId = number;

// serialize 対象
interface LPartyEventSubscriber {
    eventId: DEventId,
    behaviorId: LBehaviorId,
}

export enum LPartyAgreement {
    /** フリー。 */
    None = 0,

    /** ひとりの Entity に付き従う。 */
    Leadership = 1,
}

/**
 * 仲間キャラや、グループで動くモンスターをまとめる仕組み。
 * RMMZ の Party と Troop を合わせたようなもの。
 * member がいなくなると、GC される。
 * 
 * Party には Leader が一人いる。
 * Leader がフロア移動すると、Party に属する全員が移動する。
 * 
 * Leader ではないメンバーがフロア移動すると、そのメンバーは Party を脱退する。
 * 
 * Party は勢力を表すものではない。
 * 仲間が倒されて Party を離脱しても、友好な Unique Entity として World 上には存在し、再び Party に入ることはできる。
 */
@MRSerializable
export class LParty {
    private _id: LPartyId = 0;
    private _members: LEntityId[] = [];
    private _leaderEntityId: LEntityId;
    private _agreement: LPartyAgreement = LPartyAgreement.None;

    public readonly journal: LJournal;

    public constructor() {
        this._leaderEntityId = LEntityId.makeEmpty();
        this._agreement = LPartyAgreement.None;
        this.journal = new LJournal();
        this.journal.startChallenging();
    }
    
    public get members(): LEntity[] {
        return this._members.map(e => MRLively.world.entity(e));
    }

    public get leader(): LEntity {
        assert(this._leaderEntityId.hasAny());
        return MRLively.world.entity(this._leaderEntityId);
    }

    public setup(id: LPartyId) {
        this._id = id;
    }

    public id(): LPartyId {
        return this._id;
    }

    public isEmpty(): boolean {
        return this._members.length == 0;
    }


    public setPartyAgreement(value: LPartyAgreement): void {
        this._agreement = value;
    }

    public isFollower(entity: LEntity): boolean {
        if (this._agreement == LPartyAgreement.Leadership) {
            if (entity.entityId().equals(this._leaderEntityId)) {
                return false;
            }
            return true;
        }
        return false;
    }

    public addMember(entity: LEntity): void {
        assert(entity.partyId() == 0);
        entity._partyId = this._id;
        this._members.push(entity.entityId());
        if (this._members.length == 1) {
            this._leaderEntityId = entity.entityId();
        }

        for (const b of entity.collectBehaviors()) {
            b.onPertyChanged(entity);
        }
    }

    public removeMember(entity: LEntity): void {
        assert(entity.partyId() == this._id);
        this._members.mutableRemove(e => e.equals(entity.entityId()));
        for (const b of entity.collectBehaviors()) b.onPertyChanged(entity);

        // unsubscribe
        this._entries.mutableRemoveAll(x => MRLively.world.behavior(x.behaviorId).ownerEntity() == entity);
    }
    
    private _entries: LPartyEventSubscriber[] = [];
    
    public subscribe(eventId: DEventId, behavior: LBehavior) {
        assert(behavior.hasId());
        this._entries.push({
            eventId: eventId,
            behaviorId: behavior.id(),
        });
    }

    public unsubscribe(eventId: DEventId, behavior: LBehavior) {
        const id = behavior.id();
        const index = this._entries.findIndex(e => e.eventId == eventId && e.behaviorId == id);
        if (index >= 0) {
            this._entries.splice(index, 1);
        }
    }

    public send(eventId: DEventId, args: any): boolean {
        for (const e of this._entries) {
            if (e.eventId == eventId) {
                const b = MRLively.world.behavior(e.behaviorId);
                const r = b.onPartyEvent(eventId, args);
                if (r != LEventResult.Pass) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 挑戦開始。基本的に拠点での起床時に開始する。拠点マップ(World)に居る時も、冒険中とみなす。（倉庫とかで倒れたりするので）
     * 
     * 開始後に繰り返し startChallenging() を呼び出しても良いものとする。
     * これは主に、Land に入ったときのステータスリセットなどに使う。
     */
    public startChallenging(/*entryLandId: DLandId*/): void {
        //this._entranceLandId = entryLandId;
        this.journal.startChallenging();
    }

    /** 挑戦終了 */
    public finishChallenging(): void {

        // ステータスをリセット
        for (const member of this.members) {
            member.resetStatus();
            member.recoverAll();
        }

        if (this.journal.isPenaltyResult) {
            // 何らかのペナルティを伴う挑戦結果だった。

            // アイテムをすべて失う
            for (const member of this.members) {
                const inventory = member.findEntityBehavior(LInventoryBehavior);
                if (inventory) {
                    inventory.reset();
                }
            }
        }
        else {
            // ペナルティ無し。
        }

        this.journal.finishChallenging();
        this.journal.startChallenging();
    }

    public onMemberMovedLand(member: LEntity, newLandId: DLandId, oldLandId: DLandId): void {
        // if (this._leaderEntityId.equals(member.entityId())) {
        //     const newLand = MRData.lands[newLandId];
        //     const oldLand = MRData.lands[oldLandId];
        //     if (newLand.isDungeonLand && !oldLand.isDungeonLand) {
        //         // World から Dungeon への移動（突入）
        //         this.journal.startChallenging(newLandId);
        //     }
        //     else if (!newLand.isDungeonLand && oldLand.isDungeonLand) {
        //         // Dungeon から World への移動（帰還）
                

        //         // TODO: ちゃんと LandRule を参照するべきだが、とりあえず #8 対応のため一律リセットにしておく
        //         member.recoverAll();
        //     }
        // }
    }
}


