import { Helpers } from "ts/system/Helpers";
import { RECommand, REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { SMomementCommon } from "ts/system/SMomementCommon";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { BlockLayerKind } from "../LBlock";
import { LEntity } from "../LEntity";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onCollidePreReaction, onMoveAsMagicBullet } from "./LBehavior";


/**
 */
export class LMagicBulletBehavior extends LBehavior {
    private _ownerItemEntityId: LEntityId = LEntityId.makeEmpty();

    public setup(ownerItem: LEntity): void {
        this._ownerItemEntityId = ownerItem.entityId();
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.homeLayer)
            return BlockLayerKind.Projectile;
        else
            super.onQueryProperty(propertyId);
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
                    (response: REResponse) => {
                        if (response == REResponse.Pass) {

                            // reactor 側ではじかれていなかったので CollideAction を呼び出す
                            const args2: CollideActionArgs = {
                                dir: dir,
                            };
                            context.post(self, entity1, args.subject, args2, onCollideAction, () => {
                            });
                        }
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

        if (SMomementCommon.moveEntity(self, self.x + offset.x, self.y + offset.y, BlockLayerKind.Projectile)) {
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

        

        console.log("LMagicBulletBehavior.onCollideAction");
        console.log("ownerItem", ownerItem.basicBehaviors());
        console.log("abilities", ownerItem.abilities());

        // ownerItem の onCollideAction へ中継する
        context.post(ownerItem, target, args.subject, args.args, onCollideAction);

        return REResponse.Succeeded;
    }
}

