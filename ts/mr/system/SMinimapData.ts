import { assert } from "ts/mr/Common";
import { FBlockComponent } from "ts/mr/floorgen/FMapData";
import { LBattlerBehavior } from "ts/mr/lively/behaviors/LBattlerBehavior";
import { LItemBehavior } from "ts/mr/lively/behaviors/LItemBehavior";
import { LTrapBehavior } from "ts/mr/lively/behaviors/LTrapBehavior";
import { LExitPointBehavior } from "ts/mr/lively/behaviors/LExitPointBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { Helpers } from "./Helpers";
import { SNavigationHelper } from "./SNavigationHelper";
import { SView } from "./SView";
import { DHelpers } from "../data/DHelper";
import { LEntity } from "../lively/LEntity";
import { LMinimapMarkerClass } from "../lively/LCommon";
import { SEditMapHelper } from "./utils/SEditMapHelper";


const ExitPointTileIdOffset = 14;

class SMiniMapAutoTileHelper extends SEditMapHelper {
    protected onIsValidPos(x: number, y: number): boolean { throw new Error("Unreachable"); }
    protected onGetTileId(x: number, y: number, z: number): number { throw new Error("Unreachable"); }
    protected onSetTileId(x: number, y: number, z: number, tileId: number): void { throw new Error("Unreachable"); }

    protected getSameKindTile(x: number, y: number, z: number, component: FBlockComponent): boolean {
        const block = MRLively.mapView.currentMap.tryGetBlock(x, y);
        if (!block) return true;        // マップ範囲外は同種とすることで、境界外にも広がっているように見せる
        if (!block._passed) return true; // 未踏なら壁Edgeなどは表示したくないので、同種扱いする
        if (block._blockComponent == component) return true;
        return false;
    }
}

export class SMinimapData {
    private _width: number = 0;
    private _height: number = 0;
    private _data: number[] = [];
    private _tilemapResetNeeded: boolean = true;
    private _refreshNeeded: boolean = true;
    private _autoTileHelper: SMiniMapAutoTileHelper = new SMiniMapAutoTileHelper();

    public clear(): void {
        this._width = 0;
        this._height = 0;
        this._tilemapResetNeeded = true;
    }

    public reset(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._data = new Array(this._width * this._height * 4);
        this._tilemapResetNeeded = true;
    }

    public width(): number {
        return this._width;
    }

    public height(): number {
        return this._height;
    }

    // Tilemap に登録する、 RMMZ と同じフォーマットのマップデータ
    public data(): number[] {
        return this._data;
    }

    public setData(x: number, y: number, z: number, value: number): void {
        assert(this.isValid(x, y, z));
        this._data[(z * this._height + y) * this._width + x] = value;
    }

    public getData(x: number, y: number, z: number): number {
        assert(this.isValid(x, y, z));
        return this._data[(z * this._height + y) * this._width + x];
    }

    public isValid(x: number, y: number, z: number): boolean {
        return (0 <= x && x < this._width) && (0 <= y && y < this._height) && (0 <= z && z < 4);
    }

    public isTilemapResetNeeded(): boolean {
        return this._tilemapResetNeeded;
    }

    public clearTilemapResetNeeded(): void {
        this._tilemapResetNeeded = false;
    }

    public setTilemapResetNeeded(): void {
        this._tilemapResetNeeded = true;
    }

    public setRefreshNeeded(): void {
        this._refreshNeeded = true;
    }

    //public isRefreshNeeded(): boolean {
    //    return this._tilemapResetNeeded;
    //}

    public playerMarkerTileId(): number {
        return DHelpers.TILE_ID_A5 + 9;
    }

    public itemMarkerTileId(): number {
        return DHelpers.TILE_ID_A5 + 10;
    }

    public enemyMarkerTileId(): number {
        return DHelpers.TILE_ID_A5 + 11;
    }

    public exitMarkerTileId(): number {
        return DHelpers.TILE_ID_A5 + ExitPointTileIdOffset;
    }

    // 地形表示の更新
    public refresh(): void {
        const map = MRLively.mapView.currentMap;
        const width = map.width();
        const height = map.height();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const block = map.block(x, y);


                switch (block._blockComponent) {
                    default:
                        const tileId = this._autoTileHelper.getAutotileShape(x, y, 0, FBlockComponent.None);

                        if (block._passed)
                            this.setData(x, y, 0, DHelpers.TILE_ID_A2 + tileId);
                        else
                            this.setData(x, y, 0, 0);
                        break;
                    case FBlockComponent.Room:
                    case FBlockComponent.Passageway:
                        if (block._passed)
                            this.setData(x, y, 0, DHelpers.TILE_ID_A5 + 1);
                        else
                            this.setData(x, y, 0, 0);
                        break;
                }
            }
        }
        this._refreshNeeded = false;
    }

    public update() {
        const map = MRLively.mapView.currentMap;
        const width = map.width();
        const height = map.height();
        const subject = MRLively.mapView.focusedEntity();
        assert(subject);

        if (width != this._width || height != this._height) {
            this.reset(width, height);
        }

        if (this._refreshNeeded) {
            this.refresh();
        }

        // Clear
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.setData(x, y, 1, 0);
            }
        }

        for (const entity of map.entities()) {
            const markerClass = entity.queryMinimapMarkerClass();
            if (markerClass != LMinimapMarkerClass.None) {
                switch (markerClass) {
                    case LMinimapMarkerClass.Item:
                        this.setData(entity.mx, entity.my, 1, this.itemMarkerTileId());
                        break;
                    default:
                        throw new Error("Not implemetend.");
                }
            }
            else {
                const tileId = this.getDefiniteMarkerTileId(subject, entity);
                if (tileId) {
                    this.setData(entity.mx, entity.my, 1, tileId);
                }
                else {
                }
            }
        }
    }

    private getDefiniteMarkerTileId(subject: LEntity, entity: LEntity): number {
        if (!SView.getMinimapVisibility(entity).visible) {
            // 何も表示しない
            return 0;
        }
        else if (entity.entityId().equals(subject.entityId())) {
            return this.playerMarkerTileId();
        }
        else {
            if (SNavigationHelper.testVisibilityForMinimap(subject, entity)) {
                if (entity.findEntityBehavior(LTrapBehavior)) {
                   return DHelpers.TILE_ID_A5 + 13;
                }
                else if (entity.findEntityBehavior(LBattlerBehavior)) {
                    if (Helpers.isHostile(subject, entity)) {
                        // 敵対勢力
                        return this.enemyMarkerTileId();
                    }
                    else {
                        // 中立 or 味方
                        return DHelpers.TILE_ID_A5 + 12;
                    }
                }
                else if (entity.findEntityBehavior(LItemBehavior)) {
                    return this.itemMarkerTileId();
                }
                else if (entity.findEntityBehavior(LExitPointBehavior)) {
                    return this.exitMarkerTileId();
                }
            }
        }
        return 0;
    }


}
