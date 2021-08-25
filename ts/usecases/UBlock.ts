import { LBlock } from "ts/objects/LBlock";
import { LMap } from "ts/objects/LMap";
import { REGame } from "ts/objects/REGame";
import { UMovement } from "./UMovement";

/**
 * 様々な条件で Block を取得する方法を提供する。
 */
export class UBlock {

    public static pos(a1: any, a2: any): [number, number] {
        if (a1 instanceof LBlock) {
            return [a1.x(), a1.y()];
        }
        else {
            return [a1, a2];
        }
    }

    /** 指定座標の周囲 4 Block を取得する */
    public static adjacentBlocks4(map: LMap, x: number, y: number): LBlock[];
    public static adjacentBlocks4(map: LMap, block: LBlock, _?: any): LBlock[];
    public static adjacentBlocks4(map: LMap, a1: any, a2: any): LBlock[] {
        const [x, y] = this.pos(a1, a2);
        return [
            map.block(x, y - 1),
            map.block(x - 1, y),
            map.block(x + 1, y),
            map.block(x, y + 1),
        ];
    }

    /** 指定座標の周囲 8 Block を取得する */
    public static adjacentBlocks8XY(map: LMap, x: number, y: number): LBlock[] {
        return [
            map.block(x - 1, y - 1),
            map.block(x, y - 1),
            map.block(x + 1, y - 1),
            map.block(x - 1, y),
            map.block(x + 1, y),
            map.block(x - 1, y + 1),
            map.block(x, y + 1),
            map.block(x + 1, y + 1),
        ];
    }

    /** 指定 Block の周囲 8 Block を取得する */
    public static getAdjacentBlocks8(map: LMap, block: LBlock): LBlock[] {
        return this.adjacentBlocks8XY(map, block.x(), block.y());
    }

    

    /*
    public static iterateAdjacentBlocks8(map: LMap, block: LBlock, func: (b: LBlock) => void): void {
        const x = block.x();
        const y = block.y();
        for (const offset of UMovement.adjacent8Offsets) {
            const b = map.tryGetBlock(x + offset[0], y +  offset[1]);
            if (b) {
                func(b);
            }
        }
    }
    */
}