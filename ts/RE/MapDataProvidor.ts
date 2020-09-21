import { assert } from "../Common";
import { REGame } from "./REGame";
import { REGame_Block } from "./REGame_Block";

/**
 * Data_Map をラップして、RE モジュールへ Data_Map への書き込み手段を提供する。
 * 
 * RE モジュールからは、壁を壊した時など Block(Tile) 情報が変わった時に、
 * このクラスを通して Data_Map.data への書き込みが行われる。
 * 
 * 単なる書き込みの他、ランダムダンジョンでは Block 種別から壁や床のタイル ID を求めたうえで
 * Data_Map.data への書き込んだり、オートタイルの解決などを行う。
 */
export class MapDataProvidor
{
    static tileId(x: number, y: number, z: number): number {
        const width = $dataMap.width ?? 0;
        const height = $dataMap.width ?? 0;
        assert(0 <= x && x < width && 0 <= y && y < height);

        const data = $dataMap.data;
        if (data) {
            return data[(z * height + y) * width + x];
        }
        else {
            return 0;
        }
    }
    
    static tileIds(x: number, y: number): number[] {
        const list = new Array(REGame.TILE_LAYER_COUNT);
        for (let i = 0; i < REGame.TILE_LAYER_COUNT; i++) {
            list[i] = this.tileId(x, y, i);
        }
        return list;
    }

    static setTileId(x: number, y: number, z: number, tileId: number): void {
        const width = $dataMap.width ?? 0;
        const height = $dataMap.width ?? 0;
        assert(0 <= x && x < width && 0 <= y && y < height);

        const data = $dataMap.data;
        if (data) {
            data[(z * height + y) * width + x] = tileId;
        }
    }

    static setTileIds(x: number, y: number, tileIds: number[]): void {
        for (let i = 0; i < REGame.TILE_LAYER_COUNT; i++) {
            this.setTileId(x, y, i, tileIds[i]);
        }
    }

    static onUpdateBlock(block: REGame_Block): void {
        const tileIds = block.tileIds();
        if (tileIds) {
            this.setTileIds(block.x(), block.y(), tileIds);
        }
    }
}
