import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { REEntityFactory } from "ts/system/REEntityFactory";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { LBehavior, onMoveAsMagicBullet } from "./LBehavior";


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

    
    onReaction(entity: REGame_Entity, actor: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        //const actor = cmd.actor()
        if (cmd.action().id == DBasics.actions.WaveActionId) {
            const magicBullet = REEntityFactory.newMagicBullet();
            REGame.map.appearEntity(magicBullet, actor.x, actor.y);
            magicBullet.dir = actor.dir;

            context.post(magicBullet, magicBullet, undefined, onMoveAsMagicBullet);
            
            return REResponse.Succeeded;
        }
        return REResponse.Pass;
    }
}

