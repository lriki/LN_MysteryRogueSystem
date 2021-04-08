import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onMoveAsMagicBullet, onWaveReaction } from "./LBehavior";


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

    
    [onWaveReaction](args: CommandArgs, context: SCommandContext): REResponse {
        const actor = args.sender;

        const magicBullet = SEntityFactory.newMagicBullet(this.ownerEntity());
        REGame.map.appearEntity(magicBullet, actor.x, actor.y);
        magicBullet.dir = actor.dir;

        context.post(magicBullet, magicBullet, undefined, onMoveAsMagicBullet);

        return REResponse.Succeeded;
    }
    
}

