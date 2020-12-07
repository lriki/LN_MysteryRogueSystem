import { DBasics } from "ts/data/DBasics";
import { ActionId, REData } from "ts/data/REData";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { REGame_Entity } from "../REGame_Entity";
import { LBehavior, onPrePickUpReaction } from "./LBehavior";




/**
 * 全 Entity に共通するもの。
 * 
 * ひとまず、一般的ではないかもしれないけど、検証用途や一時的にここに機能を置くこともある。
 * というか現状何が本当に必要なのか不透明な状態なので、あるていど機能のまとまりが見えてきたら派生クラス作って分離していく。
 */
export class LCommonBehavior extends LBehavior {
    
    // 拾われようとしている
    [onPrePickUpReaction](entity: REGame_Entity, context: RECommandContext): REResponse {
        console.log("LCommonBehavior.onPrePickUpReaction");
        return REResponse.Consumed; // 無条件でOK
    }

    onQueryActions(): ActionId[] {
        return [DBasics.actions.PickActionId];
    }

    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        return super.onAction(entity, context, cmd);
    }

    
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        return super.onReaction(entity, context, cmd);
    }
}

