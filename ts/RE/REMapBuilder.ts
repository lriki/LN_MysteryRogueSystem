import { REGame_Map } from "./REGame_Map";

/**
 * 地形生成を行うモジュールに対して、マップデータへのアクセスを提供するクラス。
 * 直接 REGame_Map に触れるのは危険 & 余計に気にする API が多すぎるので、ラップしたもの。
 */
export class REMapBuilder {
    private _map: REGame_Map;
    
    constructor(map: REGame_Map) {
        this._map = map;
    }

    floorId(): number {
        return this._map.floorId();
    }

    reset(width: number, height: number) {
        this._map.setupEmptyMap(width, height);
    }
}
