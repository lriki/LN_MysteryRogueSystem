import { assert } from "ts/Common";
import { DHelpers } from "ts/data/DHelper";
import { DFloorInfo, DLand, DLandId } from "ts/data/DLand";
import { REData } from "ts/data/REData";

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
    /** LandId=0 は、floorNumber が RMMZ の MapId を直接示すことを表す。 */
    private readonly _landId: DLandId;

    private readonly _floorNumber: number;

    constructor(landId: DLandId, floorNumber: number) {
        this._landId = landId;
        this._floorNumber = floorNumber;
    }

    public landId(): DLandId {
        return this._landId;
    }

    public floorNumber(): number {
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

    public static make(landId: DLandId, floorNumber: number): LFloorId {
        return new LFloorId(landId, floorNumber);
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

    public static makeByRmmzNormalMapId(mapId: number): LFloorId {
        return new LFloorId(DHelpers.RmmzNormalMapLandId, mapId);
    }

    public landData(): DLand {
        return REData.lands[this._landId];
    }

    public floorInfo(): DFloorInfo {
        const info = REData.lands[this._landId].floorInfos[this._floorNumber];
        assert(info);
        return info;
    }

    /** this が示すフロアへ遷移するとなったときに、ロードするべき RMMZ MapId */
    public rmmzMapId(): number {
        assert(this._landId > 0);
        if (this._landId == DHelpers.RmmzNormalMapLandId) {
            // REシステム管理外
            return this._floorNumber;
        }
        else {
            const fixedMapId = this.rmmzFixedMapId();
            if (fixedMapId > 0) {
                return fixedMapId;
            }
            else {
                return REData.lands[this._landId].rmmzMapId;
            }
        }
    }

    public rmmzFixedMapId(): number {
        const info = this.floorInfo();
        return $dataMapInfos.findIndex(x => x && x.name == info.fixedMapName);
    }

    public isNormalMap(): boolean {
        return this._landId == DHelpers.RmmzNormalMapLandId;
    }

    public isRandomMap(): boolean {
        return this.rmmzFixedMapId() <= 0;
    }

    public isFixedMap(): boolean {
        return this.rmmzFixedMapId() > 0;
    }
}

