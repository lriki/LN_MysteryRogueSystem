import { REManualActionDialog } from "ts/system/dialogs/REManualDecisionDialog";
import { REResponse, SPhaseResult } from "../../system/RECommand";
import { SCommandContext } from "../../system/SCommandContext";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { Helpers } from "ts/system/Helpers";
import { RESystem } from "ts/system/RESystem";
import { SAIHelper } from "ts/system/SAIHelper";
import { LEntityId } from "../LObject";
import { LDirectionChangeActivity } from "../activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "../activities/LMoveAdjacentActivity";
import { REUnitBehavior } from "./REUnitBehavior";
import { SMomementCommon } from "ts/system/SMomementCommon";

/**
 * Scheduler から通知された各タイミングにおいて、行動決定を行う Behavior.
 * 
 * この Behavior は標準的な行動決定のみ行う。
 * 状態異常による行動制限(&経過ターンのデクリメント)・暴走は、状態異常の Behavior 側で onDecisionPhase() をフックして実装する。
 */
export class REGame_DecisionBehavior extends LBehavior {
    private _targetPositionX: number = -1;
    private _targetPositionY: number = -1;
    private _attackTargetEntityId: LEntityId = LEntityId.makeEmpty();

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {

        if (phase == DecisionPhase.Manual) {    // TODO: Manual っていう名前が良くない気がするので直したい。

            const behavior = entity.getBehavior(REUnitBehavior);
            if (behavior._straightDashing && SMomementCommon.checkDashStopBlock(entity)) {
                context.postActivity(LMoveAdjacentActivity.make(entity, entity.dir));
                context.postConsumeActionToken(entity);
                return SPhaseResult.Handled;
            }
            else {
                const dialog = new REManualActionDialog();
                dialog.dashingEntry = behavior._straightDashing;
                context.openDialog(entity, dialog, false);
                behavior._straightDashing = false;
                return SPhaseResult.Handled;
            }

        }
        else if (phase == DecisionPhase.AIMinor) {

            // http://twist.jpn.org/sfcsiren/index.php?%E3%82%BF%E3%83%BC%E3%83%B3%E3%81%AE%E9%A0%86%E7%95%AA
            // の移動目標位置決定はもう少し後の Phase なのだが、敵対 Entity への移動目標位置決定はこの Phase で行う。
            // こうしておかないと、Player の移動を追うように Enemy が移動できなくなる。
            {
                // 同じ部屋にいる敵対 Entity のうち、一番近い Entity を検索
                const roomId = REGame.map.roomId(entity);
                const target = REGame.map.entitiesInRoom(roomId)
                    .filter(e => Helpers.isHostile(entity, e))
                    .sort((a, b) => Helpers.getDistance(entity, a) - Helpers.getDistance(entity, b))
                    .find(e => Helpers.isHostile(entity, e));
                if (target) {
                    this._targetPositionX = target.x;
                    this._targetPositionY = target.y;
                    
                    // target は最も近い Entity となっているので、これと隣接しているか確認し、攻撃対象とする
                    if (Helpers.checkAdjacent(entity, target)) {
                        this._attackTargetEntityId = target.entityId();
                    }
                }
                else {
                    console.log("NotImplemented.");
                    this._targetPositionX = -1;
                    this._targetPositionY = -1;
                }
            }

            // 攻撃対象が設定されていれば、このフェーズでは何もしない
            if (this._attackTargetEntityId.hasAny()) {
                return SPhaseResult.Pass;
            }
            // 目的地が設定されている場合は移動可能
            else if (this._targetPositionX >= 0 && this._targetPositionY >= 0) {
                const dir = SAIHelper.findDirectionTo(entity, entity.x, entity.y, this._targetPositionX, this._targetPositionY);
                //const front = Helpers.makeFrontPosition(entity.x, entity.y, dir, 1);
                //const e = REGame.map.block(front).aliveEntity(BlockLayerKind.Unit);
                //if (e) {
                //}
                //else
                {
                    if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
                        context.postActivity(LDirectionChangeActivity.make(entity, dir));
                        context.postActivity(LMoveAdjacentActivity.make(entity, dir));
                    }
                    context.postConsumeActionToken(entity);
                    return SPhaseResult.Handled;
                }
            }
            else {
                // TODO: ここで消費は良くないのだが、現状これが無いと無限ループする
                context.postConsumeActionToken(entity);
                return SPhaseResult.Handled;
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
        }
        else if (phase == DecisionPhase.ResolveAdjacentAndMovingTarget) {

            // 後続をブロックする理由はない
            return SPhaseResult.Pass;
        }
        else if (phase == DecisionPhase.AIMajor) {
            
            if (this._attackTargetEntityId.hasAny()) {

                // 通常攻撃
                {
                    const target = REGame.world.entity(this._attackTargetEntityId);
                    // 発動可否チェック。本当に隣接している？
                    let valid = false;
                    if (Helpers.checkAdjacent(entity, target)) {
                        valid = true;
                    }

                    if (valid) {
                        const dir = SAIHelper.entityDistanceToDir(entity, target);
                        
                        context.postActivity(LDirectionChangeActivity.make(entity, dir));
        
                        context.postPerformSkill(entity, RESystem.skills.normalAttack);
                        context.postConsumeActionToken(entity);
                        return SPhaseResult.Handled;
                    }
                    
                }


            }
            else {

            }
            return SPhaseResult.Pass;
        }

        return SPhaseResult.Pass;
    }

}
