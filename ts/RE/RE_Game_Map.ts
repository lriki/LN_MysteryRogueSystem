import { RE_Game_Block } from "./RE_Game_Block";




// serializable
export interface RE_Game_Data
{

}

/**
 * アクティブなマップオブジェクト。
 * インスタンスは1つだけ存在する。
 */
export class RE_Game_Map
{
    _width: number = 0;
    _height: number = 0;
    _blocks: RE_Game_Block[] = [];
    _borderWall: RE_Game_Block = new RE_Game_Block(this);   // マップ有効範囲外に存在するダミー要素

    setupEmptyMap(width: number, height: number) {
        this._width = width;
        this._height = height;

        const count = this._width * this._height;
        this._blocks = new Array<RE_Game_Block>(count);
        for (let i = 0; i < count; i++) {
            this._blocks[i] = new RE_Game_Block(this);
        }
    }

    block(x: number, y: number) : RE_Game_Block {
        if (x < 0 || this._width <= x || y < 0 || this._height <= y) {
            return this._borderWall;
        }
        else {
            return this._blocks[y * this._width + x];
        }
    }
    //_data: RE_Game_Data;
}

