import { LEntity } from "./LEntity";
import { assert, MRSerializable } from "../Common";
import { REGame } from "./REGame";
import { LRandom } from "ts/mr/objects/LRandom";
import { LEntityId, LObject, LObjectType, LObjectId, LBehaviorId } from "./LObject";
import { LBehavior } from "./behaviors/LBehavior";
import { LAbility, LAbilityId } from "./abilities/LAbility";
import { LFloorId } from "./LFloorId";
import { MRData } from "ts/mr/data/MRData";
import { LLand } from "./LLand";
import { DLandId } from "ts/mr/data/DLand";
import { LParty, LPartyId } from "./LParty";
import { UMovement } from "ts/mr/usecases/UMovement";
import { RESystem } from "ts/mr/system/RESystem";
import { DEntityId } from "ts/mr/data/DEntity";
import { UState } from "ts/mr/usecases/UState";

/**
 * 1ゲーム内に1インスタンス存在する。
 */
@MRSerializable
export class LWorld {
    private _objects: (LObject | undefined)[] = [];
    private _random: LRandom = new LRandom(Math.floor(Math.random() * 65535) + 1);
    private _lands: LLand[];
    private _parties: (LParty | undefined)[];

    constructor() {
        this._objects = [undefined];   // [0] is dummy
        this._lands = MRData.lands.map(x => {
            const land = new LLand();
            land.setup_(x.id);
            return land;
        });
        this._parties = [undefined];  // [0] is dummy
    }
    
    public object(id: LObjectId): LObject {
        const e = this._objects[id.index2()];
        if (e && e.__objectId().key2() == id.key2()) {
            return e;
        }
        else {
            if (!e) {
                throw new Error(`Unregisterd entity. (id: [${id.index2()}, ${id.key2()}])`);
            }
            else {
                throw new Error(`Destroyed entity. (id: [${id.index2()}, ${id.key2()}], actualy:[${e.__objectId().index2()}, ${e.__objectId().key2()}])`);
            }
        }
    }

    public findObject(id: LObjectId): LObject | undefined {
        const e = this._objects[id.index2()];
        if (e && e.__objectId().key2() == id.key2()) {
            return e;
        }
        else {
            return undefined;
        }
    }

    public iterateEntity(func: ((x: LEntity) => void) | ((x: LEntity) => boolean)): void {
        for (const obj of this._objects) {
            if (obj && obj.objectType() == LObjectType.Entity) {
                if (func(obj as LEntity) === false) return;
            }
        }
    }

    public findEntity(id: LEntityId): LEntity | undefined {
        const obj = this.findObject(id);
        if (obj && obj.objectType() == LObjectType.Entity)
            return obj as LEntity;
        else
            return undefined;
    }

    public findFirstEntity(func: (entity: LEntity) => boolean): LEntity | undefined {
        const r = REGame.world.objects().find(x => {
            if (x instanceof LEntity) {
                return func(x);
            }
            return false;
        });
        if (r && r instanceof LEntity) {
            return r;
        }
        else {
            return undefined;
        }
    }

    public getFirstEntityByKey(key: string): LEntity {
        const entity = this.findFirstEntity(x => x.data.entity.key == key);
        if (!entity) throw new Error(`Entity not found (${key})`);
        return entity;
    }

    public findBehavior(id: LBehaviorId): LBehavior | undefined {
        const obj = this.findObject(id);
        if (obj && obj.objectType() == LObjectType.Behavior)
            return obj as LBehavior;
        else
            return undefined;
    }
    
    public objects(): (LObject | undefined)[] {
        return this._objects;
    }

    public entity(id: LObjectId): LEntity {
        const e = this.findEntity(id);
        if (!e) {
            throw new Error(`Invalid entity type. (id: [${id.index2()}, ${id.key2()}])`);
        }
        return e;
    }

    public behavior(id: LBehaviorId): LBehavior {
        const e = this.findBehavior(id);
        if (!e) {
            throw new Error(`Invalid behavior type. (id: [${id.index2()}, ${id.key2()}])`);
        }
        return e;
    }


    public entityByIndex(index: number): LEntity {
        const e = this._objects[index];
        assert(e instanceof LEntity);
        return e;
    }

    ability(id: LAbilityId): LAbility {
        const e = this.object(id);
        if (e.objectType() == LObjectType.Ability)
            return e as LAbility;
        else
            throw new Error(`Invalid ability type. (id: [${id.index2()}, ${id.key2()}])`);
    }

    random(): LRandom {
        return this._random;
    }

    public land(landId: DLandId): LLand {
        return this._lands[landId];
    }

    public party(partyId: LPartyId): LParty {
        const p = this._parties[partyId];
        assert(p);
        return p;
    }

    /**
     * 新しい Entity を World 内に生成する。
     * 
     * 生成された Entity はいずれの Floor にも属さない状態となっている。
     * 出現させるには transfarEntity() を呼び出す必要がある。
     */
    spawnEntity(entityDataId: DEntityId): LEntity {
        const entity = new LEntity();
        entity.setupInstance(entityDataId);
        this._registerObject(entity);
        return entity;
    }

