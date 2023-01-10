import { assert, MRSerializable } from "ts/mr/Common";
import { DHelpers } from "ts/mr/data/DHelper";
import { DFloorClass, DFloorInfo, DFloorMode, DLand } from "ts/mr/data/DLand";
import { MRData } from "ts/mr/data/MRData";
import { MRDataManager } from "ts/mr/data/MRDataManager";
import { DLandId } from "../data/DCommon";
import { DMap } from "../data/DMap";
import { DFloorPreset } from "../data/DTerrainPreset";

/**
 * LandId と フロア番号によってフロアを識別するもの。
 * 
 * 初期verでは少々扱いづらかったため全フロアに一意の静的なFloorId を振ることで対策したが、
 * 次のような問題が出てきたため、改めて用意した。
 * - MRシステム管理下のすべてのマップは Land 内の Floor として扱った方が都合がよい。
 *   - 例えば固定マップで召喚の罠を踏んだ時の出現エネミーはどこのテーブルからとる？
 * - FloorId を静的なものにしてしまうと、動的な Land 生成に対応しづらくなる。
 */
@MRSerializable
export class LFloorId {
    /** LandId==DHelpers.RmmzNormalMapLandId は、floorNumber が RMMZ の MapId を直接示すことを表す。 */
    private readonly _landId: DLandId;
    //private readonly _floorClass: DFloorClass;
    private readonly _floorNumber: number;      // DLand.floors または DLand.eventMapIds の index.

    public static makeEmpty(): LFloorId {
        return new LFloorId(0, 0);
    }

    public static make(landId: DLandId, floorNumber: number): LFloorId {
        return new LFloorId(landId, floorNumber);
    }

    public static makeFromKeys(landKey: string, floorKey: string): LFloorId {
        const land = MRData.lands.find(x => x.name == landKey);
        if (!land) throw new Error(`Land "${landKey}" not found.`);
        const floorNumber = land.floorInfos.findIndex(x => x && x.key == floorKey);
        if (floorNumber <= 0) throw new Error(`Floor "${floorKey}" not found.`);
        return new LFloorId(land.id, floorNumber);
    }

    // public static makeFromEventMapData(mapData: DMap): LFloorId {
    //     const land = MRData.lands[mapData.landId];
    //     return new LFloorId(mapData.landId, land.eventMapIds.findIndex(x => x == mapData.id));
    // }

    public static makeByRmmzFixedMapName(fixedMapName: string): LFloorId {
        const mapId = $dataMapInfos.findIndex(x => x && x.name == fixedMapName);
        const landId = MRData.maps[mapId].landId;
        const land = MRData.lands[landId];
        const floorNumber = land.findFloorNumberByMapId(mapId);
        assert(floorNumber > 0);
        return new LFloorId(landId, floorNumber);
    }

    // public static makeByRmmzNormalMapId(mapId: number): LFloorId {
    //     const landId = MRData.maps[mapId].landId;
    //     assert(landId > 0);
    //     return new LFloorId(landId, DFloorClass.EventMap, mapId);
    // }

    constructor(landId: DLandId, floorNumber: number) {
        this._landId = landId;
        this._floorNumber = floorNumber;
    }

    public get landId(): DLandId {
        return this._landId;
    }

    public get landData(): DLand {
        return MRData.lands[this._landId];
    }

    public get floorNumber(): number {
        //assert(this._floorClass == DFloorClass.FloorMap);
        return this._floorNumber;
    }

    // public get eventMapIndex(): number {
    //     //assert(this._floorClass == DFloorClass.EventMap);
    //     return this._floorNumber;
    // }


    public get preset(): DFloorPreset {
        const id = this.floorInfo.presetId;
        assert(id > 0);
        return MRData.floorPresets[id];
    }

    public get isEmpty(): boolean {
        return !this.hasAny;
    }

    public get hasAny(): boolean {
        if (this._landId <= 0) return false;
        //if (this._floorClass == DFloorClass.FloorMap) {
            return this._floorNumber != 0;
        // }
        // else {
        //     return this._floorNumber >= 0;
        // }
    }

    public equals(other: LFloorId): boolean {
        return this._landId == other._landId && this._floorNumber == other._floorNumber;
    }

    public clone(): LFloorId {
        return new LFloorId(this._landId, /*this._floorClass,*/ this._floorNumber);
    }

    public get floorInfo(): DFloorInfo {
        assert(this.hasAny);
        const land = MRData.lands[this._landId];
        const info = land.floorInfos[this._floorNumber];
        assert(info);
        return info;
    }

    /** this が示すフロアへ遷移するとなったときに、ロードするべき RMMZ MapId */
    public get rmmzMapId(): number {
        assert(this._landId > 0);
        if (this._landId == DHelpers.VanillaLandId) {
            // MRシステム管理外
            return this._floorNumber;
        }
        else if (this.isEventMap2) {
            const i = this.floorInfo.eventMapIndex;
            assert(i >= 0);
            const mapId = this.landData.eventMapIds[i];
            return mapId;
        }
        else {
            const fixedMapId = this.rmmzFixedMapId2;
            if (fixedMapId > 0) {
                return fixedMapId;
            }
            else {
                return MRData.lands[this._landId].rmmzMapId;
            }
        }
    }

    public get rmmzFixedMapId2(): number {
        const land = this.landData;
        const map = land.getFixedMap(this.floorNumber);
        return map ? map.mapId : 0;
    }

    public get isEventMap2(): boolean {
        return this.floorInfo.floorClass == DFloorClass.EventMap;
    }

    public get isNormalMap2(): boolean {
        return this._landId == DHelpers.VanillaLandId;
    }

    public get isRandomMap2(): boolean {
        if (!this.isTacticsMap2) return false;
        if (this.isEventMap2) return false;
        return this.rmmzFixedMapId2 <= 0;
    }

    public get isFixedMap2(): boolean {
        if (!this.isTacticsMap2) return false;
        return this.rmmzFixedMapId2 > 0;
    }

    public get isSafetyMap2(): boolean {
        if (this._landId == DHelpers.VanillaLandId) {
            const mapId = this.rmmzMapId;
            if (MRData.maps[mapId].safetyMap) {
                return true;
            }
        }

        return false;
        //return this.floorInfo().safetyActions;
    }

    /** Entity を登場させるマップであるか。false の場合は通常の RMMZ マップ。Entity は登場せず、Event を非表示にすることもない。 */
    public get isTacticsMap2(): boolean {
        if (this._landId == DHelpers.VanillaLandId) return false;
        return this.floorInfo.floorClass == DFloorClass.FloorMap;
    }

    /** FloorInfo を取ることができるか */
    public get isDungeonMap2(): boolean {
        return this.floorInfo.floorClass == DFloorClass.FloorMap;
    }

    public get isFieldMap(): boolean {
        return this.floorInfo.mode == DFloorMode.Field;
    }

    public get isRMMZDefaultSystemMap2(): boolean {
        if (this._landId != DHelpers.VanillaLandId) return false;
        return MRData.maps[this._floorNumber].defaultSystem;
    }
}

