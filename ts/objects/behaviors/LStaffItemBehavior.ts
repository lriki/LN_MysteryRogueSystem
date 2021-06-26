import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
//import { SEntityFactory } from "ts/system/internal";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onMoveAsMagicBullet, onWaveReaction } from "./LBehavior";


/**
 */
export class LStaffItemBehavior extends LBehavior {

    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LStaffItemBehavior);
        return b
    }

    
    onQueryReactions(actions: DActionId[]): void {
        // "振る" ができる
        actions.push(DBasics.actions.WaveActionId);
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

        context.post(magicBullet, magicBullet, args.subject, undefined, onMoveAsMagicBullet);

        return REResponse.Succeeded;
    }
    
}

