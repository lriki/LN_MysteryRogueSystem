import { MapDataProvidor } from "./MapDataProvidor";
import { REGame_Block } from "./REGame_Block";




// serializable
export interface RE_Game_Data
{

}

/**
 * アクティブなマップオブジェクト。
 * インスタンスは1つだけ存在する。
 */
export class REGame_Map
{
    _width: number = 0;
    _height: number = 0;
    _blocks: REGame_Block[] = [];
    _borderWall: REGame_Block = new REGame_Block(this, -1, -1);   // マップ有効範囲外に存在するダミー要素

    setupEmptyMap(width: number, height: number) {
        this._width = width;
        this._height = height;

        const count = this._width * this._height;
        this._blocks = new Array<REGame_Block>(count);
        for (let i = 0; i < count; i++) {
            this._blocks[i] = new REGame_Block(this, i % this._width, i / this._width);
        }
    }

    clear(): void {
        this._width = 0;
        this._height = 0;
        this._blocks = [];
    }

    /**
     * 現在の $dataMap の情報をもとに、固定マップを作る。
     */
    setupFixedMap(): void {
        this.setupEmptyMap($dataMap.width ?? 1, $dataMap.height ?? 1);
        
        this._blocks.forEach(block => {
            block.setTileIds(MapDataProvidor.tileIds(block.x(), block.y()));
        });
    }

    width(): number {
        return this._width;
    }

    height(): number {
        return this._height;
    }

    block(x: number, y: number) : REGame_Block {
        if (x < 0 || this._width <= x || y < 0 || this._height <= y) {
            return this._borderWall;
        }
        else {
            return this._blocks[y * this._width + x];
        }
    }
    //_data: RE_Game_Data;
}