    /**
     * インスタンスを作成し、World に登録する。
     * この後、何らかの親オブジェクトに属さない場合、GC で削除される。
     */
    public spawn<T extends LObject>(ctor: { new(...args: any[]): T }) {
        const obj = new ctor();
        this._registerObject(obj);
        return obj;
    }

    public newParty(): LParty {
        const party = new LParty();
        const index = this._parties.findIndex((x, i) => i > 0 && x == undefined);
        if (index < 0) {
            party.setup(this._parties.length);
            this._parties.push(party);
        }
        else {
            party.setup(index);
            this._parties[index] = party;
        }
        return party;
    }

    public _registerObject(obj: LObject): void {
        assert(!obj.hasId());
        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._objects.findIndex((x, i) => i > 0 && x == undefined);
        if (index < 0) {
            obj._setObjectId(new LEntityId(this._objects.length, this._random.nextInt()));
            this._objects.push(obj);
        }
        else {
            obj._setObjectId(new LEntityId(index, this._random.nextInt()));
            this._objects[index] = obj;
        }
    }

    /**
     * Entity を指定した位置に移動する。
     * - 現在表示中のマップへ移動した場合、そのマップへ登場する。
     *   - 移動先の同一 BlockLayer に別の Entity がいた場合、移動は失敗する。
     * - 表示中以外のマップ(固定マップ)へ移動した場合、
     *   - 移動先の同一 BlockLayer に別の Entity がいた場合、移動は失敗する。
     * 
     * 直ちに座標を変更するため、コマンドチェーン実行内からの呼び出しは禁止。
     * CommandContext.postTransferFloor() を使うこと。
     * 
     * このメソッドで移動しても、足元に対するアクションは行わない。(罠を踏んだり、アイテムを拾ったりしない)
     * 
     * mx, my は省略可能。これは、未ロードのランダムマップへの遷移時に使用する。
     */
    public transferEntity(entity: LEntity, floorId: LFloorId, mx: number = -1, my: number = -1): boolean {
        const mapFloorId = REGame.map.floorId();
        if (!mapFloorId .equals(floorId) && floorId.isRandomMap()) {
            // 未ロードのランダムマップへ遷移するとき、座標が明示されているのはおかしい
            assert(mx < 0);
            assert(my < 0);
        }

        if (REGame.map.isValid() && !mapFloorId.equals(floorId) && mapFloorId.equals(entity.floorId)) {
            // 現在マップからの離脱
            REGame.map._removeEntity(entity);
        }

        const oldLandId = entity.floorId.landId();

        // Floor 間移動?
        if (!entity.floorId.equals(floorId)) {
            UState.attemptRemoveStateAtFloorTransfer(entity);
        }

        if (mapFloorId.equals(floorId)) {
            if (entity.floorId.equals(floorId)) {
                // 現在マップ内での座標移動
                UMovement.locateEntity(entity, mx, my);
            }
            else {
                // 他の Floor から、現在表示中の Floor へ移動
                entity.floorId = floorId;
                UMovement.locateEntity(entity, mx, my);
                REGame.map._addEntityInternal(entity);
            }

        }
        else {
            // 現在マップから他のフロアへの移動
            UMovement.locateEntityAtFloorMoved(entity, floorId, mx, my);
        }

        // Camera が注視している Entity が別マップへ移動したら、マップ遷移
        if (REGame.camera.focusedEntityId().equals(entity.entityId()) &&
            !mapFloorId.equals(entity.floorId)) {
            REGame.camera._reserveFloorTransferToFocusedEntity();
        }

        // Land 間移動が行われた
        if (oldLandId != floorId.landId()) {
            RESystem.groundRules.onEntityLandLeaved(entity);
        }

        return true;
    }

    public _removeDestroyedObjects(): void {
        for (let i = 1; i < this._objects.length; i++) {
            const obj = this._objects[i];
            if (obj) {
                if (obj.isGCReady()) {
                    // Unique Entity 以外で、いずれからの参照もない Entity は削除する
                    obj.destroy();
                }

                if (obj.isDestroyed()) {

                    obj.onFinalize();
                    this._objects[i] = undefined;
    
                    if (REGame.camera.focusedEntityId().equals(obj.__objectId())) {
                        REGame.camera.clearFocus();
                    }
                }
            }

        }

        // Party
        for (let i = 1; i < this._parties.length; i++) {
            const party = this._parties[i];
            if (party && party.isEmpty()) {
                this._parties[i] = undefined;
            }
        }

    }

    public getEntityByRmmzActorId(rmmzActorId: number): LEntity {
        let actorEntity: LEntity | undefined;
        REGame.world.iterateEntity(entity => {
            const actorData = entity.data.actor;
            if (actorData && actorData.rmmzActorId == rmmzActorId) {
                actorEntity = entity;
                return false;
            }
            return true;
        });
        assert(actorEntity);
        return actorEntity;
    }
}
