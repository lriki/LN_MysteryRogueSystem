import { tr2 } from "ts/re/Common";
import { REResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UName } from "ts/re/usecases/UName";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onGrounded, testPickOutItem } from "../behaviors/LBehavior";
import { UMovement } from "ts/re/usecases/UMovement";
import { BlockLayerKind } from "../LBlockLayer";
import { LEntityId } from "../LObject";
import { DBasics } from "ts/re/data/DBasics";
import { DEventId, RoomEventArgs, WalkEventArgs } from "ts/re/data/predefineds/DBasicEvents";
import { LEventResult } from "../LEventServer";

/**
 */
export class LSelfExplisionBehavior extends LBehavior {

    /*
    自爆はステート？
    ----------
    ステートにしておくと、グラフィックの変更を GUI で指定しやすくなる。
    */


    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LSelfExplisionBehavior);
        return b;
    }
    
}

