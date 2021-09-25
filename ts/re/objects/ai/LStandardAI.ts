import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "./../LEntity";
import { LCharacterAI } from "./LCharacterAI";
import { LActionDeterminer } from "./LActionDeterminer";
import { LMoveDeterminer } from "./LMoveDeterminer";
import { RESerializable } from "ts/re/Common";
import { DPrefabMoveType } from "ts/re/data/DPrefab";

/**
 * https://yttm-work.jp/game_ai/game_ai_0001.html
 * https://wiki.denfaminicogamer.jp/ai_wiki/%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BCAI
 */
@RESerializable
export class LCharacterAI_Normal extends LCharacterAI {
    

    private _moveDeterminer = new LMoveDeterminer();
    private _actionDeterminer = new LActionDeterminer();

    public clone(): LCharacterAI {
        const i = new LCharacterAI_Normal();
        i._moveDeterminer = this._moveDeterminer.clone();
        i._actionDeterminer = this._actionDeterminer.clone();
        return i;
    }

    public thinkMoving(context: SCommandContext, self: LEntity): SPhaseResult {


        const hasPrimaryTarget = this._actionDeterminer.hasPrimaryTarget();
        
        this._actionDeterminer.decide(context, self);


        if (this._actionDeterminer.hasPrimaryTarget()) {
            // 攻撃対象が設定されていれば、常に目標座標を更新し続ける
            const target = this._actionDeterminer.primaryTarget();
            this._moveDeterminer.setTargetPosition(target.x, target.y);
        }
        else {
            if (hasPrimaryTarget != this._actionDeterminer.hasPrimaryTarget()) {
                this._moveDeterminer.setTargetPosition(-1, -1);
            }
        }

        // 攻撃対象が設定されていれば、このフェーズでは何もしない
        if (this._actionDeterminer.isMajorActionRequested()) {
            return SPhaseResult.Pass;
        }
        

        // 移動メイン
        if (self.data().prefab().moveType == DPrefabMoveType.Random) {
            if (this._moveDeterminer.perform(context, self)) {
                return SPhaseResult.Handled;
            }
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
    
    public thinkAction(context: SCommandContext, self: LEntity): SPhaseResult {
        if (this._actionDeterminer.perform(context, self)) {
            return SPhaseResult.Handled;
        }
        return SPhaseResult.Pass;
    }

}
