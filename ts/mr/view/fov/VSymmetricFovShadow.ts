import { MRData } from "ts/main";
import { DHelpers } from "ts/mr/data/DHelper";
import { DFovSystem } from "ts/mr/data/DSystem";
import { MRLively } from "ts/mr/lively/MRLively";
import { TilemapRendererId } from "ts/mr/rmmz/Tilemap";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SFovShadowMap } from "ts/mr/system/SFovShadowMap";
import { SEditMapHelper } from "ts/mr/system/utils/SEditMapHelper";
import { VSpriteSet } from "../VSpriteSet";


export class VSymmetricFovShadow {
    private _spriteSet: VSpriteSet;
    private _tilemapData: number[];
    private _fovAutoTileHelper: SFovAutoTileHelper;
    private _nullAutoTileId: number;
    private _autoTileKind: number;
    private _tilemap: Tilemap;

    public constructor(spriteSet: VSpriteSet) {
        this._spriteSet = spriteSet;

        const width = $dataMap.width ?? 1;
        const height = $dataMap.height ?? 1;
        this._tilemapData = new Array(width * height * 4);
        this._fovAutoTileHelper = new SFovAutoTileHelper(this._tilemapData);
        this._nullAutoTileId = Tilemap.TILE_ID_A5 + 1;
        this._autoTileKind = DHelpers.getAutotileKind(DHelpers.TILE_ID_A2) + 15; // 床タイル15番目 (0スタート)

        this._tilemap = new Tilemap();
        this._tilemap.setRendererId(TilemapRendererId.Shadow);
        this._tilemap._tileWidth = $gameMap.tileWidth();
        this._tilemap._tileHeight = $gameMap.tileHeight();
        this._tilemap.setData(width, height, this._tilemapData);
        this._spriteSet.spritesetMap.addChild(this._tilemap);

        const bitmaps = [];
        const tilesetNames = ["Outside_A1","Outside_A2","Outside_A3","Outside_A4","Outside_A5","","","",""];
        for (const name of tilesetNames) {
            bitmaps.push(ImageManager.loadTileset(name));
        }
        this._tilemap.setBitmaps(bitmaps);

        // test
        // this._fovAutoTileHelper.putAutoTile(0, 0, 0, this._autoTileKind);
        // this._fovAutoTileHelper.putAutoTile(14, 22, 0, this._autoTileKind);
    
        // this._tilemap.refresh();
    }
    
    public updateShadowTiles(): void {
        if (MRLively.mapView.currentFloorId.floorInfo.fovSystem != DFovSystem.SymmetricShadowcast) return;

        // デフォルトの Tilemap に同期する
        const defaultTilemap = this._spriteSet.spritesetMap._tilemap;
        this._tilemap.origin.x = defaultTilemap.origin.x;
        this._tilemap.origin.y = defaultTilemap.origin.y;

        const map = MRSystem.fovShadowMap;
        const w = map.width;
        const h = map.height;
        const z = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (map.isVisible(x, y)) {
                    this._fovAutoTileHelper.putAutoTile(x, y, z, this._nullAutoTileId);
                }
                else {
                    this._fovAutoTileHelper.putAutoTile(x, y, z, this._autoTileKind);
                }
            }
        }
        //this._tilemap.refresh();
    }
}

class SFovAutoTileHelper extends SEditMapHelper {
    public readonly tilemapData: number[];

    public constructor(tilemapData: number[]) {
        super();
        this.tilemapData = tilemapData;
    }

    private get map(): SFovShadowMap {
        return MRSystem.fovShadowMap;
    }
    
    protected onIsValidPos(x: number, y: number): boolean { 
        return this.map.isValid(x, y);
    }

    protected onGetTileId(x: number, y: number, z: number): number {
        return this.tilemapData[(z * this.map.height + y) * this.map.width + x];
    }

    protected onSetTileId(x: number, y: number, z: number, tileId: number): void {
        this.tilemapData[(z * this.map.height + y) * this.map.width + x] = tileId;
    }

    protected getSameKindTile(x: number, y: number, z: number, componentOrAutoTileKind: number): boolean {
        if (!this.map.isValid(x, y)) return true;        // マップ範囲外は同種とすることで、境界外にも広がっているように見せる
        const tileId = this.onGetTileId(x, y, z);
        if (Tilemap.isAutotile(tileId) && Tilemap.getAutotileKind(tileId) == componentOrAutoTileKind) {
            return true;
        }
        else {
            return false;
        }
    }
}

