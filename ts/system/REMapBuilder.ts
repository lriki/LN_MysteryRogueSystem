import { assert } from "ts/Common";
import { TileKind } from "ts/objects/REGame_Block";
import { REGame_Map } from "../objects/REGame_Map";

/**
 * 地形生成を行うモジュールに対して、マップデータへのアクセスを提供するクラス。
 * 直接 REGame_Map に触れるのは危険 & 余計に気にする API が多すぎるので、ラップしたもの。
 */
/*
export class REMapBuilder {
    private _map: REGame_Map;
    
    constructor(map: REGame_Map) {
        this._map = map;
    }

    floorId(): number {
        return this._map.floorId();
    }

    width(): number {
        return this._map.width();
    }

    height(): number {
        return this._map.height();
    }

    reset(width: number, height: number) {
        this._map.setupEmptyMap(width, height);
    }

    setTileKind(x: number, y: number, value: TileKind) {
        if (x < 0 || this.width() <= x || y < 0 || this.height() <= y) {
            throw new Error();
        }

        const tile = this._map.block(x, y).tile();
        const attr = tile.findAttribute(RETileAttribute);
        assert(attr);
        attr.setTileKind(value);
    }

}
*/
