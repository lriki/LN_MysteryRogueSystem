import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { REEntityFactory } from "ts/system/REEntityFactory";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { CommandArgs, LBehavior, onCollideAction, onMoveAsMagicBullet, onWaveReaction } from "./LBehavior";


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

    
    [onWaveReaction](args: CommandArgs, context: RECommandContext): REResponse {
        const actor = args.sender;

        const magicBullet = REEntityFactory.newMagicBullet(this.ownerEntity());
        REGame.map.appearEntity(magicBullet, actor.x, actor.y);
        magicBullet.dir = actor.dir;

        context.post(magicBullet, magicBullet, undefined, onMoveAsMagicBullet);

        return REResponse.Succeeded;
    }
    
}

