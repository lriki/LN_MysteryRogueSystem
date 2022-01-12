import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "./../LEntity";
import { LCharacterAI } from "./LCharacterAI";
import { LActionDeterminer } from "./LActionDeterminer";
import { LMoveDeterminer, LMovingMethod } from "./LMoveDeterminer";
import { RESerializable } from "ts/re/Common";
import { DPrefabMoveType } from "ts/re/data/DPrefab";
import { LMovingTargetFinder, LMovingTargetFinder_Item } from "./LMovingTargetFinder";
import { LActionTokenType } from "../LActionToken";

/**
 * https://yttm-work.jp/game_ai/game_ai_0001.html
 * https://wiki.denfaminicogamer.jp/ai_wiki/%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BCAI
 */
@RESerializable
export class LCharacterAI_Normal extends LCharacterAI {
    

    private _moveDeterminer = new LMoveDeterminer();
    private _actionDeterminer = new LActionDeterminer();
    private _movingTargetFinder: (LMovingTargetFinder | undefined);

    public clone(): LCharacterAI {
        const i = new LCharacterAI_Normal();
        i._moveDeterminer = this._moveDeterminer.clone();
        i._actionDeterminer = this._actionDeterminer.clone();
        return i;
    }

    public setMovingTargetFinder(value: LMovingTargetFinder | undefined): void {
        this._movingTargetFinder = value;
    }

    public thinkMoving(cctx: SCommandContext, self: LEntity): SPhaseResult {


        const hasPrimaryTarget = this._actionDeterminer.hasPrimaryTarget();
        
        this._actionDeterminer.decide(cctx, self);

        this.applyTargetPosition(self, hasPrimaryTarget);

        this._moveDeterminer.decide(cctx, self);

        // moveDeterminer.decide によって決定された標準的な移動目標のオーバーライド
        {
            // 今回の decide() ではスキル使用が行われず移動が要求されている場合、
            // まずは特殊な移動先検索を実施してみる。
            if (this._actionDeterminer.isMoveRequested() && this._movingTargetFinder) {
                const pos = this._movingTargetFinder.decide(self);
                if (pos) {
                    this._moveDeterminer.setTargetPosition(pos[0], pos[1]);
                    this._moveDeterminer._decired = { method: LMovingMethod.ToTarget };
                }
            }
        }

        // 攻撃対象が設定されていれば、このフェーズでは何もしない
        if (this._actionDeterminer.isMajorActionRequested()) {
            return SPhaseResult.Pass;
        }
        

        // 移動メイン
        if (self.data().prefab().moveType == DPrefabMoveType.Random) {
            if (this._moveDeterminer.perform(cctx, self)) {
                return SPhaseResult.Handled;
            }
        }

        // ここまで来たら、攻撃対象も無いうえに移動ができなかったということ。
        // 例えば、壁に埋まっている状態。

        // FIXME: ここでやるのが最善かわからないが、攻撃対象が決められていない場合は
        // Major Phase でも行動消費するアクションがとれないので、ハングアップしてしまう。
        // ここで消費しておく。
        if (self._actionToken.canMajorAction()) {
            cctx.postConsumeActionToken(self, LActionTokenType.Major);
        }
        else {
            cctx.postConsumeActionToken(self, LActionTokenType.Minor);
        }
        return SPhaseResult.Handled;
    }

    private applyTargetPosition(self: LEntity, prevHasPrimaryTarget: boolean): void {


        if (this._actionDeterminer.hasPrimaryTarget()) {
            // 攻撃対象が設定されていれば、常に目標座標を更新し続ける
            const target = this._actionDeterminer.primaryTarget();
            this._moveDeterminer.setTargetPosition(target.x, target.y);
        }
        else if (prevHasPrimaryTarget != this._actionDeterminer.hasPrimaryTarget()) {
            // decide() によってこれまでの PrimaryTarget を見失った
            this._moveDeterminer.setTargetPosition(-1, -1);
        }
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
                .immutableSort((a, b) => Helpers.getDistance(self, a) - Helpers.getDistance(self, b))
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
    
    public thinkAction(cctx: SCommandContext, self: LEntity): SPhaseResult {
        if (this._actionDeterminer.perform(cctx, self)) {
            return SPhaseResult.Handled;
        }
        return SPhaseResult.Pass;
    }

}
