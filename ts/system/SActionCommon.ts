import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DEffect, DEffectFieldScopeRange, DRmmzEffectScope } from "ts/data/DEffect";
import { REData } from "ts/data/REData";
import { onWalkedOnTopAction, onWalkedOnTopReaction } from "ts/objects/internal";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { LEntity } from "ts/objects/LEntity";
import { LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { Helpers } from "./Helpers";
import { RESystem } from "./RESystem";
import { SCommandContext } from "./SCommandContext";
import { SEffectSubject } from "./SEffectContext";
import { SMovementCommon } from "./SMovementCommon";

export interface CandidateSkillAction {
    action: IDataAction;
    targets: LEntity[];
}

export class SActionCommon {
    public static postStepOnGround(context: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.x, entity.y);
        const layer = block.layer(BlockLayerKind.Ground);
        const reactor = layer.firstEntity();
        if (reactor) {
            context.post(entity, reactor, new SEffectSubject(entity), undefined, onWalkedOnTopAction);
            context.post(reactor, entity, new SEffectSubject(reactor), undefined, onWalkedOnTopReaction);
        }
    }
    
    
    
    // Game_Action.prototype.checkItemScope
    private static checkItemScope(itemScope: DRmmzEffectScope, list: DRmmzEffectScope[]) {
        return list.includes(itemScope);
    }

    // Game_Action.prototype.isForOpponent
    public static isForOpponent(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Opponent_Single,
            DRmmzEffectScope.Opponent_All,
            DRmmzEffectScope.Opponent_Random_1,
            DRmmzEffectScope.Opponent_Random_2,
            DRmmzEffectScope.Opponent_Random_3,
            DRmmzEffectScope.Opponent_Random_4,
            DRmmzEffectScope.Everyone]);
    }

    // Game_Action.prototype.isForAliveFriend
    public static isForAliveFriend(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Friend_Single_Alive,
            DRmmzEffectScope.Friend_All_Alive,
            DRmmzEffectScope.User,
            DRmmzEffectScope.Everyone]);
    }

    // Game_Action.prototype.isForDeadFriend
    public static isForDeadFriend(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Friend_Single_Dead,
            DRmmzEffectScope.Friend_All_Dead]);
    }

    public static isForFriend(temScope: DRmmzEffectScope): boolean {
        return this.isForAliveFriend(temScope) || this.isForDeadFriend(temScope);
    }


    private static checkAdjacentDirectlyAttack(self: LEntity, target: LEntity): boolean {
        const map = REGame.map;
        const selfBlock = map.block(self.x, self.y);
        const targetBlock = map.block(target.x, target.y);
        const dx = targetBlock.x() - selfBlock.x();
        const dy = targetBlock.y() - selfBlock.y();

        if (Math.abs(dx) > 1) return false; // 隣接 Block への攻撃ではない
        if (Math.abs(dy) > 1) return false; // 隣接 Block への攻撃ではない

        const d = Helpers.offsetToDir(dx, dy);
        if (SMovementCommon.checkDiagonalWallCornerCrossing(self, d)) return false;    // 壁があるので攻撃できない

        return true;
    }

    public static makeCandidateSkillActions(performer: LEntity, primaryTargetId: LEntityId): CandidateSkillAction[] {
        const actions = performer.collectSkillActions();
        const result: CandidateSkillAction[] = [];
        let hasAdjacentAction = false;

        // まずは射程や地形状況を考慮して、発動可能な Skill を集める
        for (const action of actions) {
            if (action.skillId == RESystem.skills.move) {
                // "移動" は特別扱い。まずは常に使用できるものとして追加しておく
                result.push({ action: action,targets: []});
            }
            else {
                const r = this.meetValidAction(performer, primaryTargetId, action);
                if (r) {
                    result.push(r);
                }
            }
        }

        // 攻撃対象が隣接していれば、"移動" を外す
        if (primaryTargetId.hasAny() && SMovementCommon.checkEntityAdjacent(performer, REGame.world.entity(primaryTargetId))) {
            result.mutableRemove(x => x.action.skillId == RESystem.skills.move);
        }



        return result;
    }

    private static testFactionMatch(performer: LEntity, target: LEntity, scope: DRmmzEffectScope): boolean {
        if (SActionCommon.isForFriend(scope)) {
            if (Helpers.isFriend(performer, target)) return true;
        }
        else if (SActionCommon.isForOpponent(scope)) {
            if (Helpers.isHostile(performer, target)) return true;
        }
        else {
            // TODO: 中立は未対応
            throw new Error("Not implemented.");
        }
        return false;
    }
    
    private static meetValidAction(performer: LEntity, prevTargetEntityId: LEntityId, action: IDataAction): CandidateSkillAction | undefined {
        const skill = REData.skills[action.skillId];
        const effect = skill.effect;
        
        if (effect.scope.range == DEffectFieldScopeRange.Front1) {
            // ターゲット候補を集める
            const candidates = SMovementCommon.getAdjacentEntities(performer).filter(target => {
                if (!this.testFactionMatch(performer, target, skill.rmmzEffectScope)) return false;

                if (!this.checkAdjacentDirectlyAttack(performer, target)) return false; // 壁の角など、隣接攻撃できなければダメ

                const targetBlock = REGame.map.block(target.x, target.y);
                if (!targetBlock || targetBlock.checkPurifier(performer)) return false; // target の場所に聖域効果があるならダメ

                return true;
            });

            // 隣接している有効な対象がいない
            if (candidates.length <= 0) return undefined;

            // 前ターンで攻撃したものがいれば、引き続き優先ターゲットにしてみる
            let target = candidates.find(e => e.entityId().equals(prevTargetEntityId));

            // 対象をランダム選択
            if (!target) {
                target = REGame.world.random().select(candidates);
            }

            assert(target);

            return { action: action, targets: [target] };



/*

            if (LCharacterAI.checkAdjacentDirectlyAttack(self, target) &&
            targetBlock &&!targetBlock.checkPurifier(self)) {     // 聖域の巻物とか無ければ隣接攻撃可能。
                this._attackTargetEntityId = target.entityId();
            }
            */
        }
        else if (effect.scope.range == DEffectFieldScopeRange.StraightProjectile) {
            throw new Error("Not implemented.");
        }
        else {
            throw new Error("Unreachable.");
        }

        return undefined;
    }

    /** skillAction の射程範囲内に、有効なターゲットが１つでも含まれているか確認する */
    public static checkEntityWithinSkillActionRange(performer: LEntity, skillAction: CandidateSkillAction): boolean {
        const skill = REData.skills[skillAction.action.skillId];
        const effect = skill.effect;
        let count = 0;
        for (const t of skillAction.targets) {
            if (this.checkEntityWithinRange(performer, effect, t)) count++;
        }
        return count > 0;
    }

    /** effect の射程範囲内に target が含まれているかを確認する */
    public static checkEntityWithinRange(performer: LEntity, effect: DEffect, target: LEntity): boolean {
        if (effect.scope.range == DEffectFieldScopeRange.Front1) {
            return SMovementCommon.checkEntityAdjacent(performer, target);
        }
        else if (effect.scope.range == DEffectFieldScopeRange.StraightProjectile) {
            throw new Error("Not implemented.");
        }
        else {
            throw new Error("Unreachable.");
        }
    }
}
