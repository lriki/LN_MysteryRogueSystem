import { assert, tr2 } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { CommandArgs, LBehavior, testPickOutItem } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";


export class LEquipmentBehavior extends LBehavior {

    
    onAttached(): void {
        assert( this.ownerEntity().hasBehavior(LItemBehavior));
    }
    
    onQueryReactions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EquipActionId);
        actions.push(DBasics.actions.EquipOffActionId);
        return actions;
    }
    
    [testPickOutItem](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        if (self.isCursed()) {
            context.postMessage(tr2("呪われている！"));
            return REResponse.Canceled;
        }
        else {
            return REResponse.Succeeded;
        }
    }
    
}
