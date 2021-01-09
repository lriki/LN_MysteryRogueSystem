import { assert } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { Helpers } from "ts/system/Helpers";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REGame } from "../REGame";
import { BlockLayerKind } from "../REGame_Block";
import { REGame_Entity } from "../REGame_Entity";
import { CommandArgs, LBehavior, onMoveAsProjectile, onPrePickUpReaction, onPrePutReaction, onThrowReaction } from "./LBehavior";




/**
 * 全 Entity に共通するもの。
 * 
 * ひとまず、一般的ではないかもしれないけど、検証用途や一時的にここに機能を置くこともある。
 * というか現状何が本当に必要なのか不透明な状態なので、あるていど機能のまとまりが見えてきたら派生クラス作って分離していく。
 */
export class LCommonBehavior extends LBehavior {
    
    blowDirection: number = 0;      // 吹き飛ばし方向   TODO: いらないかも
    blowMoveCount: number = 0;      // 吹き飛ばし移動数

    // 拾われようとしている
    [onPrePickUpReaction](args: CommandArgs, context: RECommandContext): REResponse {
        return REResponse.Succeeded; // 無条件でOK
    }

    // 置かれようとしている
    // この時点で座標は確定していないため、ここで GroundLayer に置くことができるか確認することはできない。
    [onPrePutReaction](args: CommandArgs, context: RECommandContext): REResponse {
        return REResponse.Succeeded; // 無条件でOK
    }
    
    // 投げられた
    [onThrowReaction](args: CommandArgs, context: RECommandContext): REResponse {
        console.log("LCommonBehavior.onThrowReaction");

        const self = args.self;

        REGame.map.appearEntity(self, self.x, self.y, BlockLayerKind.Projectile);

        const common = self.findBehavior(LCommonBehavior);
        assert(common);

        // 普通のアイテムは吹き飛ばし扱いで移動開始
        common.blowDirection = args.sender.dir;
        common.blowMoveCount = 5;
        self.dir = args.sender.dir;
        
        context.post(self, self, undefined, onMoveAsProjectile);

        
        return REResponse.Pass;
    }
    
    // Projectile として移動
    [onMoveAsProjectile](args: CommandArgs, context: RECommandContext): REResponse {
        const self = args.self;
        
        const common = self.findBehavior(LCommonBehavior);
        assert(common);
        
        //const args = (cmd.args() as REMoveToAdjacentArgs);
        const offset = Helpers.dirToTileOffset(self.dir);

        if (REGame.map.moveEntity(self, self.x + offset.x, self.y + offset.y, BlockLayerKind.Projectile)) {
            context.postSequel(self, RESystem.sequels.blowMoveSequel);
            
            common.blowMoveCount--;
        
            if (common.blowMoveCount <= 0) {
                // TODO: 落下
            }
            else {
                context.post(self, self, undefined, onMoveAsProjectile);
            }
                
            return REResponse.Succeeded;
        }

        return REResponse.Pass;
    }
    

    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions.concat([
            DBasics.actions.PickActionId,
        ]);
    }

    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        return super.onAction(entity, context, cmd);
    }

    
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        return super.onReaction(entity, context, cmd);
    }
}

