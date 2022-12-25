import { assert } from "ts/mr/Common";
import { DFovSystem } from "ts/mr/data/DSystem";

// export interface SComputeFovResultBlock {
//     fov: boolean;
//     transparent: boolean;   // 壁の場合、false
// }

// export class SComputeFovResult {
//     private _width: number;
//     private _height: number;
//     private _data: SComputeFovResultBlock[];

//     public constructor() {
//         this._width = 0;
//         this._height = 0;
//         this._data = [];
//     }

//     public get width(): number {
//         return this._width;
//     }

//     public get height(): number {
//         return this._height;
//     }

//     public get cells(): SComputeFovResultBlock[] {
//         return this._data;
//     }

//     public setup(width: number, height: number): void {
//         this._width = width;
//         this._height = height;
//         this._data = new Array(width * height);
//         for (let i = 0; i < this._data.length; i++) {
//             this._data[i] = {
//                 fov: false,
//                 transparent: true,
//             };
//         }
//     }

//     public clear(): void {
//         for (let i = 0; i < this._data.length; i++) {
//             this._data[i].fov = false;
//             this._data[i].transparent = true;
//         }
//     }

//     public clearFov(): void {
//         for (let i = 0; i < this._data.length; i++) {
//             this._data[i].fov = false;
//         }
//     }

//     public inBounds(x: number, y: number): boolean {
//         return 0 <= x && x < this.width && 0 <= y && y < this.height;
//     }

//     public get(x: number, y: number): SComputeFovResultBlock {
//         return this._data[y * this.width + x];
//     }
// }

export abstract class IFovMap {
    public abstract getWidth(): number;
    public abstract getHeight(): number;
    public abstract getTransparent(x: number, y: number): boolean;      // 壁の場合、false
    public abstract setFov(x: number, y: number, fov: boolean): void;   // 可視の場合、true

    public inBounds(x: number, y: number): boolean {
        return 0 <= x && x < this.getWidth() && 0 <= y && y < this.getHeight();
    }
}

interface Row {
    readonly pov_x: number;  // The origin point-of-view.
    readonly pov_y: number;
    readonly quadrant: number;  // The quadrant index.
    depth: number;  // The depth of this row.
    slope_low: number;  // float
    readonly slope_high: number; // float
}

export class SFovHelper {
    public static computeFov(
        map: IFovMap,
        pov_x: number,
        pov_y: number,
        max_radius: number,
        light_walls: boolean,
        algo: DFovSystem) {
        assert(map.inBounds(pov_x, pov_y));
        //map.clear();
        switch (algo) {
            case DFovSystem.RoomBounds:
                //SFovHelper.computeFovDfov(pov_x, pov_y, max_radius, light_walls, map);
                break;
            case DFovSystem.SymmetricShadowcast:
                this.compute_fov_symmetric_shadowcast(map, pov_x, pov_y, max_radius, light_walls);
                break;
            default:
                throw new Error("Unreachable.");
        }
    }

    private static compute_fov_symmetric_shadowcast(
        map: IFovMap,
        pov_x: number,
        pov_y: number,
        max_radius: number,
        light_walls: boolean) {
        // 始点のセルを可視にする。
        map.setFov(pov_x, pov_y, true); // map.cells[pov_x + pov_y * map.width].fov = true;
        
        for (let quadrant = 0; quadrant < 4; quadrant++) {
            const row: Row = {
                pov_x: pov_x,
                pov_y: pov_y,
                quadrant: quadrant,
                depth: 1,
                slope_low: -1.0,
                slope_high: 1.0,
            };
            this.scan(map, row);
        }
        const radius_squared = max_radius * max_radius;
        const width = map.getWidth();
        const height = map.getHeight();
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                if (!light_walls && !map.getTransparent(x, y)) {
                    map.setFov(x, y, false);
                }

                // 最大範囲外は強制的に不可視とする。
                if (max_radius > 0) {
                    const dx = x - pov_x;
                    const dy = y - pov_y;
                    if (dx * dx + dy * dy >= radius_squared) {
                        map.setFov(x, y, false);
                    }
                }
            }
        }
    }

    private static readonly quadrant_table: number[][] = [
        [1, 0, 0, 1],
        [0, 1, 1, 0],
        [0, -1, -1, 0],
        [-1, 0, 0, -1],
    ]

    private static scan(map: IFovMap, row: Row): void {
        const xx = this.quadrant_table[row.quadrant][0];
        const xy = this.quadrant_table[row.quadrant][1];
        const yx = this.quadrant_table[row.quadrant][2];
        const yy = this.quadrant_table[row.quadrant][3];
        if (!map.inBounds(row.pov_x + row.depth * xx, row.pov_y + row.depth * yx)) {
            return;  // Row.depth is out-of-bounds.
        }
        const column_min = this.round_half_up(row.depth * row.slope_low);
        const column_max = this.round_half_down(row.depth * row.slope_high);
        let prev_tile_is_wall = false;
        for (let column = column_min; column <= column_max; ++column) {
            const map_x = row.pov_x + row.depth * xx + column * xy;
            const map_y = row.pov_y + row.depth * yx + column * yy;
            if (!map.inBounds(map_x, map_y)) {
                continue;  // Tile is out-of-bounds.
            }
            //const map_cell: SComputeFovResultBlock = map.cells[map_x + map_y * map.width];
            const is_wall = !map.getTransparent(map_x, map_y);
            if (is_wall || this.is_symmetric(row, column)) {
                map.setFov(map_x, map_y, true);
            }
            if (prev_tile_is_wall && !is_wall) {  // Floor tile to wall tile.
                row.slope_low = this.slope(row.depth, column);  // Shrink the view.
            }
            if (column != column_min && !prev_tile_is_wall && is_wall) {  // Wall tile to floor tile.
                // Track the slopes of the last transparent tiles and recurse into them.
                const next_row: Row = {
                    pov_x: row.pov_x,
                    pov_y: row.pov_y,
                    quadrant: row.quadrant,
                    depth: row.depth + 1,
                    slope_low: row.slope_low,
                    slope_high: this.slope(row.depth, column),
                };
                this.scan(map, next_row);
            }
            prev_tile_is_wall = is_wall;
        }
        if (!prev_tile_is_wall) {
            // Tail recuse into the next row.
            row.depth += 1;
            this.scan(map, row);
        }
    }

    /**
        Calculates new start and end slopes.

        The line is tangent to the left edge of the current tile, so we can use a
        single slope function for both start and end slopes.
    */
    private static slope(row_depth: number, column: number): number { return (2.0 * column - 1.0) / (2.0 * row_depth); }
    
    /**
        Round half numbers towards infinity.
    */
    private static round_half_up(n: number): number { return Math.floor(Math.round(n * (1.0 + Number.EPSILON))); }
    
    /**
        Round half numbers towards negative infinity.
    */
    private static round_half_down(n: number): number { return Math.floor(Math.round(n * (1.0 - Number.EPSILON))); }
    
    /**
        Returns true if a given floor tile can be seen symmetrically from the origin.

        It returns true if the central point of the tile is in the sector swept out
        by the row’s start and end slopes. Otherwise, it returns false.
    */
    static is_symmetric(row: Row, column: number): boolean {
        return column >= row.depth * row.slope_low && column <= row.depth * row.slope_high;
      }
}

