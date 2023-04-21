import { FBlockComponent } from "ts/mr/floorgen/FMapData";
import { MRLively } from "ts/mr/lively/MRLively";
import { SView } from "ts/mr/system/SView";
import { MRView } from "ts/mr/view/MRView";

export enum TilemapRendererId {
    Default = 0,
    Minimap = 2,
    Shadow = 3,
}

const show = false;
const showAutotileShapeId = false;
const startTileId = 768;


// 壁と隣接している床オートタイル用のテーブル
const FLOOR_AUTOTILE_TABLE2: number[][][] = [
    [[2, 4], [1, 4], [2, 3], [1, 3]],   // [0]
    [[2, 0], [1, 4], [2, 3], [1, 3]],
    [[2, 4], [3, 0], [2, 3], [1, 3]],
    [[2, 0], [3, 0], [2, 3], [1, 3]],
    [[2, 4], [1, 4], [2, 3], [3, 1]],
    [[2, 0], [1, 4], [2, 3], [3, 1]],
    [[2, 4], [3, 0], [2, 3], [3, 1]],
    [[2, 0], [3, 0], [2, 3], [3, 1]],
    [[2, 4], [1, 4], [2, 1], [1, 3]],   // [8]
    [[2, 0], [1, 4], [2, 1], [1, 3]],
    [[2, 4], [3, 0], [2, 1], [1, 3]],
    [[2, 0], [3, 0], [2, 1], [1, 3]],
    [[2, 4], [1, 4], [2, 1], [3, 1]],
    [[2, 0], [1, 4], [2, 1], [3, 1]],
    [[2, 4], [3, 0], [2, 1], [3, 1]],
    [[2, 0], [3, 0], [2, 1], [3, 1]],
    [[1/*0*/, 4], [1, 4], [0, 3], [1, 3]],   // [16]
    [[0, 4], [3, 0], [0, 3], [1, 3]],
    [[0, 4], [1, 4], [0, 3], [3, 1]],
    [[0, 4], [3, 0], [0, 3], [3, 1]],
    [[2, 2], [1, 2], [2, 3], [1, 3]],
    [[2, 2], [1, 2], [2, 3], [3, 1]],
    [[2, 2], [1, 2], [2, 1], [1, 3]],
    [[2, 2], [1, 2], [2, 1], [3, 1]],
    [[2, 4], [3, 4], [2, 3], [3, 3]],   // [24]
    [[2, 4], [3, 4], [2, 1], [3, 3]],
    [[2, 0], [3, 4], [2, 3], [3, 3]],
    [[2, 0], [3, 4], [2, 1], [3, 3]],
    [[2, 4], [1, 4], [2, 4/*5*/], [1, 4/*5*/]],   //28
    [[2, 0], [1, 4], [2, 5], [1, 5]],
    [[2, 4], [3, 0], [2, 5], [1, 5]],
    [[2, 0], [3, 0], [2, 5], [1, 5]],
    [[0, 4], [3, 4], [0, 3], [3, 3]],
    [[2, 2], [1, 2], [2, 5], [1, 5]],
    [[0, 2], [1, 2], [0, 3], [1, 3]],
    [[0, 2], [1, 2], [0, 3], [3, 1]],
    [[2, 2], [2, 2], [2, 3], [3, 3]],   //36
    [[2, 2], [3, 2], [2, 1], [3, 3]],
    [[2, 4], [3, 4], [2, 5], [3, 5]],
    [[2, 0], [3, 4], [2, 5], [3, 5]],
    [[0, 4], [1, 4], [0, 4], [1, 4]],   //40
    [[0, 4], [3, 0], [0, 5], [1, 5]],
    [[0, 2], [3, 2], [0, 3], [3, 3]],
    [[0, 2], [1, 2], [0, 5], [1, 5]],
    [[0, 4], [3, 4], [0, 5], [3, 5]],
    [[2, 2], [3, 2], [2, 5], [3, 5]],
    [[0, 2], [3, 2], [0, 5], [3, 5]],
    [[0, 0], [1, 0], [0, 1], [1, 1]]
];

