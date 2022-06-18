import { LTileShape } from "ts/mr/objects/LBlock";
import { FMap } from "../FMapData";
import { FMapBuildPass } from "./FMapBuildPass";

/**
 */
 export class FMakeTileKindPass extends FMapBuildPass {
    public execute(map: FMap): void {

        // TODO: 適当状態
        for (const block of map.innerBlocks) {
            if (block.isPassagableComponent()) {
                block.setTileShape(LTileShape.Floor);
            }
            else {
                block.setTileShape(LTileShape.Wall);
            }
        }
    }
}

