import { assert } from "ts/Common";
import { DEffectFieldScopeRange, DRmmzEffectScope } from "ts/data/DEffect";
import { REData } from "ts/data/REData";
import { onWalkedOnTopAction, onWalkedOnTopReaction } from "ts/objects/internal";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { LEntity } from "ts/objects/LEntity";
import { LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { Helpers } from "./Helpers";
import { SCommandContext } from "./SCommandContext";
import { SEffectSubject } from "./SEffectContext";
import { SMovementCommon } from "./SMovementCommon";

export interface CandidateSkillAction {
    action: IDataAction;
    target: LEntity;
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

    public static makeCandidateSkillActions(performer: LEntity, prevTargetEntityId: LEntityId): CandidateSkillAction[] {
        const actions = performer.collectSkillActions();
        const result: CandidateSkillAction[] = [];
        for (const action of actions) {
            const r = this.meetValidAction(performer, prevTargetEntityId, action);
            if (r) result.push(r);
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

            return { action: action, target: target };



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

        return undefined;
    }
}
