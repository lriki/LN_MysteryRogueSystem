import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { REResponse } from "../../system/RECommand";
import { RECommandContext } from "../../system/RECommandContext";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { REGame } from "ts/objects/REGame";
import { REData } from "ts/data/REData";
import { Helpers } from "ts/system/Helpers";
import { BlockLayerKind } from "ts/objects/REGame_Block";
import { RESystem } from "ts/system/RESystem";
import { DBasics } from "ts/data/DBasics";
import { REGameManager } from "ts/system/REGameManager";
import { SAIHelper } from "ts/system/SAIHelper";

/**
 * Scheduler から通知された各タイミングにおいて、行動決定を行う Behavior.
 * 
 * この Behavior は標準的な行動決定のみ行う。
 * 状態異常による行動制限(&経過ターンのデクリメント)・暴走は、状態異常の Behavior 側で onDecisionPhase() をフックして実装する。
 */
export class REGame_DecisionBehavior extends LBehavior {
    private _targetPositionX: number = -1;
    private _targetPositionY: number = -1;

    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse {

        if (phase == DecisionPhase.Manual) {    // TODO: Manual っていう名前が良くない気がするので直したい。
            context.openDialog(entity, new REManualActionDialog());
            return REResponse.Succeeded;
        }
        else if (phase == DecisionPhase.AIMinor) {

            // 目的地が設定されている場合は移動可能
            if (this._targetPositionX >= 0 && this._targetPositionY >= 0) {
                const dir = SAIHelper.findDirectionTo(entity, entity.x, entity.y, this._targetPositionX, this._targetPositionY);
                const front = Helpers.makeFrontPosition(entity.x, entity.y, dir, 1);
                const e = REGame.map.block(front).aliveEntity(BlockLayerKind.Unit);
                if (e) {
                    context.postActionTwoWay(DBasics.actions.DirectionChangeActionId, entity, undefined, { direction: dir });

                    // 通常攻撃
                    // TODO: とりいそぎここで試す
                    context.postPerformSkill(entity, RESystem.skills.normalAttack);
                    context.postConsumeActionToken(entity);
                    return REResponse.Succeeded;
                }
                else {
                    if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
                        context.postActionTwoWay(DBasics.actions.DirectionChangeActionId, entity, undefined, { direction: dir });
                        context.postActionTwoWay(DBasics.actions.MoveToAdjacentActionId, entity, undefined, { direction: dir });
                    }
                    context.postConsumeActionToken(entity);
                    return REResponse.Succeeded;
                }
            }
            else {
                // TODO: ここで消費は良くないのだが、現状これが無いと無限ループする
                context.postConsumeActionToken(entity);
                return REResponse.Succeeded;
            }
        
            /*
            // 右へ移動するだけ
            //let dir = 6;

            // 左へ移動するだけ
            let dir = 4;

            // ランダム移動
            //const table = [1,2,3,4,6,7,8,9];
            //const dir = table[REGame.world.random().nextIntWithMax(8)];

            const front = Helpers.makeFrontPosition(entity.x, entity.y, dir, 1);
            const e = REGame.map.block(front).aliveEntity(BlockLayerKind.Unit);
            if (e) {
                context.postActionTwoWay(DBasics.actions.DirectionChangeActionId, entity, undefined, { direction: dir });

                // 通常攻撃
                context.postPerformSkill(entity, RESystem.skills.normalAttack);
                context.postConsumeActionToken(entity);
                return REResponse.Succeeded;
            }

            if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
                context.postActionTwoWay(DBasics.actions.DirectionChangeActionId, entity, undefined, { direction: dir });
                context.postActionTwoWay(DBasics.actions.MoveToAdjacentActionId, entity, undefined, { direction: dir });
            }
            context.postConsumeActionToken(entity);
            */
            return REResponse.Succeeded;
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {
            // 同じ部屋にいる敵対 Entity のうち、一番近い Entity を検索
            const roomId = REGame.map.roomId(entity);
            const target = REGame.map.entitiesInRoom(roomId)
                .filter(e => REGameManager.isHostile(entity, e))
                .sort((a, b) => Helpers.getDistance(entity, a) - Helpers.getDistance(entity, b))
                .find(e => REGameManager.isHostile(entity, e));
            console.log("ResolveAdjacentAndMovingTarget", entity, target);
            if (target) {
                this._targetPositionX = target.x;
                this._targetPositionY = target.y;
                console.log("aaa", this);
            }
            else {
                console.log("NotImplemented.");
                this._targetPositionX = -1;
                this._targetPositionY = -1;
            }


            return REResponse.Succeeded;
        }

        return REResponse.Pass;
    }

}
