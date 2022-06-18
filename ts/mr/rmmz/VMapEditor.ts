
import { assert } from "ts/mr/Common";
import { DHelpers } from "ts/mr/data/DHelper";
import { MRData } from "ts/mr/data/MRData";
import { FBlockComponent, FMap } from "ts/mr/floorgen/FMapData";
import { LMap } from "ts/mr/objects/LMap";
import { SMinimapData } from "ts/mr/system/SMinimapData";
import { LBlock, LBlockSystemDecoration, LTileShape } from "ts/mr/objects/LBlock";
import { DTemplateMap, DBlockVisualPartTileType, DBlockVisualPart } from "ts/mr/data/DTemplateMap";


interface Point {
    x: number;
    y: number;
}

enum SubTile {
    UL,
    UR,
    LL,
    LR,
}

/**
 * RE Core 側で生成されたマップ (ランダムマップ) を、RMMZ 側のマップデータに反映する。
 */
export class VMapEditor {
    private _coreMap: LMap;
    private _templateMap: DTemplateMap;

    public constructor(coreMap: LMap) {
        this._coreMap = coreMap;
        const floorData = coreMap.floorData();
        const templateMap = floorData.template ? MRData.templateMaps.find(x => x.name == floorData.template) : MRData.templateMaps[1];
        assert(templateMap);
        this._templateMap = templateMap;
    }

    public build(): void {
        $dataMap.tilesetId = this._templateMap.tilesetId;
        $dataMap.width = this._coreMap.width();
        $dataMap.height = this._coreMap.height();
        $dataMap.data = new Array<number>($dataMap.width * $dataMap.height * 5);
        $gameMap.changeTileset($dataMap.tilesetId);

        if (this._coreMap.floorId().isFixedMap()) {

        }
        else {
            for (let y = 0; y < $dataMap.height; y++) {
                for (let x = 0; x < $dataMap.width; x++) {
                    const block = this._coreMap.block(x, y);
                    this.refreshBlock(block);
                }
            }
        }
    }

    public refreshBlock(block: LBlock): void {
        const x = block.mx;
        const y = block.my;

        // Shape
        {
            const partIndex = block.shapeVisualPartIndex;
            if (partIndex > 0) {
                const part = this._templateMap.parts[partIndex];
                this.putPart(x, y, 0, part);
            }
            // TODO: 古い方式
            else {
                switch (block.tileShape()) {
                    case LTileShape.Floor:
                        if (block.systemDecoration() == LBlockSystemDecoration.ItemShop) {
                            // お店の床装飾
                            this.putAutoTile(x, y, 0, this._templateMap.itemShopFloorAutoTileKind);
                        }
                        else {
                            this.putAutoTile(x, y, 0, this._templateMap.floorAutoTileKind);
                        }
                        break;
                    case LTileShape.Wall:
                        this.putAutoTile(x, y, 0, this._templateMap.floorAutoTileKind);
                        if (this.isValidPos(x, y + 1) && this._coreMap.block(x, y + 1)._blockComponent != FBlockComponent.None) {
                            this.putAutoTile(x, y, 1, this._templateMap.wallEdgeAutoTileKind);
                        }
                        else {
                            this.putAutoTile(x, y, 1, this._templateMap.wallHeadAutoTileKind);
                        }
                        break;
                    default:
                        throw new Error("Not implemented.");
                }
            }
        }

        // Decoration
        {
            const partIndex = block.decorationVisualPartIndex;
            if (partIndex > 0) {
                const part = this._templateMap.parts[partIndex];
                this.putPart(x, y, 2, part);
            }
        }
    }

    private putPart(x: number, y: number, z: number, part: DBlockVisualPart): void {
        assert(part);
        switch (part.tileType) {
            case DBlockVisualPartTileType.Normal:
                for (let i = 0 ; i < part.height; i++) {
                    const cy = y - i;
                    if (this.isValidPos(x, cy)) {
                        this.setTileId(x, y, z, part.tiles[i]);
                    }
                }
                break;
            case DBlockVisualPartTileType.Autotile:
                this.putAutoTile(x, y, z, part.tiles[0]);
                break;
            default:
                throw new Error("Unreachable.");
        }
    }

    private width(): number {
        return $dataMap.width;
    }

