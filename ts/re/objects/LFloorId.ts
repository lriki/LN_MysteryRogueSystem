import { assert, RESerializable } from "ts/re/Common";
import { DHelpers } from "ts/re/data/DHelper";
import { DFloorInfo, DLand, DLandId } from "ts/re/data/DLand";
import { DMap, REData } from "ts/re/data/REData";
import { REDataManager } from "ts/re/data/REDataManager";

/**
 * LandId と フロア番号によってフロアを識別するもの。
 * 
 * 初期verでは少々扱いづらかったため全フロアに一意の静的なFloorId を振ることで対策したが、
 * 次のような問題が出てきたため、改めて用意した。
 * - REシステム管理下のすべてのマップは Land 内の Floor として扱った方が都合がよい。
 *   - 例えば固定マップで召喚の罠を踏んだ時の出現エネミーはどこのテーブルからとる？
 * - FloorId を静的なものにしてしまうと、動的な Land 生成に対応しづらくなる。
 * 
 * Land 内からの固定マップ遷移について
 * ----------
 * フロアを進んだり直接遷移するときの仕組みは、"Land定義マップの Y=0 へ Player を移動する" に統一する。
 * これによって、
 * - 階段を進んだ時の ProceedFloorForward プラグインコマンド
 * - プレイヤー初期位置指定による遷移
 * - ゲーム中の [場所移動] 空の遷移
 * すべて同じように遷移できる仕組みとする。
 * 
 * Player(というかフォーカスのある Entity) の移動処理は、LCamera.reserveFloorTransfer() にすべて流れてくるが、
 * ここで次にロードするマップを選択する。
 * 厳密には
 * - LFloorId.rmmzMapId() で、ロードするべきマップを取得 (ランダムマップならLand定義マップID, 固定マップならそのマップID)
 * - その後、RMMZIntegration 経由で $gamePlayer.reserveTransfer に流して、実際にマップ移動する。
 */
@RESerializable
export class LFloorId {
    /** LandId==DHelpers.RmmzNormalMapLandId は、floorNumber が RMMZ の MapId を直接示すことを表す。 */
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

    public static makeFromKeys(landKey: string, floorKey: string): LFloorId {
        const land = REData.lands.find(x => x.name == landKey);
        if (!land) throw new Error(`Land "${landKey}" not found.`);
        const floorNumber = land.floorInfos.findIndex(x => x && x.key == floorKey);
        if (floorNumber <= 0) throw new Error(`Floor "${floorKey}" not found.`);
        return new LFloorId(land.id, floorNumber);
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

    public static makeFromMapTransfarInfo(mapId: number, x: number) {
        let floorId: LFloorId;
        if (REDataManager.isLandMap(mapId)) {
            floorId = new LFloorId(REData.lands.findIndex(x => x.rmmzMapId == mapId), x);
        }
        else if (REDataManager.isRESystemMap(mapId)) {
            // 固定マップへの遷移
            floorId = LFloorId.makeByRmmzFixedMapId(mapId);
        }
        else {
            // 管理外マップへの遷移
            floorId = LFloorId.makeByRmmzNormalMapId(mapId);
        }
        return floorId;
    }

    public landData(): DLand {
        return REData.lands[this._landId];
    }

    public floorInfo(): DFloorInfo {
        assert(this.hasAny());
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

    public isRESystem(): boolean {
        return this._landId != DHelpers.RmmzNormalMapLandId;
    }

    public isRandomMap(): boolean {
        if (!this.isRESystem()) return false;
        return this.rmmzFixedMapId() <= 0;
    }

    public isFixedMap(): boolean {
        if (!this.isRESystem()) return false;
        return this.rmmzFixedMapId() > 0;
    }

    public isSafety(): boolean {
        if (this._landId == DHelpers.RmmzNormalMapLandId) return true; // RE 管理外のマップは常に Safety
        return this.floorInfo().safetyActions;
    }

    /** Entity を登場させるマップであるか。false の場合は通常の RMMZ マップ。Entity は登場せず、Event を非表示にすることもない。 */
    public isEntitySystemMap(): boolean {
        return this._landId != DHelpers.RmmzNormalMapLandId;
    }

    public isRMMZDefaultSystemMap(): boolean {
        if (this._landId != DHelpers.RmmzNormalMapLandId) return false;
        return REData.maps[this._floorNumber].defaultSystem;
    }
}

