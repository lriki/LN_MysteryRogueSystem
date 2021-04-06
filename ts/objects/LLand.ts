import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DMonsterHouseId } from "ts/data/DMonsterHouse";
import { DFactionId, REData } from "ts/data/REData";
import { FRoom } from "ts/floorgen/FMapData";
import { RECommandContext } from "ts/system/RECommandContext";
import { REGame } from "./REGame";
import { REGame_Block, TileKind } from "./REGame_Block";
import { LEntity } from "./LEntity";
import { DFloorInfo, DLand, DLandId } from "ts/data/DLand";

/**
 * LandId と フロア番号によってフロアを識別するもの。
 * 
 * 初期verでは少々扱いづらかったため全フロアに一意の静的なFloorId を振ることで対策したが、
 * 次のような問題が出てきたため、改めて用意した。
 * - REシステム管理下のすべてのマップは Land 内の Floor として扱った方が都合がよい。
 *   - 例えば固定マップで召喚の罠を踏んだ時の出現エネミーはどこのテーブルからとる？
 * - FloorId を静的なものにしてしまうと、動的な Land 生成に対応しづらくなる。
 */
export class LFloorId {
    private readonly _landId: number;
    private readonly _floorNumber: number;

    constructor(index: number, key: number) {
        this._landId = index;
        this._floorNumber = key;
    }

    public index2(): number {
        return this._landId;
    }

    public key2(): number {
        return this._floorNumber;
    }

    public isEmpty(): boolean {
        return this._landId == 0 && this._floorNumber == 0;
    }

    public hasAny(): boolean {
        return this._landId > 0 && this._floorNumber != 0;
    }

    public equals(other: LFloorId): boolean {
        return this._landId == other._landId && this._floorNumber == other._floorNumber;
    }

    public clone(): LFloorId {
        return new LFloorId(this._landId, this._floorNumber);
    }

    public static makeEmpty(): LFloorId {
        return new LFloorId(0, 0);
    }

    public static makeByRmmzFixedMapName(fixedMapName: string): LFloorId {
        const mapId = $dataMapInfos.findIndex(x => x && x.name == fixedMapName);
        const landId = REData.maps[mapId].landId;
        const floorNumber = REData.lands[landId].floorInfos.findIndex(x => x && x.fixedMapName == fixedMapName);
        assert(floorNumber > 0);
        return new LFloorId(landId, floorNumber);
    }

    public static makeByRmmzFixedMapId(mapId: number): LFloorId {
        const mapInfo = $dataMapInfos[mapId];
        assert(mapInfo);
        const fixedMapName = mapInfo.name;
        const landId = REData.maps[mapId].landId;
        const floorNumber = REData.lands[landId].floorInfos.findIndex(x => x && x.fixedMapName == fixedMapName);
        assert(floorNumber > 0);
        return new LFloorId(landId, floorNumber);
    }

    public floorInfo(): DFloorInfo {
        const info = REData.lands[this._landId].floorInfos[this._floorNumber];
        assert(info);
        return info;
    }

    public rmmzFixedMapId(): number {
        const info = this.floorInfo();
        return $dataMapInfos.findIndex(x => x && x.name == info.fixedMapName);
    }

    public isRandomMap(): boolean {
        return this.rmmzFixedMapId() <= 0;
    }
}

export class LLand {
    private _landDataId: DLandId = 0;

    public setup_(landDataId: DLandId): void {
        this._landDataId = landDataId;
    }
}


