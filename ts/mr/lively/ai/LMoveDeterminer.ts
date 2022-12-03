import { assert, MRSerializable } from "ts/mr/Common";
import { Helpers } from "ts/mr/system/Helpers";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UMovement } from "ts/mr/utility/UMovement";
import { LActivity } from "../activities/LActivity";
import { LBlock } from "../LBlock";
import { LActionTokenConsumeType } from "../LCommon";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";

export enum LMovingMethod {
    ToTarget,
    LHRule,
}

export interface LUpdateMovingTargetResult {
    method: LMovingMethod;
    passageway?: LBlock;
}

@MRSerializable
export class LMoveDeterminer {
    
    // 移動ターゲットとなる座標。
    // _primaryTargetEntity ではなく、部屋の入り口などを示すこともある。
    private _targetPositionX: number = -1;
    private _targetPositionY: number = -1;

    private _noActionTurnCount: number = 0;

    /*private*/ _decired: LUpdateMovingTargetResult = { method: LMovingMethod.LHRule };
    
    public clone(): LMoveDeterminer {
        const i = new LMoveDeterminer();
        i._targetPositionX = this._targetPositionX;
        i._targetPositionY = this._targetPositionY;
        i._noActionTurnCount = this._noActionTurnCount;
        return i;
    }
    
    // decide() の後に呼び出すことで、通常の移動処理の目標位置をオーバーライドできる。
    public setTargetPosition(x: number, y: number): void {
        this._targetPositionX = x;
        this._targetPositionY = y;
    }

    public decide(cctx: SCommandContext, self: LEntity): void {
        const rand = cctx.random();
        const block = MRLively.camera.currentMap.block(self.mx, self.my);

        if (!this.hasDestination()) {
            if (!block.isRoom()) {
                // 目的地なし, 現在位置が通路・迷路
                // => 左折の法則による移動
                this._decired = { method: LMovingMethod.LHRule };
                return;
            }
            else {
                const room = MRLively.camera.currentMap.room(block._roomId);
                if (!block.isRoomInnerEntrance()) {
                    // 目的地なし, 現在位置が部屋
                    // => ランダムな入口を目的地に設定し、目的地に向かう移動。
                    // => 入口が無ければ左折の法則による移動

                    const candidates = room.getRoomInnerEntranceBlocks();
                    if (candidates.length > 0) {
                        const block = candidates[rand.nextIntWithMax(candidates.length)];
                        this._targetPositionX = block.mx;
                        this._targetPositionY = block.my;
                        this._decired = { method: LMovingMethod.ToTarget };
                        return;
                    }
                    else {
                        // 入り口のない部屋。左折の法則による移動を継続する。
                        this._decired = { method: LMovingMethod.LHRule };
                        return;
                    }
                }
                else {
                    // 目的地なし, 現在位置が部屋の入口
                    // => 現在位置以外のランダムな入口を目的地に設定し、左折の法則による移動
                    // => 他に入口がなければ逆方向を向き、左折の法則による移動
    
                    const candidates = room.getRoomInnerEntranceBlocks().filter(b => b.mx != self.mx && b.my != self.my);    // 足元フィルタ
                    if (candidates.length > 0) {
                        const block = candidates[rand.nextIntWithMax(candidates.length)];
                        this._targetPositionX = block.mx;
                        this._targetPositionY = block.my;
                    }
                    else {
                        self.dir = UMovement.reverseDir(self.dir);
                    }

                    this._decired = { method: LMovingMethod.LHRule };
                    return;
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
                this._decired = { method: LMovingMethod.ToTarget, passageway: blocks[rand.nextIntWithMax(blocks.length)] };
                return;
            }
            else {
                this._decired = { method: LMovingMethod.LHRule };
                return;
            }
        }
        else {
            // 目的地あり 目的地が現在位置でない
            // => 目的地に向かう移動 (moveToTarget() で移動)
            this._decired = { method: LMovingMethod.ToTarget };
            return;
        }
    }
    
    /**
     * 移動実行
     */
    public perform(cctx: SCommandContext, self: LEntity): boolean {
        if (this.performInternal(cctx, self)) {
            this._noActionTurnCount  = 0;
            return true;
        }
        return false;
    }

    // 
    private performInternal(cctx: SCommandContext, self: LEntity): boolean {

        // 目的地設定がなされてるのであればそこへ向かって移動する
        if (this.canModeToTarget(self)) {
            if (this.moveToTarget(self, cctx)) {
                return true;
            }
            else {
                // 壁際を斜め移動しようとした等、移動できなかった
                this._decired.method = LMovingMethod.LHRule;
            }
        }

        if (this._decired.passageway) {
            this.postMoveToAdjacent(self, this._decired.passageway, cctx);
            return true;
        }

        // 左折の法則による移動
        if (this._decired.method == LMovingMethod.LHRule) {
            const block = UMovement.getMovingCandidateBlockAsLHRule(self, self.dir);
            if (block) {
                this.postMoveToAdjacent(self, block, cctx);

                // 移動後、向きの修正
                const dir = (this.hasDestination()) ?
                    SAIHelper.distanceToDir(self.mx, self.my, this._targetPositionX, this._targetPositionY) : // 目標があるならそちらを向ける
                    UMovement.getLookAtDirFromPos(self.mx, self.my, block.mx, block.my);                    // 目標が無ければ進行方向を向く
                cctx.postActivity(LActivity.makeDirectionChange(self, dir));

                return true;
            }
        }


        if (this.hasDestination() &&
            self.mx == this._targetPositionX &&
            self.my == this._targetPositionY) {
            // 目標座標が指定されているが既に到達済みの場合は、ランダム移動を行わない。
            // 店主など、明示的に移動させない Entity が該当する。
            return true;
        }

        this._noActionTurnCount++;
        if (this._noActionTurnCount >= 6) {
            // 6連続で移動できなかったときはランダム移動
            const candidates = UMovement.getMovableAdjacentTiles(self);
            if (candidates.length > 0) {
                const block = candidates[cctx.random().nextIntWithMax(candidates.length)];
                this.postMoveToAdjacent(self, block, cctx);
                return true;
            }
        }

        return false;
    }

    private canModeToTarget(self: LEntity): boolean {
        return this.hasDestination() && (self.mx != this._targetPositionX || self.my != this._targetPositionY);
    }

    private moveToTarget(self: LEntity, cctx: SCommandContext): boolean {
        // 目的地設定済みで、未到達であること
        assert(this.canModeToTarget(self));

        const dir = SAIHelper.distanceToDir(self.mx, self.my, this._targetPositionX, this._targetPositionY);
        if (dir != 0 && UMovement.checkPassageToDir(self, dir)) {
            cctx.postActivity(LActivity.makeDirectionChange(self, dir));
            cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            //this.moveToAdjacent(self, block, cctx);
            cctx.postConsumeActionToken(self, LActionTokenConsumeType.MinorActed);
            return true;
        }
        else {
            return false;
        }
    }
    
    private postMoveToAdjacent(self: LEntity, block: LBlock, cctx: SCommandContext): void {
        const dir = Helpers.offsetToDir(block.mx - self.mx, block.my - self.my);
        cctx.postActivity(LActivity.makeDirectionChange(self, dir));
        cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
        cctx.postConsumeActionToken(self, LActionTokenConsumeType.MinorActed);
    }

    // 目的地あり？
    public hasDestination(): boolean {
        return this._targetPositionX >= 0 && this._targetPositionY >= 0;
    }

}
