import { FBlockComponent } from "ts/mr/floorgen/FMapData";


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

export abstract class SEditMapHelper {
    public isValidPos(x: number, y: number): boolean {
        return this.onIsValidPos(x, y);
    }

    public setTileId(x: number, y: number, z: number, tileId: number): void {
        this.onSetTileId(x, y, z, tileId);
    }

    public putAutoTile(x: number, y: number, z: number, autoTileKind: number): void {
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

    private tileId(x: number, y: number, z: number): number {
        return this.onGetTileId(x, y, z);
    }

    private refreshAutoTile(x: number, y: number, z: number, autoTileKind: number): void {
        if (Tilemap.getAutotileKind(this.tileId(x, y, z)) == autoTileKind) {
            const tileId = Tilemap.makeAutotileId(autoTileKind, this.getAutotileShape(x, y, z, autoTileKind));
            this.setTileId(x, y, z, tileId);
        }
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

    public getAutotileShape(x: number, y: number, z: number, component: FBlockComponent): number {
        let subtiles: number[] = [0, 0, 0, 0];
        {
            const checkOffsets: Point[] = [ { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 } ];

            // 左上、右上、左下、右下、の順で SubtileID (1~5) を決定する
            for (let i = 0; i < 4; i++) {
                const ox = checkOffsets[i].x;
                const oy = checkOffsets[i].y;
                const diag = this.getSameKindTile(x + ox, y + oy, z, component);   // 対角
                const hori = this.getSameKindTile(x + ox, y, z, component);        // 横
                const vert = this.getSameKindTile(x, y + oy, z, component);        // 縦
                if (diag && vert && hori) subtiles[i] = 1;             // 1: すべて同種タイル
                else if (!diag && vert && hori) subtiles[i] = 2;       // 2: 縦と横が同種タイル (対角のみ異種タイル)
                else if (!vert && hori) subtiles[i] = 3;               // 3: 縦のみ異種タイル (横のみ同種タイル・対角は不問)
                else if (vert && !hori) subtiles[i] = 4;               // 4: 横のみ異種タイル (縦のみ同種タイル・対角は不問)
                else subtiles[i] = 5;                                  // 5: 縦と横が異種タイル (対角は不問)
            }
        }

		// subtiles が一致するものを線形で検索
        const id = this.onGetAutotileTable(component).findIndex(x => {
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

    protected abstract onIsValidPos(x: number, y: number): boolean;

    protected abstract onGetTileId(x: number, y: number, z: number): number;
    
    protected abstract onSetTileId(x: number, y: number, z: number, tileId: number): void;

    // (x, y) のタイルが、component と同種かどうか
    protected abstract getSameKindTile(x: number, y: number, z: number, componentOrAutoTileKind: FBlockComponent): boolean;

    protected onGetAutotileTable(componentOrAutoTileKind: number): number[][] {
        return SEditMapHelper._subtileToAutoTileTable;
    }
}
