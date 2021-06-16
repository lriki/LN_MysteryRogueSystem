import { assert } from "ts/Common";
import { DEffectFieldScopeRange } from "ts/data/DEffect";
import { REData } from "ts/data/REData";
import { Helpers } from "ts/system/Helpers";
import { SPhaseResult } from "ts/system/RECommand";
import { RESystem } from "ts/system/RESystem";
import { SAIHelper } from "ts/system/SAIHelper";
import { SCommandContext } from "ts/system/SCommandContext";
import { SMovementCommon } from "ts/system/SMovementCommon";
import { LDirectionChangeActivity } from "./activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "./activities/LMoveAdjacentActivity";
import { LBlock } from "./LBlock";
import { LEntity } from "./LEntity";
import { LEntityId } from "./LObject";
import { REGame } from "./REGame";

/**
 * https://yttm-work.jp/game_ai/game_ai_0001.html
 * https://wiki.denfaminicogamer.jp/ai_wiki/%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BCAI
 */
export class LCharacterAI {
    
    private _targetPositionX: number = -1;
    private _targetPositionY: number = -1;
    private _attackTargetEntityId: LEntityId = LEntityId.makeEmpty();
    private _noActionTurnCount: number = 0;

    public clone(): LCharacterAI {
        const i = new LCharacterAI();
        i._targetPositionX = this._targetPositionX;
        i._targetPositionY = this._targetPositionY;
        i._attackTargetEntityId = this._attackTargetEntityId.clone();
        i._noActionTurnCount = this._noActionTurnCount;
        return i;
    }