// 床と隣接している壁オートタイル用のテーブル
const WALL_AUTOTILE_TABLE2: number[][][] = [
    [[2, 2], [1, 2], [2, 1], [1, 1]],
    [[0, 2], [1, 2], [0, 1], [1, 1]],
    [[2, 0], [1, 0], [2, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[2, 2], [3, 2], [2, 1], [3, 1]],
    [[0, 2], [3, 2], [0, 1], [3, 1]],
    [[2, 0], [3, 0], [2, 1], [3, 1]],
    [[0, 0], [3, 0], [0, 1], [3, 1]],
    [[2, 2], [1, 2], [2, 3], [1, 3]],
    [[0, 2], [1, 2], [0, 3], [1, 3]],
    [[2, 0], [1, 0], [2, 3], [1, 3]],
    [[1, 0], [1, 0], [0, 3], [1, 3]],   //11
    [[2, 2], [3, 2], [2, 3], [3, 3]],
    [[0, 2], [3, 2], [0, 3], [3, 3]],
    [[2, 0], [3, 0], [2, 3], [3, 3]],
    [[0, 0], [3, 0], [0, 3], [3, 3]]
];


function isTileA4Floor(tileId: number): boolean {
    const kind = Tilemap.getAutotileKind(tileId);
    if (80 <= kind && kind <= 87) return true;
    if (96 <= kind && kind <= 103) return true;
    if (112 <= kind && kind <= 119) return true;
    return false;
}

function isTileA4Wall(tileId: number): boolean {
    const kind = Tilemap.getAutotileKind(tileId);
    if (88 <= kind && kind <= 95) return true;
    if (104 <= kind && kind <= 111) return true;
    if (120 <= kind && kind <= 127) return true;
    return false;
}


const _Tilemap__addSpot = Tilemap.prototype._addSpot;
Tilemap.prototype._addSpot = function(startX, startY, x, y) {


    _Tilemap__addSpot.call(this, startX, startY, x, y);
    

    const mx = startX + x;
    const my = startY + y;
    const dx = x * this.tileWidth;
    const dy = y * this.tileHeight;
    const tileId5 = this._readMapData(mx, my, 5);   // region

    
    const tileId0 = this._readMapData(mx, my, 0);
    const tileId1 = this._readMapData(mx, my, 1);
    const tileId2 = this._readMapData(mx, my, 2);
    const tileId3 = this._readMapData(mx, my, 3);
    const tileId4 = this._readMapData(mx, my, 4);

    //if (REGame.map.isValid()) {
    if (show) {
        const block = MRLively.mapView.currentMap.block(mx, my);
        if (block._roomId > 0) {
            this._addTile(this._upperLayer, startTileId + block._roomId, dx, dy);
        }
        else if (block._blockComponent == FBlockComponent.Passageway) {
            this._addTile(this._upperLayer, startTileId + 8, dx, dy);
        }
    }

    if (showAutotileShapeId) {
        const shape = Tilemap.getAutotileShape(tileId0);
        this._addTile(this._upperLayer, startTileId + shape, dx, dy);
    }

    // ガイドグリッドの描画
    if (this._lowerLayer._rendererId != 2) {
        if (MRView.guideGrid && MRView.guideGrid.isVisible()) {
            const tile = MRView.guideGrid.readMapData(mx, my);
            this._addTile(this._lowerLayer, tile, dx, dy);
        }
    }

        /*
    if (tileId5 == 8) {
        console.log("m", mx, my);
        console.log("tileId5", tileId5);
        console.log("tileId0", tileId0);
        console.log("tileId1", tileId1);
        console.log("tileId2", tileId2);
        console.log("tileId3", tileId3);
        console.log("tileId4", tileId4);
        throw new Error();
        this._addTile(this._upperLayer, startTileId + 1, dx, dy);
    }

    if (tileId5 == 1) {
        console.log("m", mx, my);
        console.log("tileId5", tileId5);
        console.log("tileId0", tileId0);
        console.log("tileId1", tileId1);
        console.log("tileId2", tileId2);
        console.log("tileId3", tileId3);
        console.log("tileId4", tileId4);
        throw new Error();
        this._addTile(this._upperLayer, startTileId + 10, dx, dy);
    }
    */
}

const _Tilemap__addAutotile = Tilemap.prototype._addAutotile;
Tilemap.prototype._addAutotile = function(layer, tileId, dx, dy) {
    const kind = Tilemap.getAutotileKind(tileId);

    if (MRLively.mapView.currentMap.floorId().isTacticsMap2&& Tilemap.isTileA4(tileId)) {
        const x = dx / this.tileWidth;
        const y = dy / this.tileHeight;
    
        const ox = Math.ceil(this.origin.x);
        const oy = Math.ceil(this.origin.y);
        const startX = Math.floor((ox - this._margin) / this.tileWidth);
        const startY = Math.floor((oy - this._margin) / this.tileHeight);
        
        const mx = startX + x;
        const my = startY + y;


        
        const shape = Tilemap.getAutotileShape(tileId);
        const tx = kind % 8;
        const ty = Math.floor(kind / 8);
        const w1 = this.tileWidth / 2;
        const h1 = this.tileHeight / 2;
        let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;

        
        // kind の予約枠は次の通り。
        // - A1 は 0~15 (最大16個)
        // - A2 は 16~47 (最大32個)
        // - A3 は 48~80 (最大32個)
        // - A4 は 80~127 (最大48個)
        //
        // tx,ty は、これらが横8個の論理的なグリッドに並んでいると考えた時のセル番号。
        //
        // A4 では、上面と側面は別の AutoTile kind で表現されている。
        // A4 画像には横8個、縦6個の計 48 個の AutoTile が存在することになる。
        


        const setNumber = 3;
        const bx = tx * 2;
        const by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
        const syOffsets = [0, 0, 0, 0];
        if (ty % 2 === 1) {
            // 壁
            autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
            syOffsets[0] = -h1;
            syOffsets[1] = -h1;

            if (shape == 11) {
                if (mx > 0) {
                    const tileId2 = this._readMapData(mx - 1, my, 0);
                    if (isTileA4Floor(tileId2)) {
                        autotileTable = WALL_AUTOTILE_TABLE2;
                    }
                }
            }

        }
        else {
            // 上面

            if (shape == 16) {
                if (mx > 0) {
                    const tileId2 = this._readMapData(mx - 1, my, 0);
                    if (isTileA4Wall(tileId2)) {
                        autotileTable = FLOOR_AUTOTILE_TABLE2;
                    }
                }
            }
            else if (shape == 36) {
                if (mx < this.width - 1) {
                    const tileId2 = this._readMapData(mx + 1, my, 0);
                    if (isTileA4Wall(tileId2)) {
                        autotileTable = FLOOR_AUTOTILE_TABLE2;
                    }
                }
            }
            else if (shape == 28 || shape == 40) {
                if (my < this.height - 1) {
                    const tileId2 = this._readMapData(mx, my + 1, 0);
                    if (isTileA4Wall(tileId2)) {
                        autotileTable = FLOOR_AUTOTILE_TABLE2;
                    }
                }

            }

        }


        
        const table = autotileTable[shape];
        for (let i = 0; i < 4; i++) {
            const qsx = table[i][0];
            const qsy = table[i][1];
            const sx1 = (bx * 2 + qsx) * w1;
            const sy1 = (by * 2 + qsy) * h1;
            const dx1 = dx + (i % 2) * w1;
            const dy1 = dy + Math.floor(i / 2) * h1;
            layer.addRect(setNumber, sx1, sy1 + syOffsets[i], dx1, dy1, w1, h1);
        }
    }
    else {
        _Tilemap__addAutotile.call(this, layer, tileId, dx, dy);
    }
}


//--------------------------------------------------------------------------------
// 複数 Tilemap 対策

declare global {
    interface Tilemap {
        setRendererId(id: number): void;
        _lowerLayer: Tilemap.Layer;
        selfVisible: boolean;
    }

    namespace Tilemap {
        interface Layer {
            _rendererId: TilemapRendererId;
            _images: Bitmap[];
        }
    }
}

// RMMZ は複数の Tilemap を描画すると、Tileset を共有してしまう。
// 通常のマップとは別に、ミニマップ描画用の Tilemap.Renderer を使うことで回避する。
PIXI.Renderer.registerPlugin("rpgtilemap2", Tilemap.Renderer as any);
PIXI.Renderer.registerPlugin("rpgtilemap3", Tilemap.Renderer as any);

function getTilemapRenderer(renderer: any, id: TilemapRendererId): any {
    switch (id) {
        case TilemapRendererId.Minimap:
            //return undefined;
            return renderer.plugins.rpgtilemap2;
        case TilemapRendererId.Shadow:
            return undefined;
            return renderer.plugins.rpgtilemap3;
        default:
            return renderer.plugins.rpgtilemap;
    }
}

const _Tilemap_initialize = Tilemap.prototype.initialize;
Tilemap.prototype.initialize = function() {
    _Tilemap_initialize.apply(this);
    this.selfVisible = true;
}

Tilemap.prototype.setRendererId = function(id) {
    this._lowerLayer._rendererId = id;
};


Tilemap.Layer.prototype.render = function(renderer: any) {
    const gl = renderer.gl;
    const tilemapRenderer = getTilemapRenderer(renderer, this._rendererId);
    if (!tilemapRenderer) return;

    const shader = tilemapRenderer.getShader();
    const matrix = shader.uniforms.uProjectionMatrix;

    // "めつぶし" 状態の対応。
    // Tilemap.visible は子 Sprite すべてを非表示にするためキャラクターが消えてしまう。
    // そのため Tilemap だけを表示しないように、ここで対策する。
    if (this.parent instanceof Tilemap && !this.parent.selfVisible) {
        return false;
    }

    //--------------------
    // 以下、 Tilemap.Layer.prototype.render  のコピー
    
    renderer.batch.setObjectRenderer(tilemapRenderer);
    renderer.projection.projectionMatrix.copyTo(matrix);
    matrix.append(this.worldTransform);
    renderer.shader.bind(shader);

    if (this._needsTexturesUpdate) {
        tilemapRenderer.updateTextures(renderer, this._images);
        this._needsTexturesUpdate = false;
    }
    tilemapRenderer.bindTextures(renderer);
    renderer.geometry.bind(this._vao, shader);
    this._updateIndexBuffer();
    if (this._needsVertexUpdate) {
        this._updateVertexBuffer();
        this._needsVertexUpdate = false;
    }
    renderer.geometry.updateBuffers();

    const numElements = this._elements.length;
    if (numElements > 0) {
        renderer.state.set(this._state);
        renderer.geometry.draw(gl.TRIANGLES, numElements * 6, 0);
    }
}

