import { assert } from "ts/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FBlockComponent, FExitPont, FMap, FMapBlock, FSector } from "../FMapData";



/**
 */
export class FEntryPointAndExitPointPass extends FMapBuildPass {
    public execute(map: FMap): void {
        const hasExitPoint = (map.exitPont() != undefined);
        assert(!hasExitPoint);


        // ExitPoint
        {
            const candidates = map.blocks().filter(b => b.isRoom() && b.isContinuation());
            assert(candidates.length > 0);
    
            const block = candidates[map.random().nextIntWithMax(candidates.length)];
            map.setExitPont(new FExitPont(block.x(), block.y()));
        }
    }
}

