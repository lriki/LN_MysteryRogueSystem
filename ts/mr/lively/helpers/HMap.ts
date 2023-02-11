import { LBlock } from "../LBlock";
import { LMap } from "../LMap";
import { HMovement } from "./HMovement";

export class HMap {

    /**
     * 指定した座標から正面の Block を取得する
     */
    public static getFrontBlock(map: LMap, x: number, y: number, d: number): LBlock {
        const offset = HMovement.directionToOffset(d);
        const block = map.block(x + offset.x, y + offset.y);
        return block;
    }
}