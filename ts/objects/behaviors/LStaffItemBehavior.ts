import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { REGame_Entity } from "../REGame_Entity";
import { LBehavior } from "./LBehavior";


/**
 */
export class LStaffItemBehavior extends LBehavior {

    public constructor() {
        super();
    }

    
    onQueryReactions(actions: DActionId[]): DActionId[] {
        // "振る" ができる
        actions.push(DBasics.actions.WaveActionId);
        return actions;
    }

    //onQueryActions(actions: DActionId[]): DActionId[] {
    //   return actions.concat([
    //        DBasics.actions.WaveActionId,
    //    ]);
    //}

    
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        if (cmd.action().id == DBasics.actions.WaveActionId) {
            console.log("★ LStaffItemBehavior reaction");
            return REResponse.Succeeded;
        }
        return REResponse.Pass;
    }
}

