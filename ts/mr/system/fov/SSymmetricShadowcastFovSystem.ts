import { assert } from "ts/mr/Common";
import { DFovSystem } from "ts/mr/data/DSystem";
import { LMap } from "ts/mr/lively/LMap";
import { MRSystem } from "../MRSystem";
import { IFovMap, SFovHelper } from "../utils/SFovHelper";
import { SFovSystem } from "./SFovSystem";

export class SSymmetricShadowcastFovSystem extends SFovSystem {
    private _fovMap: FovMap;

    public constructor() {
        super();
        this._fovMap = new FovMap();
    }

    public markBlockPlayerPassed(map: LMap, mx: number, my: number): void {
        const radius = 6;

        // LBlock のフラグを更新
        this._fovMap.setMap(map);
        this._fovMap.clear();
        SFovHelper.computeFov(this._fovMap, mx, my, radius, false, DFovSystem.SymmetricShadowcast);
        this._fovMap.apply();

        // 表示用のシャドウマップデータを更新
        MRSystem.fovShadowMap.locate(mx, my, radius);
        MRSystem.minimapData.setRefreshNeeded();
    }
}

// computeFov の結果を LBlock へ反映させるためのもの
class FovMap extends IFovMap {
    private _map: LMap | undefined;
    private _data: number[];

    public constructor() {
        super();
        this._map = undefined;
        this._data = [];
    }

    public setMap(map: LMap): void {
        this._map = map;
        const len = map.width() * map.height();
        if (this._data.length !== len) {
            this._data = new Array(len);
        }
    }

    public clear(): void {
        for (let i = 0; i < this._data.length; i++) {
            this._data[i] = 0;
        }
    }

    public apply(): void {
        assert(this._map);
        const width = this._map.width();
        const height = this._map.height();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const block = this._map.block(x, y);
                if (this._data[y * width + x] > 0) {
                    block._passed = true;
                }
            }
        }
    }

    override getWidth(): number {
        assert(this._map);
        return this._map.width();
    }

    override getHeight(): number {
        assert(this._map);
        return this._map.height();
    }

    override getTransparent(x: number, y: number): boolean {
        assert(this._map);
        return this._map.block(x, y).isFloorLikeShape();
    }

    override setFov(x: number, y: number, fov: boolean): void {
        this._data[y * this.getWidth() + x] = fov ? 1 : 0;
    }
}
