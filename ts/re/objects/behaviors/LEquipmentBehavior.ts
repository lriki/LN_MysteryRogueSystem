import { assert, RESerializable, tr2 } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";
import { LObject } from "../LObject";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, testPickOutItem } from "./LBehavior";
import { LEquipmentUserBehavior } from "./LEquipmentUserBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";


@RESerializable
export class LEquipmentBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEquipmentBehavior);
        return b
    }
    
    onAttached(self: LEntity): void {
        assert(this.ownerEntity().findEntityBehavior(LItemBehavior));
    }
    
    onQueryReactions(actions: DActionId[]): void {
        actions.push(REBasics.actions.EquipActionId);
        actions.push(REBasics.actions.EquipOffActionId);
    }
    
    onOwnerRemoveFromParent(owner: LObject): void {
        const inventory = owner.parentObject();
        if (inventory instanceof LInventoryBehavior) {
            const unit = inventory.ownerEntity();

            const behavior = unit.getEntityBehavior(LEquipmentUserBehavior);
            const removed = behavior.removeEquitment(this.ownerEntity());
            assert(removed);

            // TODO: ↑ちょっとあまりにも場当たり的なので再設計したいところ…
        }
        else {
            throw new Error("Not Implemented.");
        }
    }

    [testPickOutItem](args: CommandArgs, context: SCommandContext): SCommandResponse {
        const self = args.self;
        if (self.isCursed()) {
            context.postMessage(tr2("呪われている！"));
            return SCommandResponse.Canceled;
        }
        else {
            return SCommandResponse.Handled;
        }
    }
    
}
