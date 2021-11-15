import { TileShape } from "ts/re/objects/LBlock";
import { FMap } from "../FMapData";
import { FMapBuildPass } from "./FMapBuildPass";

/**
 */
 export class FMakeTileKindPass extends FMapBuildPass {
    public execute(map: FMap): void {

        // TODO: 適当状態
        for (const block of map.blocks()) {
            if (block.isPassagableComponent()) {
                block.setTileShape(TileShape.Floor);
            }
            else {
                block.setTileShape(TileShape.Wall);
            }
        }
    }
}

