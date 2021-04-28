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

    // 拾われようとしている
    [onPrePickUpReaction](args: CommandArgs, context: SCommandContext): REResponse {
        return REResponse.Succeeded; // 無条件でOK
    }

    // 置かれようとしている
    // この時点で座標は確定していないため、ここで GroundLayer に置くことができるか確認することはできない。
    [onPrePutReaction](args: CommandArgs, context: SCommandContext): REResponse {
        return REResponse.Succeeded; // 無条件でOK
    }
    

    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions;
        //.concat([
        //    DBasics.actions.PickActionId,
        //]);
    }
}

