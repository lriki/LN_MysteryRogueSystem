import { assert } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { Helpers } from "ts/system/Helpers";
import { RECommand, REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { SMomementCommon } from "ts/system/SMomementCommon";
import { REGame } from "../REGame";
import { BlockLayerKind } from "../LBlock";
import { LEntity } from "../LEntity";
import { CommandArgs, LBehavior, onCollideAction, onCollidePreReaction, onMoveAsProjectile, onPrePickUpReaction, onPrePutReaction, onThrowReaction } from "./LBehavior";




/**
 * 全 Entity に共通するもの。
 * 
 * ひとまず、一般的ではないかもしれないけど、検証用途や一時的にここに機能を置くこともある。
 * というか現状何が本当に必要なのか不透明な状態なので、あるていど機能のまとまりが見えてきたら派生クラス作って分離していく。
 */
export class LCommonBehavior extends LBehavior {
    
    blowDirection: number = 0;      // 吹き飛ばし方向
    blowMoveCount: number = 0;      // 吹き飛ばし移動数

    public static startMoveAsProjectile(context: SCommandContext, entity: LEntity, dir: number, distance: number): void {
        const common = entity.findBehavior(LCommonBehavior);
        assert(common);

        // 普通のアイテムは吹き飛ばし扱いで移動開始
        common.blowDirection = dir;
        common.blowMoveCount = distance;
        //entity.dir = args.sender.dir;
        
        context.post(entity, entity, undefined, onMoveAsProjectile);
    }

    private clearKnockback(): void {
        this.blowDirection = 0;
        this.blowMoveCount = 0;
    }

    // 拾われようとしている
    [onPrePickUpReaction](args: CommandArgs, context: SCommandContext): REResponse {
        return REResponse.Succeeded; // 無条件でOK
    }

    // 置かれようとしている
    // この時点で座標は確定していないため、ここで GroundLayer に置くことができるか確認することはできない。
    [onPrePutReaction](args: CommandArgs, context: SCommandContext): REResponse {
        return REResponse.Succeeded; // 無条件でOK
    }
    
    // 投げられた
    [onThrowReaction](args: CommandArgs, context: SCommandContext): REResponse {

        const self = args.self;

        REGame.map.appearEntity(self, self.x, self.y, BlockLayerKind.Projectile);


        LCommonBehavior.startMoveAsProjectile(context, self, args.sender.dir, 5);

        
        return REResponse.Pass;
    }
    
    // Projectile として移動
    [onMoveAsProjectile](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        
        const common = self.findBehavior(LCommonBehavior);
        assert(common);
        assert(this.blowDirection != 0);
        
        /*
        const hitTarget = REGame.map.block(self.x, self.y).aliveEntity(BlockLayerKind.Unit);
        if (hitTarget) {

            context.post(
                hitTarget, self, undefined, onCollidePreReaction,
                (response: REResponse, _: LEntity, context: SCommandContext) => {
                    if (response == REResponse.Pass) {
                        context.post(self, hitTarget, args, onCollideAction, () => {
                        });
                    }
                });


            return REResponse.Succeeded;
        }
        */

        //const args = (cmd.args() as REMoveToAdjacentArgs);
        const offset = Helpers.dirToTileOffset(this.blowDirection);
        const tx = self.x + offset.x;
        const ty = self.y + offset.y;


        if (SMomementCommon.moveEntity(self, tx, ty, BlockLayerKind.Projectile)) {
            context.postSequel(self, RESystem.sequels.blowMoveSequel);
            
            common.blowMoveCount--;
        
            if (common.blowMoveCount <= 0) {
                // HomeLayer へ移動
                SMomementCommon.locateEntity(self, self.x, self.y);
                context.postSequel(self, RESystem.sequels.dropSequel, { movingDir: this.blowDirection });
                this.clearKnockback();
                // TODO: 落下
            }
            else {
                context.post(self, self, undefined, onMoveAsProjectile);
            }
                
            return REResponse.Succeeded;
        }
        else {
            // HomeLayer へ移動
            SMomementCommon.locateEntity(self, self.x, self.y);
            context.postSequel(self, RESystem.sequels.dropSequel, { movingDir: this.blowDirection });
            this.clearKnockback();
            // TODO: 落下
        }

        return REResponse.Pass;
    }
    

    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions;
        //.concat([
        //    DBasics.actions.PickActionId,
        //]);
    }
}

