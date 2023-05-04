import { MRSerializable, tr2 } from "ts/mr/Common";
import { SCommand, SEndProjectileMovingCause, SEndProjectileMovingCommand, SItemReactionCommand, SPhaseResult, SSprinkleDropedCommand } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LEntity } from "../entity/LEntity";
import { MRLively } from "../MRLively";
import { LBehavior } from "./LBehavior";
import { LInventoryBehavior } from "../entity/LInventoryBehavior";
import { SSubTaskChain, STaskYieldResult } from "ts/mr/system/tasks/STask";
import { UName } from "ts/mr/utility/UName";
import { TDrop } from "ts/mr/transactions/TDrop";
import { MRBasics } from "ts/mr/data/MRBasics";

const SprinkleDropedRate = 15;  // 15%

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

    override *onCommand(self: LEntity, cctx: SCommandContext, cmd: SCommand): Generator<STaskYieldResult> {
        if (cmd instanceof SEndProjectileMovingCommand) {

            // 壁に当たった？
            if (cmd.cause == SEndProjectileMovingCause.NoPassage) {
                this.crackeAndDropItems(cctx, self);
                yield STaskYieldResult.Reject;
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

        // 転んでバラまかれた？
        if (cmd instanceof SSprinkleDropedCommand) {
            if (cctx.random().nextIntWithMax(100) < SprinkleDropedRate) {
                this.crackeAndDropItems(cctx, self);
            }
        }
    }

    private crackeAndDropItems(cctx: SCommandContext, self: LEntity): void {
        cctx.postSequel(self, MRBasics.sequels.crack);
        cctx.postMessage(tr2("%1は割れた。").format(UName.makeNameAsItem(self)));

        const inventory = self.findEntityBehavior(LInventoryBehavior);
        if (inventory) {
            for (const item of inventory.items) {
                TDrop.dropOrDestroyEntityForce(cctx, item, self.mx, self.my);
            }
        }

        cctx.postDestroy(self);
    }

}