    private height(): number {
        return $dataMap.width;
    }

    private isValidPos(x: number, y: number): boolean {
        return (0 <= x && x < this.width() && 0 <= y && y < this.height());
    }

    private tileId(x: number, y: number, z: number): number {
        const width = $dataMap.width;
        const height = $dataMap.height;
        return $dataMap.data[(z * height + y) * width + x] || 0;
    }

    private setTileId(x: number, y: number, z: number, tileId: number): void {
        const width = $dataMap.width;
        const height = $dataMap.height;
        $dataMap.data[(z * height + y) * width + x] = tileId;
    }

    private putAutoTile(x: number, y: number, z: number, autoTileKind: number): void {
        const tileId = Tilemap.makeAutotileId(autoTileKind, this.getAutotileShape(x, y, z, autoTileKind));
        this.setTileId(x, y, z, tileId);

        if (this.isValidPos(x - 1, y - 1)) this.refreshAutoTile(x - 1, y - 1, z, autoTileKind);
        if (this.isValidPos(x, y - 1)) this.refreshAutoTile(x, y - 1, z, autoTileKind);
        if (this.isValidPos(x + 1, y - 1)) this.refreshAutoTile(x + 1, y - 1, z, autoTileKind);
        if (this.isValidPos(x - 1, y)) this.refreshAutoTile(x - 1, y, z, autoTileKind);
        if (this.isValidPos(x + 1, y)) this.refreshAutoTile(x + 1, y, z, autoTileKind);
        if (this.isValidPos(x - 1, y + 1)) this.refreshAutoTile(x - 1, y + 1, z, autoTileKind);
        if (this.isValidPos(x, y + 1)) this.refreshAutoTile(x, y + 1, z, autoTileKind);
        if (this.isValidPos(x + 1, y + 1)) this.refreshAutoTile(x + 1, y + 1, z, autoTileKind);
    }

    private refreshAutoTile(x: number, y: number, z: number, autoTileKind: number): void {
        if (Tilemap.getAutotileKind(this.tileId(x, y, z)) == autoTileKind) {
            const tileId = Tilemap.makeAutotileId(autoTileKind, this.getAutotileShape(x, y, z, autoTileKind));
            this.setTileId(x, y, z, tileId);
        }
    }
    
    private getAutotileShape(x: number, y: number, z: number, autoTileKind: number): number {
        let subtiles: number[] = [0, 0, 0, 0];
        {
            const checkOffsets: Point[] = [ { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 } ];

            // 左上、右上、左下、右下、の順で SubtileID (1~5) を決定する
            for (let i = 0; i < 4; i++) {
                const ox = checkOffsets[i].x;
                const oy = checkOffsets[i].y;
                const diag = this.getSameKindTile(x + ox, y + oy, z, autoTileKind);   // 対角
                const hori = this.getSameKindTile(x + ox, y, z, autoTileKind);        // 横
                const vert = this.getSameKindTile(x, y + oy, z, autoTileKind);        // 縦
                if (diag && vert && hori) subtiles[i] = 1;             // 1: すべて同種タイル
                else if (!diag && vert && hori) subtiles[i] = 2;       // 2: 縦と横が同種タイル (対角のみ異種タイル)
                else if (!vert && hori) subtiles[i] = 3;               // 3: 縦のみ異種タイル (横のみ同種タイル・対角は不問)
                else if (vert && !hori) subtiles[i] = 4;               // 4: 横のみ異種タイル (縦のみ同種タイル・対角は不問)
                else subtiles[i] = 5;                                  // 5: 縦と横が異種タイル (対角は不問)
            }
        }

		// subtiles が一致するものを線形で検索
        const table = (DHelpers.isWallSideAutoTile(autoTileKind)) ? SMinimapData._subtileToAutoTileTable_Wall : SMinimapData._subtileToAutoTileTable;
        const id = table.findIndex(x => {
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
    
    // 同種タイルかどうか
    private getSameKindTile(x: number, y: number, z: number,autoTileKind: number): boolean {
        const tileId = this.tileId(x, y, z);
        if (Tilemap.isAutotile(tileId) && Tilemap.getAutotileKind(tileId) == autoTileKind) {
            return true;
        }
        else {
            return false;
        }
    }
}

