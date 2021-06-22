import { Helpers } from "ts/system/Helpers";
import { RECommand, REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { SMovementCommon } from "ts/system/SMovementCommon";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { BlockLayerKind } from "../LBlockLayer";
import { LEntity } from "../LEntity";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onCollidePreReaction, onMoveAsMagicBullet } from "./LBehavior";
import { MovingMethod } from "../LMap";


/**
 */
export class LMagicBulletBehavior extends LBehavior {
    private _ownerItemEntityId: LEntityId = LEntityId.makeEmpty();


    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LMagicBulletBehavior);
        throw new Error("Not implemented.");    // TODO: _ownerItemEntityId の取り方
        return b
    }

    public setup(ownerItem: LEntity): void {
        this._ownerItemEntityId = ownerItem.entityId();
    }

    queryHomeLayer(): BlockLayerKind | undefined {
        return BlockLayerKind.Projectile;
    }
    
    // 射程無限・壁反射を伴うため、通常の MoveAsProjectile とは異なる処理が必要となる。
    [onMoveAsMagicBullet](args: CommandArgs, context: SCommandContext): REResponse {
        this.ownerEntity().blockOccupied = false;   // TODO: これは onQueryProperty にしたい

        const self = args.self;
        const offset = Helpers.dirToTileOffset(self.dir);
        const dir = self.dir;

        const block = REGame.map.tryGetBlock(self.x + offset.x, self.y + offset.y);
        if (block) {
            // Unit との衝突
            const entity1 = block.aliveEntity(BlockLayerKind.Unit);
            if (entity1) {
                context.postAnimation(self, 1, false);
                context.postDestroy(self);
                //self.destroy();

                context.post(
                    entity1, self, args.subject, undefined, onCollidePreReaction,
                    () => {
                        // reactor 側ではじかれていなかったので CollideAction を呼び出す
                        const args2: CollideActionArgs = {
                            dir: dir,
                        };
                        context.post(self, entity1, args.subject, args2, onCollideAction, () => {
                            return true;
                        });

                        return true;
                    });

                
                return REResponse.Succeeded;
            }

            // TODO: ふきとばしの杖など一部の魔法弾は床に落ちているものとも衝突する
            if (0) {
                const entity2 = block.aliveEntity(BlockLayerKind.Ground);
                if (entity2) {
                    self.destroy();
                    return REResponse.Succeeded;
                    
                }
            }
        }

        if (SMovementCommon.moveEntity(self, self.x + offset.x, self.y + offset.y, MovingMethod.Projectile, BlockLayerKind.Projectile)) {
            context.postSequel(self, RESystem.sequels.blowMoveSequel);
            
            // recall
            context.post(self, self, args.subject, undefined, onMoveAsMagicBullet);

            return REResponse.Succeeded;
        }
        else {
            self.destroy();
            return REResponse.Succeeded;
        }

        return REResponse.Pass;
    }
    
    [onCollideAction](args: CommandArgs, context: SCommandContext): REResponse {
        const ownerItem = REGame.world.entity(this._ownerItemEntityId);
        const target = args.sender;

        // ownerItem の onCollideAction へ中継する
        context.post(ownerItem, target, args.subject, args.args, onCollideAction);

        return REResponse.Succeeded;
    }
}

