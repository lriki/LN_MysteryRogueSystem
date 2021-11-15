import { assert, RESerializable } from "ts/re/Common";
import { REGame } from "./REGame";
import { LEntity } from "./LEntity";
import { LBehaviorId, LEntityId } from "./LObject";
import { DEventId } from "ts/re/data/predefineds/DBasicEvents";
import { LBehavior } from "./internal";
import { LEventResult } from "./LEventServer";

export type LPartyId = number;

// serialize 対象
interface LPartyEventSubscriber {
    eventId: DEventId,
    behaviorId: LBehaviorId,
}

/**
 * 仲間キャラや、グループで動くモンスターをまとめる仕組み。
 * RMMZ の Party と Troop を合わせたようなもの。
 * member がいなくなると、GC される。
 */
@RESerializable
export class LParty {
    private _id: LPartyId = 0;
    private _members: LEntityId[] = [];

    public setup(id: LPartyId) {
        this._id = id;
    }

    public id(): LPartyId {
        return this._id;
    }

    public isEmpty(): boolean {
        return this._members.length == 0;
    }

    public addMember(entity: LEntity): void {
        assert(entity.partyId() == 0);
        entity._partyId = this._id;
        this._members.push(entity.entityId());
        for (const b of entity.collectBehaviors()) b.onPertyChanged(entity);
    }

    public removeMember(entity: LEntity): void {
        assert(entity.partyId() == this._id);
        this._members.mutableRemove(e => e.equals(entity.entityId()));
        for (const b of entity.collectBehaviors()) b.onPertyChanged(entity);

        // unsubscribe
        this._entries.mutableRemoveAll(x => REGame.world.behavior(x.behaviorId).ownerEntity() == entity);
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
                const b = REGame.world.behavior(e.behaviorId);
                const r = b.onPartyEvent(eventId, args);
                if (r != LEventResult.Pass) {
                    return false;
                }
            }
        }
        return true;
    }
}


