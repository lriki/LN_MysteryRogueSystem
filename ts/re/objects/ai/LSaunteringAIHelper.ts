import { assert, RESerializable } from "ts/re/Common";
import { Helpers } from "ts/re/system/Helpers";
import { SAIHelper } from "ts/re/system/SAIHelper";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UMovement } from "ts/re/usecases/UMovement";
import { LActivity } from "../activities/LActivity";
import { LActionTokenType } from "../LActionToken";
import { LBlock } from "../LBlock";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";

@RESerializable
export class LSaunteringAIHelper {
    // モンスターの移動と目的地
    // http://twist.jpn.org/sfcsiren/index.php?%E3%83%A2%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%BC%E3%81%AE%E7%A7%BB%E5%8B%95%E3%81%A8%E7%9B%AE%E7%9A%84%E5%9C%B0
    
    // 移動ターゲットとなる座標。攻撃対象だけではなく、部屋の入り口などを示すこともある。
    private _targetPositionX: number = -1;
    private _targetPositionY: number = -1;
    
    // 移動できなかったカウント
    private _noActionTurnCount: number = 0;

    public clone(): LSaunteringAIHelper {
        const i = new LSaunteringAIHelper();
        i._targetPositionX = this._targetPositionX;
        i._targetPositionY = this._targetPositionY;
        i._noActionTurnCount = this._noActionTurnCount;
        return i;
    }

    public setTargetPosition(mx: number, my: number): void {
        this._targetPositionX = mx;
        this._targetPositionY = my;
    }

    public thinkMoving(self: LEntity, cctx: SCommandContext): boolean {
        const result = this.thinkMovingCore(self, cctx);
        if (result) {
            
            // 移動後、向きを target へ向けておく
            if (this.hasDestination()) {
                // 移動後、向きを target へ向けておく
                const dir = SAIHelper.distanceToDir(self.x, self.y, this._targetPositionX, this._targetPositionY);
                cctx.postActivity(LActivity.makeDirectionChange(self, dir));
            }
        }
        return result;
    }

    public thinkMovingCore(self: LEntity, cctx: SCommandContext): boolean {
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
                        const block = candidates[cctx.random().nextIntWithMax(candidates.length)];
                        this._targetPositionX = block.mx;
                        this._targetPositionY = block.my;
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
                    
    
                    const candidates = room.doorwayBlocks().filter(b => b.mx != self.x && b.my != self.y);    // 足元フィルタ
                    if (candidates.length > 0) {
                        const block = candidates[cctx.random().nextIntWithMax(candidates.length)];
                        this._targetPositionX = block.mx;
                        this._targetPositionY = block.my;
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
                moveToPassageWay = blocks[cctx.random().nextIntWithMax(blocks.length)];
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
            if (this.moveToTarget(self, cctx)) {
                return true;
            }
            else {
                // 壁際を斜め移動しようとした等、移動できなかった
                moveToLHRule = true;
            }
        }

        if (moveToPassageWay) {
            this.postMoveToAdjacent(self, moveToPassageWay, cctx);
            return true;
        }

        // 左折の法則による移動
        if (moveToLHRule) {
            const dir = this.hasDestination() ? SAIHelper.distanceToDir(self.x, self.y, this._targetPositionX, this._targetPositionY) : self.dir;
            const block = UMovement.getMovingCandidateBlockAsLHRule(self, dir);
            if (block) {
                this.postMoveToAdjacent(self, block, cctx);


                return true;
            }
        }

        this._noActionTurnCount++;
        if (this._noActionTurnCount >= 6) {
            // 6連続で移動できなかったときはランダム移動
            const candidates = UMovement.getMovableAdjacentTiles(self);
            if (candidates.length > 0) {
                const block = candidates[cctx.random().nextIntWithMax(candidates.length)];
                this.postMoveToAdjacent(self, block, cctx);
                this._noActionTurnCount = 0;
                return true;
            }
        }

        return false;
    }
    
    // 目的地あり？
    private hasDestination(): boolean {
        return this._targetPositionX >= 0 && this._targetPositionY >= 0;
    }

    private canModeToTarget(self: LEntity): boolean {
        return this.hasDestination() && (self.x != this._targetPositionX || self.y != this._targetPositionY);
    }

    private moveToTarget(self: LEntity, cctx: SCommandContext): boolean {
        // 目的地設定済みで、未到達であること
        assert(this.canModeToTarget(self));

        const dir = SAIHelper.distanceToDir(self.x, self.y, this._targetPositionX, this._targetPositionY);
        if (dir != 0 && UMovement.checkPassageToDir(self, dir)) {
            cctx.postActivity(LActivity.makeDirectionChange(self, dir));
            cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
            //this.moveToAdjacent(self, block, cctx);
            cctx.postConsumeActionToken(self, LActionTokenType.Minor);
            return true;
        }
        else {
            return false;
        }
    }
    
    private postMoveToAdjacent(self: LEntity, block: LBlock, cctx: SCommandContext): void {
        const dir = Helpers.offsetToDir(block.mx - self.x, block.my - self.y);
        cctx.postActivity(LActivity.makeDirectionChange(self, dir));
        cctx.postActivity(LActivity.makeMoveToAdjacent(self, dir));
        cctx.postConsumeActionToken(self,LActionTokenType.Minor);
    }
}
