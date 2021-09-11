import { tr2 } from "ts/re/Common";
import { REResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UName } from "ts/re/usecases/UName";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onGrounded, testPickOutItem } from "./LBehavior";

/**
 * 足つかみ。
 * 
 * 
 */
export class LGrabFootBehavior extends LBehavior {

    /*
    影縫い状態とは違うのか？
    ----------
    
    */

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LGrabFootBehavior);
        return b
    }

    
}
