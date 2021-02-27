import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DMonsterHouseId } from "ts/data/DMonsterHouse";
import { DFactionId } from "ts/data/REData";
import { FRoom } from "ts/floorgen/FMapData";
import { RECommandContext } from "ts/system/RECommandContext";
import { REGame } from "./REGame";
import { REGame_Entity } from "./REGame_Entity";

export enum MonsterHouseState {
    Sleeping = 0,
    Activated = 1,
}

export class LRoom {
    private _roomId: number = 0;
    private _x1: number = -1;   // 有効範囲内左上座標
    private _y1: number = -1;   // 有効範囲内左上座標
    private _x2: number = -1;   // 有効範囲内右下座標
    private _y2: number = -1;   // 有効範囲内右下座標
    private _monsterHouseTypeId: DMonsterHouseId = 0;
    private _monsterHouseFactionId: DFactionId = 0;
    private _monsterHouseState: MonsterHouseState = MonsterHouseState.Sleeping;

    public setup(room: FRoom): void {
        this._roomId = room.id();
        this._x1 = room.x1();
        this._y1 = room.y1();
        this._x2 = room.x2();
        this._y2 = room.y2();
        this._monsterHouseTypeId = room.monsterHouseTypeId();
        this._monsterHouseFactionId = DBasics.factions.enemy;
        this._monsterHouseState = MonsterHouseState.Sleeping;
    }

    public monsterHouseTypeId(): DMonsterHouseId {
        return this._monsterHouseTypeId;
    }

    public monsterHouseFactionId(): DFactionId {
        return this._monsterHouseFactionId;
    }

    public monsterHouseState(): MonsterHouseState {
        return this._monsterHouseState;
    }

    public contains(x: number, y: number): boolean {
        return this._x1 <= x && x <= this._x2 && this._y1 <= y && y <= this._y2;
    }

    public startMonsterHouse(context: RECommandContext): void {
        assert(this._monsterHouseTypeId > 0);
        assert(this._monsterHouseState == MonsterHouseState.Sleeping);

        context.postWaitSequel();
        context.postMessage("モンスターハウスだ！");

        this._monsterHouseState = MonsterHouseState.Activated;
    }
    
    public forEachEntities(func: (entity: REGame_Entity) => void): void {
        for (const entity of REGame.map.entities()) {
            if (this.contains(entity.x, entity.y)) {
                func(entity);
            }
        }
    }
    
    public findEntityInRoom(func: (entity: REGame_Entity) => boolean): REGame_Entity | undefined {
        for (const entity of REGame.map.entities()) {
            if (this.contains(entity.x, entity.y)) {
                if (func(entity)) {
                    return entity;
                }
            }
        }
        return undefined;
    }
}


