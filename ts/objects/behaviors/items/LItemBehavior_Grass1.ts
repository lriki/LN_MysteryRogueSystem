import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { LEntity } from "ts/objects/LEntity";
import { REResponse } from "ts/system/RECommand";
import { SEffectContext, SEffectIncidentType, SEffectorFact, SEffectSubject } from "ts/system/SEffectContext";
import { SCommandContext } from "ts/system/SCommandContext";
import { CommandArgs, LBehavior, onCollideAction, onEatReaction } from "../LBehavior";
import { LItemBehavior } from "../LItemBehavior";
import { DEffectCause } from "ts/data/DEffect";
import { REGame } from "ts/objects/REGame";

/**
 * 
 */
export class LItemBehavior_Grass1 extends LBehavior {
    
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LItemBehavior_Grass1);
        return b;
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.push(DBasics.actions.EatActionId);
    }
    


}

