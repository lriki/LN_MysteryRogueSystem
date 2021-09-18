import { assert, RESerializable } from "ts/re/Common";
import { Helpers } from "ts/re/system/Helpers";
import { SAIHelper } from "ts/re/system/SAIHelper";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UMovement } from "ts/re/usecases/UMovement";
import { LActivity } from "../activities/LActivity";
import { LBlock } from "../LBlock";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";

@RESerializable
export class LMoveDeterminer {
    
    // 移動ターゲットとなる座標。
    // _primaryTargetEntity ではなく、部屋の入り口などを示すこともある。
    private _targetPositionX: number = -1;
    private _targetPositionY: number = -1;

    private _noActionTurnCount: number = 0;
    
    public clone(): LMoveDeterminer {
        const i = new LMoveDeterminer();
        i._targetPositionX = this._targetPositionX;
        i._targetPositionY = this._targetPositionY;
        i._noActionTurnCount = this._noActionTurnCount;
        return i;
    }
    
    public setTargetPosition(x: number, y: number): void {
        this._targetPositionX = x;
        this._targetPositionY = y;
    }
    
    public perform(context: SCommandContext, self: LEntity): boolean {
        if (this.performInternal(context, self)) {
            this._noActionTurnCount  = 0;
            return true;
        }
        return false;
    }

    // 
    private performInternal(context: SCommandContext, self: LEntity): boolean {
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
                        self.dir = UMovement.reverseDir(self.dir);
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
            const blocks = UMovement.getMovableAdjacentTiles(self).filter(b => b.isPassageway());
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
            const block = UMovement.getMovingCandidateBlockAsLHRule(self, self.dir);
            if (block) {
                this.postMoveToAdjacent(self, block, context);

                // 移動後、向きを target へ向けておく
                const dir = SAIHelper.distanceToDir(self.x, self.y, this._targetPositionX, this._targetPositionY);
                context.postActivity(LActivity.makeDirectionChange(self, dir));

                return true;
            }
        }

        this._noActionTurnCount++;
        if (this._noActionTurnCount >= 6) {
            // 6連続で移動できなかったときはランダム移動
            const candidates = UMovement.getMovableAdjacentTiles(self);
            if (candidates.length > 0) {
                const block = candidates[context.random().nextIntWithMax(candidates.length)];
                this.postMoveToAdjacent(self, block, context);
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
        if (dir != 0 && UMovement.checkPassageToDir(self, dir)) {
            context.postActivity(LActivity.makeDirectionChange(self, dir));
            context.postActivity(LActivity.makeMoveToAdjacent(self, dir));
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
        context.postActivity(LActivity.makeDirectionChange(self, dir));
        context.postActivity(LActivity.makeMoveToAdjacent(self, dir));
        context.postConsumeActionToken(self);
    }

    // 目的地あり？
    private hasDestination(): boolean {
        return this._targetPositionX >= 0 && this._targetPositionY >= 0;
    }

}