    public thinkMoving(self: LEntity, context: SCommandContext): SPhaseResult {


        // http://twist.jpn.org/sfcsiren/index.php?%E3%82%BF%E3%83%BC%E3%83%B3%E3%81%AE%E9%A0%86%E7%95%AA
        // の移動目標位置決定はもう少し後の Phase なのだが、敵対 Entity への移動目標位置決定はこの Phase で行う。
        // こうしておかないと、Player の移動を追うように Enemy が移動できなくなる。
        {
            // 同じ部屋にいる敵対 Entity のうち、一番近い Entity を検索
            const target = REGame.map.getVisibilityEntities(self)
                .filter(e => Helpers.isHostile(self, e))
                .sort((a, b) => Helpers.getDistance(self, a) - Helpers.getDistance(self, b))
                .find(e => Helpers.isHostile(self, e));
            if (target) {
                this._targetPositionX = target.x;
                this._targetPositionY = target.y;
            }
            else {
                //console.log("NotImplemented.");
                //this._targetPositionX = -1;
                //this._targetPositionY = -1;
            }
        
            if (target) {
                const targetBlock = REGame.map.block(target.x, target.y);
                // target は最も近い Entity となっているので、これと隣接しているか確認し、攻撃対象とする
                // TODO: このあたり、遠距離攻撃モンスターとかは変わる
                if (LCharacterAI.checkAdjacentDirectlyAttack(self, target) &&
                    targetBlock &&!targetBlock.checkPurifier(self)) {     // 聖域の巻物とか無ければ隣接攻撃可能。
                    this._attackTargetEntityId = target.entityId();
                }
                else {
                    this._attackTargetEntityId = LEntityId.makeEmpty();
    
                    // 見失ったときも targetPosition は維持
                }

            }

        }

        

        
        // 攻撃対象が設定されていれば、このフェーズでは何もしない
        if (this._attackTargetEntityId.hasAny()) {
            return SPhaseResult.Pass;
        }
        

        // 移動メイン
        if (this.thinkMoving_Search(self, context)) {
            this._noActionTurnCount = 0;
            return SPhaseResult.Handled;
        }

        // ここまで来たら、攻撃対象も無いうえに移動ができなかったということ。
        // 例えば、壁に埋まっている状態。

        // FIXME: ここでやるのが最善かわからないが、攻撃対象が決められていない場合は
        // Major Phase でも行動消費するアクションがとれないので、ハングアップしてしまう。
        // ここで消費しておく。
        context.postConsumeActionToken(self);
        return SPhaseResult.Handled;
    
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

    /*
    private updateSituation(self: LEntity): void {

        // http://twist.jpn.org/sfcsiren/index.php?%E3%82%BF%E3%83%BC%E3%83%B3%E3%81%AE%E9%A0%86%E7%95%AA
        // の移動目標位置決定はもう少し後の Phase なのだが、敵対 Entity への移動目標位置決定はこの Phase で行う。
        // こうしておかないと、Player の移動を追うように Enemy が移動できなくなる。
        {
            // 同じ部屋にいる敵対 Entity のうち、一番近い Entity を検索
            const roomId = REGame.map.roomId(self);
            const target = REGame.map.entitiesInRoom(roomId)
                .filter(e => Helpers.isHostile(self, e))
                .sort((a, b) => Helpers.getDistance(self, a) - Helpers.getDistance(self, b))
                .find(e => Helpers.isHostile(self, e));
            if (target) {
                this._targetPositionX = target.x;
                this._targetPositionY = target.y;
                
                // target は最も近い Entity となっているので、これと隣接しているか確認し、攻撃対象とする
                if (Helpers.checkAdjacent(self, target)) {
                    this._attackTargetEntityId = target.entityId();
                }

                return;
            }



            // target がひとつも見つからなければ、探索移動モード

            const block = REGame.map.block(self.x, self.y);
            if (!this.hasDestination()) {
                if (!block.isRoom()) {
                    // 目的地なし, 現在位置が通路・迷路
                    // => 左折の法則による移動
                }
            }


            
            else {
                console.log("NotImplemented.");
                this._targetPositionX = -1;
                this._targetPositionY = -1;




            }
        }
    }
    */

    // 目的地あり？
    private hasDestination(): boolean {
        return this._targetPositionX >= 0 && this._targetPositionY >= 0;
    }

    // 
    private thinkMoving_Search(self: LEntity, context: SCommandContext): boolean {
        let moveToLHRule = false;
        let moveToPassageWay: LBlock | undefined;
        const block = REGame.map.block(self.x, self.y);

        if (!this.hasDestination()) {
            if (!block.isRoom()) {
                // 目的地なし, 現在位置が通路・迷路
                // => 左折の法則による移動
                moveToLHRule = true;
            }
            else {
                const room = REGame.map.room(block._roomId);
                if (!block.isDoorway()) {
                    // 目的地なし, 現在位置が部屋
                    // => ランダムな入口を目的地に設定し、目的地に向かう移動。
                    // => 入口が無ければ左折の法則による移動

                    const candidates = room.doorwayBlocks();
                    if (candidates.length > 0) {
                        const block = candidates[context.random().nextIntWithMax(candidates.length)];
                        this._targetPositionX = block.x();
                        this._targetPositionY = block.y();
                    }
                    else {
                        // 入り口のない部屋。左折の法則による移動を継続する。
                        moveToLHRule = true;
                    }
                }
                else {
                    // 目的地なし, 現在位置が部屋の入口
                    // => 現在位置以外のランダムな入口を目的地に設定し、左折の法則による移動
                    // => 他に入口がなければ逆方向を向き、左折の法則による移動
                    moveToLHRule = true;
                    
    
                    const candidates = room.doorwayBlocks().filter(b => b.x() != self.x && b.y() != self.y);    // 足元フィルタ
                    if (candidates.length > 0) {
                        const block = candidates[context.random().nextIntWithMax(candidates.length)];
                        this._targetPositionX = block.x();
                        this._targetPositionY = block.y();
                    }
                    else {
                        self.dir = SMovementCommon.reverseDir(self.dir);
                    }
                }
            } 
        }
        else if (!this.canModeToTarget(self)) {
            // 目的地あり 目的地が現在位置
            // => 目的地を解除し、左折の法則による移動
            this._targetPositionX = -1;
            this._targetPositionY = -1;

            // これは SFC シレン Wiki には乗っていない細工。
            // 部屋内から目的地にたどり着いたとき、現在の向きと通路の方向が直角だと、左折の法則で通路に侵入できなくなる。
            // 対策として、このときは隣接している通路ブロックへの移動を優先する。
            const blocks = SMovementCommon.getMovableAdjacentTiles(self).filter(b => b.isPassageway());
            if (blocks.length > 0) {
                moveToPassageWay = blocks[context.random().nextIntWithMax(blocks.length)];
            }
            else {
                moveToLHRule = true;
            }
        }
        else {
            // 目的地あり 目的地が現在位置でない
            // => 目的地に向かう移動 (moveToTarget() で移動)
        }

        // 目的地設定がなされてるのであればそこへ向かって移動する
        if (this.canModeToTarget(self)) {
            if (this.moveToTarget(self, context)) {
                return true;
            }
            else {
                // 壁際を斜め移動しようとした等、移動できなかった
                moveToLHRule = true;
            }
        }

        if (moveToPassageWay) {
            this.postMoveToAdjacent(self, moveToPassageWay, context);
            return true;
        }

        // 左折の法則による移動
        if (moveToLHRule) {
            const block = SMovementCommon.getMovingCandidateBlockAsLHRule(self);
            if (block) {
                this.postMoveToAdjacent(self, block, context);

                // 移動後、向きを target へ向けておく
                const dir = SAIHelper.distanceToDir(self.x, self.y, this._targetPositionX, this._targetPositionY);
                context.postActivity(LDirectionChangeActivity.make(self, dir));

                return true;
            }
        }

        this._noActionTurnCount++;
        if (this._noActionTurnCount >= 6) {
            // 6連続で移動できなかったときはランダム移動
            const candidates = SMovementCommon.getMovableAdjacentTiles(self);
            if (candidates.length > 0) {
                const block = candidates[context.random().nextIntWithMax(candidates.length)];
                this.postMoveToAdjacent(self, block, context);
                this._noActionTurnCount = 0;
                return true;
            }
        }

        return false;
    }

    private canModeToTarget(self: LEntity): boolean {
        return this.hasDestination() && (self.x != this._targetPositionX || self.y != this._targetPositionY);
    }

    private moveToTarget(self: LEntity, context: SCommandContext): boolean {
        // 目的地設定済みで、未到達であること
        assert(this.canModeToTarget(self));

        const dir = SAIHelper.distanceToDir(self.x, self.y, this._targetPositionX, this._targetPositionY);
        if (dir != 0 && SMovementCommon.checkPassageToDir(self, dir)) {
            context.postActivity(LDirectionChangeActivity.make(self, dir));
            context.postActivity(LMoveAdjacentActivity.make(self, dir));
            //this.moveToAdjacent(self, block, context);
            context.postConsumeActionToken(self);
            return true;
        }
        else {
            return false;
        }
    }
    
    private postMoveToAdjacent(self: LEntity, block: LBlock, context: SCommandContext): void {
        const dir = Helpers.offsetToDir(block.x() - self.x, block.y() - self.y);
        context.postActivity(LDirectionChangeActivity.make(self, dir));
        context.postActivity(LMoveAdjacentActivity.make(self, dir));
        context.postConsumeActionToken(self);
    }
    
    public thinkAction(self: LEntity, context: SCommandContext): SPhaseResult {

        if (this._attackTargetEntityId.hasAny()) {

            // 通常攻撃
            {
                const target = REGame.world.entity(this._attackTargetEntityId);
                // 発動可否チェック。本当に隣接している？
                let valid = false;
                if (Helpers.checkAdjacent(self, target)) {
                    valid = true;
                }

                if (valid) {
                    const dir = SAIHelper.entityDistanceToDir(self, target);
                    
                    context.postActivity(LDirectionChangeActivity.make(self, dir));
    
                    context.postPerformSkill(self, RESystem.skills.normalAttack);
                    context.postConsumeActionToken(self);
                    return SPhaseResult.Handled;
                }
                
            }


        }
        else {

        }
        return SPhaseResult.Pass;
    }

}
