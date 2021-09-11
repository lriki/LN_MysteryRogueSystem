import { assert } from "ts/re/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FExitPont, FMap } from "../FMapData";



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

