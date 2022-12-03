import { assert } from "../Common";
import { MRData } from "../data";
import { LMap } from "../lively/LMap";
import { SComputeFovResult, SFovHelper } from "./utils/SFovHelper";

export class SFovShadowMap {
    private _map: LMap | undefined;
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
        this._data = new Array(map.width() * map.height());
        this.clear();

        const fov = new SComputeFovResult();
        fov.setup(map.width(), map.height());

        // test
        // {
        //     SFovHelper.computeFov(fov, 13, 24, 5, false, MRData.system.fovSystem);
        //     for (let y = 0; y < this.height; y++) {
        //         for (let x = 0; x < this.width; x++) {
        //             if (fov.get(x, y).fov) {
        //                 this.set(x, y, 1);
        //             }
        //         }
        //     }
        // }

        // test
        // this.set(13, 24, 1);
        // this.set(12, 24, 1);
        // this.set(13, 23, 1);
    }

    public clear(): void {
        for (let i = 0; i < this._data.length; i++) {
            this._data[i] = 0;
        }
    }

    public set(mx: number, my: number, shadow: number): void {
        this._data[my * this.width + mx] = shadow;
    }

    public isValid(mx: number, my: number): boolean {
        return (0 <= mx && mx < this.width) && (0 <= my && my < this.height);
    }

    public get(mx: number, my: number): number {
        return this._data[my * this.width + mx];
    }
}
