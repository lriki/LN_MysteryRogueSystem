
import { assert } from "ts/Common";
import { DHelpers } from "ts/data/DHelper";
import { DPrefabKind } from "ts/data/DPrefab";
import { REData } from "ts/data/REData";
import { FBlockComponent, FMap } from "ts/floorgen/FMapData";
import { REGame } from "ts/objects/REGame";
import { LMap } from "ts/objects/LMap";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SMinimapData } from "ts/system/SMinimapData";


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
export class GameMapBuilder {


    public build(coreMap: LMap, initialMap: FMap): void {
        const templateMap = REData.templateMaps[1];

        $dataMap.tilesetId = templateMap.tilesetId;
        $dataMap.width = coreMap.width();
        $dataMap.height = coreMap.height();
        $dataMap.data = new Array<number>($dataMap.width * $dataMap.height * 5);
        $gameMap.changeTileset($dataMap.tilesetId);
        
        for (let y = 0; y < $dataMap.height; y++) {
            for (let x = 0; x < $dataMap.width; x++) {
                const block = coreMap.block(x, y);
                
                switch (block._blockComponent) {
                    case FBlockComponent.None:
                        if (this.isValidPos(x, y + 1) && coreMap.block(x, y + 1)._blockComponent != FBlockComponent.None) {
                            this.putAutoTile(x, y, 0, templateMap.wallEdgeAutoTileKind);
                        }
                        else {
                            this.putAutoTile(x, y, 0, templateMap.wallHeadAutoTileKind);
                        }
                        break;
                    case FBlockComponent.Room:
                        this.putAutoTile(x, y, 0, templateMap.floorAutoTileKind);
                        break;
                    case FBlockComponent.Passageway:
                        this.putAutoTile(x, y, 0, templateMap.floorAutoTileKind);
                        break;
                }
            }
        }

        const exitPoint = initialMap.exitPont();
        if (exitPoint) {
            const appearanceTable = REData.lands[coreMap.floorId().landId()].appearanceTable;
            const prefab = appearanceTable.others[coreMap.floorId().floorNumber()].find(e => {
                const p = REData.prefabs[e.entity.prefabId];
                return p.kind == DPrefabKind.System && p.rmmzDataKey == "RE-SystemPrefab:ExitPoint";
            });
            assert(prefab);


            const entity = SEntityFactory.newExitPoint();
            entity.prefabKey = prefab.prefabName;
            
            console.log("exitPoint prefab", prefab);
            console.log("exitPoint floorId", coreMap.floorId());
            REGame.world._transferEntity(entity, coreMap.floorId(), exitPoint.mx(), exitPoint.my());
            
            console.log("_transferEntity e");
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

