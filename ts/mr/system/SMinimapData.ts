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

enum SubTile {
    UL,
    UR,
    LL,
    LR,
}

interface Point {
    x: number;
    y: number;
}

const ExitPointTileIdOffset = 14;

export class SMinimapData {
    private _width: number = 0;
    private _height: number = 0;
    private _data: number[] = [];
    private _tilemapResetNeeded: boolean = true;
    private _refreshNeeded: boolean = true;

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
        const map = MRLively.map;
        const width = map.width();
        const height = map.height();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const block = map.block(x, y);


                switch (block._blockComponent) {
                    default:
                        const tileId = this.getAutotileShape(x, y, FBlockComponent.None);

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
        const map = MRLively.map;
        const width = map.width();
        const height = map.height();
        const subject = MRLively.camera.focusedEntity();
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


    // 1: すべて同種タイル
    // 2: 対角のみ異種タイル (縦と横が同種タイル)
    // 3: 縦のみ異種タイル (横のみ同種タイル・対角は不問)
    // 4: 横のみ異種タイル (縦のみ同種タイル・対角は不問)
    // 5: 縦と横が異種タイル (非隣接タイル・対角は不問)
    // これらを↓に沿って配置したもの
    // https://www.f-sp.com/category/RPG%E3%83%84%E3%82%AF%E3%83%BC%E3%83%AB?page=1480575168
    public static _subtileToAutoTileTable: number[][] = [
        [1,1,1,1],[2,1,1,1],[1,2,1,1],[2,2,1,1], [1,1,1,2],[2,1,1,2],[1,2,1,2],[2,2,1,2],
        [1,1,2,1],[2,1,2,1],[1,2,2,1],[2,2,2,1], [1,1,2,2],[2,1,2,2],[1,2,2,2],[2,2,2,2],
        [4,1,4,1],[4,2,4,1],[4,1,4,2],[4,2,4,2], [3,3,1,1],[3,3,1,2],[3,3,2,1],[3,3,2,2],

        [1,4,1,4],[1,4,2,4],[2,4,1,4],[2,4,2,4], [1,1,3,3],[2,1,3,3],[1,2,3,3],[2,2,3,3],
        [4,4,4,4],[3,3,3,3],[5,3,4,1],[5,3,4,2], [3,5,1,4],[3,5,2,4],[1,4,3,5],[2,4,3,5],
        [4,1,5,3],[4,2,5,3],[5,5,4,4],[5,3,5,3], [4,4,5,5],[3,5,3,5],[5,5,5,5],[5,5,5,5],
    ];
    
    public static _subtileToAutoTileTable_Wall: number[][] = [
        [1,1,1,1],[4,1,4,1],[3,3,1,1],[5,2,4,1],
        [1,4,1,4],[4,4,4,4],[3,5,1,4],[5,5,4,4],
        [1,1,3,3],[4,1,5,4],[3,3,3,3],[5,3,5,3],
        [1,4,3,5],[4,4,5,5],[3,5,3,5],[5,5,5,5],
    ];

    private getAutotileShape(x: number, y: number, component: FBlockComponent): number {
        let subtiles: number[] = [0, 0, 0, 0];
        {
            const checkOffsets: Point[] = [ { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 } ];

            // 左上、右上、左下、右下、の順で SubtileID (1~5) を決定する
            for (let i = 0; i < 4; i++) {
                const ox = checkOffsets[i].x;
                const oy = checkOffsets[i].y;
                const diag = this.getSameKindTile(x + ox, y + oy, component);   // 対角
                const hori = this.getSameKindTile(x + ox, y, component);        // 横
                const vert = this.getSameKindTile(x, y + oy, component);        // 縦
                if (diag && vert && hori) subtiles[i] = 1;             // 1: すべて同種タイル
                else if (!diag && vert && hori) subtiles[i] = 2;       // 2: 縦と横が同種タイル (対角のみ異種タイル)
                else if (!vert && hori) subtiles[i] = 3;               // 3: 縦のみ異種タイル (横のみ同種タイル・対角は不問)
                else if (vert && !hori) subtiles[i] = 4;               // 4: 横のみ異種タイル (縦のみ同種タイル・対角は不問)
                else subtiles[i] = 5;                                  // 5: 縦と横が異種タイル (対角は不問)
            }
        }

		// subtiles が一致するものを線形で検索
        const id = SMinimapData._subtileToAutoTileTable.findIndex(x => {
            return x[SubTile.UL] == subtiles[SubTile.UL] &&
                x[SubTile.UR] == subtiles[SubTile.UR] &&
                x[SubTile.LL] == subtiles[SubTile.LL] &&
                x[SubTile.LR] == subtiles[SubTile.LR];
        });
        if (id >= 0)
            return id;
        else
            return 0;
    }


    /*
    private getAutoTileDirBits(x: number, y: number, component: FBlockComponent): number {
        const map = REGame.map;
        let result = 0;
        result |= (this.getSameKindTile(x - 1, y + 1, component)) ? 0b000000000 : 0b000000001;
        result |= (this.getSameKindTile(x + 0, y + 1, component)) ? 0b000000000 : 0b000000010;
        result |= (this.getSameKindTile(x + 1, y + 1, component)) ? 0b000000000 : 0b000000100;
        result |= (this.getSameKindTile(x - 1, y + 0, component)) ? 0b000000000 : 0b000001000;
        result |= (this.getSameKindTile(x + 0, y + 0, component)) ? 0b000000000 : 0b000010000;
        result |= (this.getSameKindTile(x + 1, y + 0, component)) ? 0b000000000 : 0b000100000;
        result |= (this.getSameKindTile(x - 1, y - 1, component)) ? 0b000000000 : 0b001000000;
        result |= (this.getSameKindTile(x + 0, y - 1, component)) ? 0b000000000 : 0b010000000;
        result |= (this.getSameKindTile(x + 1, y - 1, component)) ? 0b000000000 : 0b100000000;
        return result;
    }
    */

    // (x, y) のタイルが、component と同種かどうか
    private getSameKindTile(x: number, y: number, component: FBlockComponent): boolean {
        const block = MRLively.map.tryGetBlock(x, y);
        if (!block) return true;        // マップ範囲外は同種とすることで、境界外にも広がっているように見せる
        if (!block._passed) return true; // 未踏なら壁Edgeなどは表示したくないので、同種扱いする
        if (block._blockComponent == component) return true;
        return false;
    }
    

}
