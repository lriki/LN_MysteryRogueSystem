import { MRSerializable, tr2 } from "ts/mr/Common";
import { SCommand, SEndProjectileMovingCause, SEndProjectileMovingCommand, SItemReactionCommand, SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";
import { LBehavior } from "./LBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { SSubTaskChain } from "ts/mr/system/tasks/STask";
import { UName } from "ts/mr/utility/UName";
import { TDrop } from "ts/mr/transactions/TDrop";
import { MRBasics } from "ts/mr/data/MRBasics";

/**
 * 
 */
@MRSerializable
export class LCrackedBehavior extends LBehavior {
    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        return MRLively.world.spawn(LCrackedBehavior);
    }

    override onGetDescriptions(descriptions: string[]): void {
        descriptions.push(tr2("\\I[160] 何かにぶつかると割れてしまう。"));
    }

    override onCommand(self: LEntity, cctx: SCommandContext, chain: SSubTaskChain, cmd: SCommand): void {
        if (cmd instanceof SEndProjectileMovingCommand) {

            // 壁に当たった？
            if (cmd.cause == SEndProjectileMovingCause.NoPassage) {
                cctx.postSequel(self, MRBasics.sequels.crack);
                cctx.postMessage(tr2("%1は割れた。").format(UName.makeNameAsItem(self)));

                const inventory = self.findEntityBehavior(LInventoryBehavior);
                if (inventory) {
                    for (const item of inventory.items) {
                        TDrop.dropOrDestroyEntityForce(cctx, item, self.mx, self.my);
                    }
                }

                cctx.postDestroy(self);
                chain.reject();
            }
        }
        
        // 別の Entity に衝突した？
        if (cmd instanceof SItemReactionCommand && cmd.itemActionId == MRBasics.actions.collide) {
            cctx.postSequel(self, MRBasics.sequels.crack);
            cctx.postMessage(tr2("%1は割れた。").format(UName.makeNameAsItem(self)));

            // 格納されているアイテムをすべてぶつける
            const inventory = self.findEntityBehavior(LInventoryBehavior);
            if (inventory) {
                const items = inventory.items;
                inventory.clearItems();
                for (const item of items) {
                    cctx.postCommandTask(new SItemReactionCommand(
                        MRBasics.actions.collide, item, cmd.target, [], cmd.subject, cmd.direction));
                }
            }

            cctx.postDestroy(self);
            // 衝突した時の Effect 発動など、後続の処理は行いたいので、処理済みにはしない。
        }
    }
}

