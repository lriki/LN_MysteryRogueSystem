import { DSkillDataId } from "ts/data/DSkill";
import { REData } from "ts/data/REData";
import { Helpers } from "ts/system/Helpers";
import { SPhaseResult } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SAIHelper } from "ts/system/SAIHelper";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEmittorPerformer } from "ts/system/SEmittorPerformer";
import { CandidateSkillAction, UAction } from "ts/usecases/UAction";
import { UMovement } from "ts/usecases/UMovement";
import { LActivity } from "../activities/LActivity";
import { LActivityPreprocessor } from "../activities/LActivityPreprocessor";
import { LCharacterAI } from "./LCharacterAI";
import { LEntity } from "../LEntity";
import { MovingMethod } from "../LMap";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LSaunteringAIHelper } from "./LSaunteringAIHelper";

export class LEscapeAI extends LCharacterAI {
    private _movingHelper: LSaunteringAIHelper;
    private _targetEntityId: LEntityId;

    public constructor() {
        super();
        this._movingHelper = new LSaunteringAIHelper();
        this._targetEntityId = LEntityId.makeEmpty();
    }

    public clone(): LCharacterAI {
        const i = new LEscapeAI();
        return i;
    }

    private checkDeadInArea(subject: LEntity, hostileEntity: LEntity, mx: number, my: number): boolean {
        const sx = subject.x;
        const sy = subject.y;
        const ex = hostileEntity.x;
        const ey = hostileEntity.y;
        const dx = Math.abs(sx - ex);
        const dy = Math.abs(sy - ey);

        const checkH = () => {
            if (sx < ex) {          // 自分が敵の左側
                if (ex < mx) {      // 敵の右側はすべて Dead
                    return true;
                }
            }
            else if (ex < sx) {     // 自分が敵の右側
                if (mx < ex) {      // 敵の左側はすべて Dead
                    return true;
                }
            }
            else {
                // 同一座標はセーフ
            }
        };

        const checkV = () => {
            if (sy < ey) {          // 自分が敵の上側
                if (ey < my) {      // 敵の下側はすべて Dead
                    return true;
                }
            }
            else if (ey < sy) {     // 自分が敵の下側
                if (my < ey) {      // 敵の上側はすべて Dead
                    return true;
                }
            }
            else {
                // 同一座標はセーフ
            }
        };

        if (UMovement.distanceSq(sx, sy, mx, my) <= UMovement.distanceSq(ex, ey, mx, my)) {
            return false;
        }
        
        if (dx > dy) {
            if (checkH()) return true;
        }
        else if (dx < dy) {
            if (checkV()) return true;
        }
        else {
            if (checkH()) return true;
            if (checkV()) return true;
        }

        return false;
    }
    
    public thinkMoving(context: SCommandContext, self: LEntity): SPhaseResult {

        
        const target = this.findInSightNearlyHostileEntity(self);
        if (target/* && !target.entityId().equals(this._targetEntityId)*/) {

            //this._targetEntityId = target.entityId().clone();

            const block = REGame.map.block(self.x, self.y);
            const room = REGame.map.room(block._roomId);
            const doorway = room.doorwayBlocks()
                .filter(b => !this.checkDeadInArea(self, target, b.x(), b.y()))
                .selectMin((a, b) => UMovement.distanceSq(a.x(), a.y(), b.x(), b.y()));
            if (doorway) {
                // 相手に対して、背面等に通路がある。そこへ逃げ込む。
                this._movingHelper.setTargetPosition(doorway.x(), doorway.y());
            }
            else {
                // 相手が通路側に立ちふさがっている場合など

                const rdir = SAIHelper.entityDistanceToDir(target, self);
                const dir = SAIHelper.entityDistanceToDir(self, target);
                
                // まず背面にまったく移動できないかチェック
                const blocks = UMovement.getWay3FrontBlocks(self, rdir);
                if (!blocks.find(b => UMovement.checkPassageBlockToBlock(self, block, b, MovingMethod.Walk))) {

                    if (!UMovement.checkAdjacent(self.x, self.y, target.x, target.y)) {
                        // 隣接していなければ相手を向いて待機
                        context.postActivity(
                            LActivity.make(self)
                            .withEntityDirection(dir)
                            .withConsumeAction());
                        return SPhaseResult.Handled;
                    }
                    else {
                        // 観念して通常の移動を行う
                        const doorway = context.random().selectOrUndefined(room.doorwayBlocks());
                        if (doorway) {
                            // 出口を目的地設定して移動
                            this._movingHelper.setTargetPosition(doorway.x(), doorway.y());
                        }
                        else {
                            // 出口の内部屋。通常の移動プロセスにしたがう
                        }
                    }
                }
                else {
                    // 左折の法則で逆方向に逃げる
                    const block2 = UMovement.getMovingCandidateBlockAsLHRule(self, rdir);
                    if (block2) {
                        context.postActivity(
                            LActivity.makeMoveToAdjacentBlock(self, block2)
                            .withEntityDirection(rdir)
                            .withConsumeAction());
                        return SPhaseResult.Handled;
                    }
                    else {
                        throw new Error("Unreachable");
                    }
                }
                
                
                /*
                const dir = SAIHelper.entityDistanceToDir(target, self);
                if (UMovement.checkPassageToDir(self, dir)) {
                    context.postActivity(
                        LActivity.makeMoveToAdjacent(self, dir)
                        .withEntityDirection(dir)
                        .withConsumeAction());
                    return SPhaseResult.Handled;
                }
                */

            }
            

        }

        if (this._movingHelper.thinkMoving(self, context)) {
            return SPhaseResult.Handled;
        }

        
        // ここまで来てしまったら待機。
        context.postActivity(
            LActivity.make(self)
            .withConsumeAction());
        return SPhaseResult.Handled;
    }
    
    public thinkAction(context: SCommandContext, self: LEntity): SPhaseResult {
        // 攻撃の成否に関わらず行動を消費する。
        context.postConsumeActionToken(self);
        return SPhaseResult.Handled;
    }
}
