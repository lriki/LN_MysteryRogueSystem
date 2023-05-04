import { MRSerializable } from "ts/mr/Common";
import { MRData } from "ts/mr/data/MRData";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { SEmittorPerformer } from "ts/mr/system/SEmittorPerformer";
import { LCandidateSkillAction, UAction } from "ts/mr/utility/UAction";
import { UMovement } from "ts/mr/utility/UMovement";
import { LActionTokenConsumeType } from "../LCommon";
import { LEntity } from "../entity/LEntity";
import { LEntityId } from "../LObject";
import { MRLively } from "../MRLively";

@MRSerializable
export class LActionDeterminer {
    
    // 最初のフェーズで決定する、メインの行動対象 Entity.
    // 基本的に敵対 Entity であり、移動処理のために使用する。
    // 通常の AI はここに向かって移動する。
    // 逃げ AI はここから離れるように移動する。
    private _primaryTargetEntityId: LEntityId = LEntityId.makeEmpty();
    
    // スキル適用対象。
    // 味方に回復や支援を行うモンスターは、_primaryTargetEntity で敵の方向に向かいつつ、
    // 範囲内にいる味方はこの値でターゲットする。
    // 最初のフェーズで決定したあと実査には Major フェーズで行動を起こすが、
    // そのときこの値でターゲットした対象が効果範囲を外れていた場合はもう一度 Minor と同じ試行処理を回す。
    //private _attackTargetEntityId: LEntityId = LEntityId.makeEmpty();
    private _requiredSkillAction: LCandidateSkillAction | undefined;

    public clone(): LActionDeterminer {
        const i = new LActionDeterminer();
        i._primaryTargetEntityId = this._primaryTargetEntityId.clone();

        if (this._requiredSkillAction) {
            i._requiredSkillAction = {
                action: this._requiredSkillAction.action,
                targets: this._requiredSkillAction?.targets
            };
        }
        return i;
    }

    protected setPrimaryTargetEntityId(entityId: LEntityId): void {
        this._primaryTargetEntityId = entityId;
    }

    protected setRequiredSkillAction(action: LCandidateSkillAction | undefined): void {
        this._requiredSkillAction = action;
    }

    public decide(cctx: SCommandContext, self: LEntity): void {
        
        // http://twist.jpn.org/sfcsiren/index.php?%E3%82%BF%E3%83%BC%E3%83%B3%E3%81%AE%E9%A0%86%E7%95%AA
        // の移動目標位置決定はもう少し後の Phase なのだが、敵対 Entity への移動目標位置決定はこの Phase で行う。
        // こうしておかないと、Player の移動を追うように Enemy が移動できなくなる。
        {
            // 視界内にいる敵対 Entity のうち、一番近い Entity を検索
            const target = UAction.findInSightNearlyHostileEntity(self);
            if (target) {
                this._primaryTargetEntityId = target.entityId().clone();

                
                // TODO: 仮
                const dir = SAIHelper.entityDistanceToDir(self, target);
                self.dir = dir;
            }
            else {
                //console.log("NotImplemented.");
                //this._targetPositionX = -1;
                //this._targetPositionY = -1;
                this._primaryTargetEntityId = LEntityId.makeEmpty();
            }




        
            /*
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
            */

        }
        
        this._requiredSkillAction = undefined;
        const candidates = UAction.makeCandidateSkillActions(self, this._primaryTargetEntityId);
        const skillAction = cctx.random().selectOrUndefined(candidates);
        if (skillAction) {
            if (skillAction.action.skillId == MRData.system.skills.move) {
                // 移動
                //this._attackTargetEntityId = LEntityId.makeEmpty();
            }
            else {
                this._requiredSkillAction = skillAction;
                //this._attackTargetEntityId = target.entityId();

            }

        }
        else {
            //this._attackTargetEntityId = LEntityId.makeEmpty();
            // 見失ったときも targetPosition は維持
        }
    }

    public isMoveRequested(): boolean {
        return !this._requiredSkillAction;
    }

    public isMajorActionRequested(): boolean {
        return !!this._requiredSkillAction;
    }

    public hasPrimaryTarget(): boolean {
        return this._primaryTargetEntityId.hasAny();
    }

    public primaryTarget(): LEntity {
        return MRLively.world.entity(this._primaryTargetEntityId);
    }

    public perform(cctx: SCommandContext, self: LEntity): boolean {

        //if (this._attackTargetEntityId.hasAny()) {
        if (this._requiredSkillAction) {

            //// 通常攻撃
            {
                //const target = REGame.world.entity(this._attackTargetEntityId);
                // 発動可否チェック。本当に隣接している？
                //let valid = false;
                //if (Helpers.checkAdjacent(self, target)) {
                //    valid = true;
                //}


                // 対象決定フェーズで予約した対象が、視界を外れたりしていないかを確認する
                const targetEntites = this._requiredSkillAction.targets.map(e => MRLively.world.entity(e));
                if (UAction.checkEntityWithinSkillActionRange(self, MRData.skills[this._requiredSkillAction.action.skillId], false, targetEntites)) {
                    
                    // AI は移動後に PrimaryTarget の方向を向くようになっているため、
                    // このままスキルを発動しようとすると空振りしてしまう。
                    // ここで向きを Target の方向に向けておく。
                    const pos = UMovement.getCenter(targetEntites);
                    self.dir = UMovement.getLookAtDirFromPos(self.mx, self.my, pos.x, pos.y);
                    
                    SEmittorPerformer.makeWithSkill(self, self, this._requiredSkillAction.action.skillId).perform(cctx);
                    cctx.postConsumeActionToken(self, LActionTokenConsumeType.MajorActed);
                    return true;
                }
                else {
                    // 別の Unit のアクションでマップ上から対象が消えた、など
                    cctx.postConsumeActionToken(self, LActionTokenConsumeType.MajorActed);
                    return true;
                }
                
            }


        }
        else {

        }

        return false;
    }
}
