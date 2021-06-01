import { LEntity } from "./LEntity";
import { assert } from "../Common";
import { REGame } from "./REGame";
import { LRandom } from "ts/objects/LRandom";
import { LEntityId, LObject, LObjectType, LObjectId, LBehaviorId } from "./LObject";
import { LBehavior } from "./behaviors/LBehavior";
import { LAbility, LAbilityId } from "./abilities/LAbility";
import { LFloorId } from "./LFloorId";
import { REData } from "ts/data/REData";
import { LLand } from "./LLand";
import { DLandId } from "ts/data/DLand";
import { LParty, LPartyId } from "./LParty";
import { SMovementCommon } from "ts/system/SMovementCommon";
import { RESystem } from "ts/system/RESystem";

/**
 * 1ゲーム内に1インスタンス存在する。
 */
export class LWorld
{
    private _objects: (LObject | undefined)[] = [];
    private _random: LRandom = new LRandom(Math.floor(Math.random() * 65535) + 1);
    private _lands: LLand[];
    private _parties: (LParty | undefined)[];

    constructor() {
        this._objects = [undefined];   // [0] is dummy
        this._lands = REData.lands.map(x => {
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

    public findEntity(id: LEntityId): LEntity | undefined {
        const obj = this.findObject(id);
        if (obj && obj.objectType() == LObjectType.Entity)
            return obj as LEntity;
        else
            return undefined;
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
        if (!e) throw new Error(`Invalid behavior type. (id: [${id.index2()}, ${id.key2()}])`);
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
            throw new Error(`Invalid entity type. (id: [${id.index2()}, ${id.key2()}])`);
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
    spawnEntity(): LEntity {
        const entity = new LEntity();
        this._registerObject(entity);
        return entity;
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

    /*
    _registerBehavior(behavior: LBehavior) {
        assert(!behavior.hasId());
        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._behaviors.findIndex((x, i) => i > 0 && x == undefined);
        if (index < 0) {
            behavior._setObjectId(new LEntityId(this._behaviors.length, this._random.nextInt()));
            this._behaviors.push(behavior);
        }
        else {
            behavior._setObjectId(new LEntityId(index, this._random.nextInt()));
            this._behaviors[index] = behavior;
        }
    }

    _unregisterBehavior(behavior: LBehavior) {
        this._behaviors[behavior.id().index2()] = undefined;
        behavior._clearObjectId();
    }
    */

    /*
    newBehavior<T>(ctor: { new(...args: any[]): T }): T {

        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._behaviors.findIndex((x, i) => i > 0 && x == undefined);
        const newId: LBehaviorId = {
            index: (index < 0) ? this._behaviors.length : index,
            key : this._random.nextInt(),
        }

        const behavior = new T(newId);
        this._behaviors[newId.index] = behavior;
    }
    */
    /**
     * Entity を指定した位置に移動する。
     * - 現在表示中のマップへ移動した場合、そのマップへ登場する。
     *   - 移動先の同一 BlockLayer に別の Entity がいた場合、移動は失敗する。
     * - 表示中以外のマップ(固定マップ)へ移動した場合、
     *   - 移動先の同一 BlockLayer に別の Entity がいた場合、移動は失敗する。
     * - 表示中以外のマップ(ランダムマップ)へ移動した場合、
     *   - 座標は常に 0,0 へ移動し、成功する。ほかの Entity とは重なるが、ランダムマップ生成時に再配置される。
     * 
     * 直ちに座標を変更するため、コマンドチェーン実行内からの呼び出しは禁止。
     * CommandContext.postTransferFloor() を使うこと。
     */
    _transferEntity(entity: LEntity, floorId: LFloorId, x: number, y: number): boolean {
        if (REGame.map.isValid() && REGame.map.floorId() != floorId && REGame.map.floorId() == entity.floorId) {
            // 現在マップからの離脱
            REGame.map._removeEntity(entity);
        }

        const oldLandId = entity.floorId.landId();

        if (REGame.map.floorId() == floorId) {
            // 現在表示中のマップへの移動
            entity.floorId = floorId;
            SMovementCommon.locateEntity(entity, x, y);
            REGame.map._addEntityInternal(entity);
        }
        else {
            entity.floorId = floorId;
            entity.x = x;
            entity.y = y;
        }

        // Camera が注視している Entity が別マップへ移動したら、マップ遷移
        if (REGame.camera.focusedEntityId().equals(entity.entityId()) &&
            REGame.map.floorId() != entity.floorId) {
            REGame.camera._reserveFloorTransferToFocusedEntity();
        }

        // Land 間移動が行われた
        if (oldLandId != floorId.landId()) {
            console.log("onEntityLandLeaved", oldLandId, floorId.landId(), entity);
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

}

