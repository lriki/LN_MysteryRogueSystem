import { assert } from "../Common";
import { MRData } from "../data";
import { DFovSystem } from "../data/DSystem";
import { LMap } from "../lively/LMap";
import { IFovMap, SFovHelper } from "./utils/SFovHelper";

export class SFovShadowMap {
    private _map: LMap | undefined;
    private _fovMap: FovMap | undefined;
    private _data: number[];

    public constructor() {
        this._map = undefined;
        this._data = [];
    }

    public get width(): number {
        assert(this._map);
        return this._map.width();
    }

    public get height(): number {
        assert(this._map);
        return this._map.height();
    }

    public setup(map: LMap): void {
        this._map = map;
        this._fovMap = new FovMap(this._map, this);
        this._data = new Array(map.width() * map.height());
        this.clear();

        // test
        {
            //SFovHelper.computeFov(this._fovMap, 13, 24, 5, false, DFovSystem.SymmetricShadowcast);
        }

        // test
        // this.set(13, 24, 1);
        // this.set(12, 24, 1);
        // this.set(13, 23, 1);
    }

    public locate(mx: number, my: number, radius: number): void {
        if (!this._fovMap) return;
        this.clear();
        SFovHelper.computeFov(this._fovMap, mx, my, radius, false, DFovSystem.SymmetricShadowcast);
    }

    public isValid(mx: number, my: number): boolean {
        return (0 <= mx && mx < this.width) && (0 <= my && my < this.height);
    }

    public isVisible(mx: number, my: number): boolean {
        //if (!this._map) return false;
        //return this._map.block(mx, my)._passed;
        return this._data[my * this.width + mx] > 0;
    }

    public clear(): void {
        for (let i = 0; i < this._data.length; i++) {
            this._data[i] = 0;
        }
    }

    public set(mx: number, my: number, visible: boolean): void {
        this._data[my * this.width + mx] = visible ? 1 : 0;
    }
}

class FovMap extends IFovMap {
    private _map: LMap;
    private _shadowMap: SFovShadowMap;

    public constructor(map: LMap, shadowMap: SFovShadowMap) {
        super();
        this._map = map;
        this._shadowMap = shadowMap;
    }

    override getWidth(): number {
        return this._map.width();
    }

    override getHeight(): number {
        return this._map.height();
    }

    override getTransparent(x: number, y: number): boolean {
        return this._map.block(x, y).isFloorLikeShape();
    }

    override setFov(x: number, y: number, fov: boolean): void {
        //this._map.block(x, y)._passed = fov;
        this._shadowMap.set(x, y, fov);
    }
}
