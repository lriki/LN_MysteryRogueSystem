import { TileKind } from "ts/objects/REGame_Block";
import { FBlockComponent, FMap } from "../FMapData";
import { FMapBuildPass } from "./FMapBuildPass";

/**
 */
 export class FMakeTileKindPass extends FMapBuildPass {
    public execute(map: FMap): void {

        // TODO: 適当状態
        for (const block of map.blocks()) {
            if (block.isPassagableComponent()) {
                block.setTileKind(TileKind.Floor);
            }
            else {
                block.setTileKind(TileKind.Wall);
            }
        }
    }
}

