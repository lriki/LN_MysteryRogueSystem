import { SPhaseResult } from "ts/mr/system/SCommand";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UAction } from "ts/mr/usecases/UAction";
import { UMovement } from "ts/mr/usecases/UMovement";
import { LActivity } from "../activities/LActivity";
import { LCharacterAI } from "./LCharacterAI";
import { LEntity } from "../LEntity";
import { MovingMethod } from "../LMap";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LSaunteringAIHelper } from "./LSaunteringAIHelper";
import { MRSerializable } from "ts/mr/Common";
import { LActionTokenType } from "../LActionToken";
import { LMoveDeterminer } from "./LMoveDeterminer";
import { LActionTokenConsumeType } from "../LCommon";

@MRSerializable
export class LEscapeAI extends LCharacterAI {
    private _moveDeterminer = new LMoveDeterminer();
    // private _movingHelper: LSaunteringAIHelper;
    // private _targetEntityId: LEntityId;

    public constructor() {
        super();
        // this._movingHelper = new LSaunteringAIHelper();
        // this._targetEntityId = LEntityId.makeEmpty();
    }

    public clone(): LCharacterAI {
        const i = new LEscapeAI();
        return i;
    }

    // (mx, my) は subject から見て、hostileEntity の背面(向こう側)にあるかを判断する。
    // そっちの方向には行きたくない判断に使う。
    private checkDeadInArea(subject: LEntity, hostileEntity: LEntity, mx: number, my: number): boolean {
        const sx = subject.mx;
        const sy = subject.my;
        const ex = hostileEntity.mx;
        const ey = hostileEntity.my;
        const dx = Math.abs(sx - ex);
        const dy = Math.abs(sy - ey);

        const checkH = () => {
            if (sx < ex) {          // 自分が敵の左側
                if (ex <= mx) {      // 相手の立っている位置とその右側はすべて Dead
                    return true;
                }
            }
            else if (ex < sx) {     // 自分が敵の右側
                if (mx <= ex) {      // 相手の立っている位置とその左側はすべて Dead
                    return true;
                }
            }
            else {
                // 同一座標はセーフ
            }
        };

        const checkV = () => {
            if (sy < ey) {          // 自分が敵の上側
                if (ey <= my) {      // 相手の立っている位置とその下側はすべて Dead
                    return true;
                }
            }
            else if (ey < sy) {     // 自分が敵の下側
                if (my <= ey) {      // 相手の立っている位置とその上側はすべて Dead
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
    
    public thinkMoving(cctx: SCommandContext, self: LEntity): SPhaseResult {

        this._moveDeterminer.decide(cctx, self);
        
        const target = UAction.findInSightNearlyHostileEntity(self);
        if (target/* && !target.entityId().equals(this._targetEntityId)*/) {

            //this._targetEntityId = target.entityId().clone();

            const block = REGame.map.block(self.mx, self.my);
            const room = REGame.map.room(block._roomId);

            // 
            const doorway = room.doorwayBlocks()
                .filter(b =>
                    !this.checkDeadInArea(self, target, b.mx, b.my) &&    // block は敵対の向こう側にあるのでそっちは除外
                    (b.mx != self.mx || b.my != self.my))                   // 足元は除外
                .selectMin((a, b) => UMovement.distanceSq(a.mx, a.my, b.mx, b.my));
                
            if (doorway) {
                // 相手に対して、背面等に通路がある。そこへ逃げ込む。
                //this._movingHelper.setTargetPosition(doorway.x(), doorway.y());
                this._moveDeterminer.setTargetPosition(doorway.mx, doorway.my);
            }
            else {
                // 相手が通路側に立ちふさがっている場合など

                const rdir = SAIHelper.entityDistanceToDir(target, self);
                const dir = SAIHelper.entityDistanceToDir(self, target);
                
                // まず背面にまったく移動できないかチェック
                const blocks = UMovement.getWay3FrontBlocks(self, rdir);
                if (!blocks.find(b => UMovement.checkPassageBlockToBlock(self, block, b, MovingMethod.Walk))) {

                    if (!UMovement.checkAdjacentPositions(self.mx, self.my, target.mx, target.my)) {
                        // 隣接していなければ相手を向いて待機。
                        // 消費 Token を Major にしてしまうと、倍速1回行動の時に上手く動かないので Minor で消費する。
                        cctx.postActivity(
                            LActivity.make(self)
                            .withEntityDirection(dir)
                            .withConsumeAction(LActionTokenConsumeType.MinorActed));
                        return SPhaseResult.Handled;
                    }
                    else {
                        // 観念して通常の移動を行う
                        const doorway = cctx.random().selectOrUndefined(room.doorwayBlocks());
                        if (doorway) {
                            // 出口を目的地設定して移動
                            this._moveDeterminer.setTargetPosition(doorway.mx, doorway.my);
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
                        cctx.postActivity(
                            LActivity.makeMoveToAdjacentBlock(self, block2)
                            .withEntityDirection(rdir)
                            .withConsumeAction(LActionTokenConsumeType.MinorActed));
                        return SPhaseResult.Handled;
                    }
                    else {
                        throw new Error("Unreachable");
                    }
                }
                
                
                /*
                const dir = SAIHelper.entityDistanceToDir(target, self);
                if (UMovement.checkPassageToDir(self, dir)) {
                    cctx.postActivity(
                        LActivity.makeMoveToAdjacent(self, dir)
                        .withEntityDirection(dir)
                        .withConsumeAction());
                    return SPhaseResult.Handled;
                }
                */

            }
            

        }

        // if (this._movingHelper.thinkMoving(self, cctx)) {
        //     return SPhaseResult.Handled;
        // }
        if (this._moveDeterminer.perform(cctx, self)) {
            return SPhaseResult.Handled;
        }

        
        // ここまで来てしまったら待機。
        cctx.postActivity(
            LActivity.make(self)
            .withConsumeAction(LActionTokenConsumeType.WaitActed));
        return SPhaseResult.Handled;
    }
    
    public thinkAction(cctx: SCommandContext, self: LEntity): SPhaseResult {
        // この AI は逃げるだけで MajorAction はとらないため、なにもしない
        return SPhaseResult.Pass;
        // 攻撃の成否に関わらず行動を消費する。
        //cctx.postConsumeActionToken(self, LActionTokenType.Major);
        //return SPhaseResult.Handled;
    }
}