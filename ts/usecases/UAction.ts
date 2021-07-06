import { assert, tr2 } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DEmittor, DEffectFieldScope, DEffectFieldScopeArea, DEffectFieldScopeRange, DRmmzEffectScope } from "ts/data/DEffect";
import { REData } from "ts/data/REData";
import { onWalkedOnTopAction, onWalkedOnTopReaction } from "ts/objects/internal";
import { LBlock } from "ts/objects/LBlock";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { LEntity } from "ts/objects/LEntity";
import { LEntityId } from "ts/objects/LObject";
import { REGame } from "ts/objects/REGame";
import { preProcessFile } from "typescript";
import { Helpers } from "../system/Helpers";
import { RESystem } from "../system/RESystem";
import { SCommandContext } from "../system/SCommandContext";
import { SEffectSubject } from "../system/SEffectContext";
import { UMovement } from "./UMovement";

export interface CandidateSkillAction {
    action: IDataAction;
    targets: LEntity[];     // ターゲット候補。
}

export class UAction {
    public static postStepOnGround(context: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.x, entity.y);
        const layer = block.layer(BlockLayerKind.Ground);
        const reactor = layer.firstEntity();
        if (reactor) {
            context.post(entity, reactor, new SEffectSubject(entity), undefined, onWalkedOnTopAction);
            context.post(reactor, entity, new SEffectSubject(reactor), undefined, onWalkedOnTopReaction);
        }
    }

    /**
     * entity を現在位置から HomeLayer へ落とす。"Fall" ではないため、これによって罠が発動したりすることは無い。
     * 
     */
    public static postDropOrDestroy(context: SCommandContext, entity: LEntity, targetLayer: BlockLayerKind, blowDirection: number): void {
        const block = UMovement.selectNearbyLocatableBlock(context.random(), entity.x, entity.y, targetLayer);
        if (block) {
            //context.postSequel(entity, RESystem.sequels.dropSequel, { movingDir: blowDirection });
            //context.postCall(() => {
                UMovement.locateEntity(entity, block.x(), block.y(), targetLayer);
                context.postSequel(entity, RESystem.sequels.dropSequel);
            //});
        }
        else {
            // 落下できるところが無ければ Entity 削除
            context.postMessage(tr2("消えてしまった…。"));
            context.postDestroy(entity);
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
        if (UMovement.checkDiagonalWallCornerCrossing(self, d)) return false;    // 壁があるので攻撃できない

        return true;
    }

    public static makeCandidateSkillActions(performer: LEntity, primaryTargetId: LEntityId): CandidateSkillAction[] {
        const actions = performer.collectSkillActions();
        const result: CandidateSkillAction[] = [];
        let hasAdjacentAction = false;

        // まずは射程や地形状況を考慮して、発動可能な Skill を集める
        for (const action of actions) {
            const skill = REData.skills[action.skillId];
            const effect = skill.emittor();
            const targets = this.searchTargetEntities(performer, effect.scope, skill.rmmzEffectScope);
            if (targets.length > 0) {
                result.push({ action: action, targets: targets });
            }
            //if (action.skillId == RESystem.skills.move) {
            //}
        }

        // "移動" は特別扱い。まずは常に使用できるものとして追加しておく
        if (!result.find(x => x.action.skillId == RESystem.skills.move)) {
            result.push({
                action: { 
                    conditionParam1: undefined,
                    conditionParam2: undefined,
                    conditionType: undefined,
                    rating: 5,
                    skillId: RESystem.skills.move,
                },
                targets: []
            });
        }

        // 攻撃対象が隣接していれば、"移動" を外す
        if (primaryTargetId.hasAny() && UMovement.checkEntityAdjacent(performer, REGame.world.entity(primaryTargetId))) {
            result.mutableRemove(x => x.action.skillId == RESystem.skills.move);
        }



        return result;
    }

    private static testFactionMatch(performer: LEntity, target: LEntity, scope: DRmmzEffectScope): boolean {
        if (UAction.isForFriend(scope)) {
            if (Helpers.isFriend(performer, target)) return true;
        }
        else if (UAction.isForOpponent(scope)) {
            if (Helpers.isHostile(performer, target)) return true;
        }
        else {
            // TODO: 中立は未対応
            throw new Error("Not implemented.");
        }
        return false;
    }
    
    private static searchTargetEntities(performer: LEntity, scope: DEffectFieldScope, rmmzEffectScope: DRmmzEffectScope): LEntity[] {
        
        if (scope.range == DEffectFieldScopeRange.Front1) {
            // ターゲット候補を集める
            const candidates = UMovement.getAdjacentEntities(performer).filter(target => {
                if (!this.testFactionMatch(performer, target, rmmzEffectScope)) return false;

                if (!this.checkAdjacentDirectlyAttack(performer, target)) return false; // 壁の角など、隣接攻撃できなければダメ

                const targetBlock = REGame.map.block(target.x, target.y);
                if (!targetBlock || targetBlock.checkPurifier(performer)) return false; // target の場所に聖域効果があるならダメ

                return true;
            });

            return candidates;

            /*
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
            */



/*

            if (LCharacterAI.checkAdjacentDirectlyAttack(self, target) &&
            targetBlock &&!targetBlock.checkPurifier(self)) {     // 聖域の巻物とか無ければ隣接攻撃可能。
                this._attackTargetEntityId = target.entityId();
            }
            */
        }
        else if (scope.range == DEffectFieldScopeRange.StraightProjectile) {
            let candidates: LEntity[] = [];
            for (const dir of UMovement.directions) {
                //const [ox, oy] = Helpers._dirToTileOffsetTable[dir];
                const ox = Helpers._dirToTileOffsetTable[dir].x;
                const oy = Helpers._dirToTileOffsetTable[dir].y;
                for (let i = 1; i < scope.length; i++) { // 足元を含む必要はないので i=1 から開始
                    const x = performer.x + (ox * i);
                    const y = performer.y + (oy * i);
                    const block = REGame.map.tryGetBlock(x, y);

                    // マップ外まで見たら列挙終了
                    if (!block) {
                        break;
                    }

                    // 視界内チェック
                    if (scope.area == DEffectFieldScopeArea.Room) {
                        const room = block.room();
                        if (room) {
                            if (room.checkVisibilityBlock(block)) {
                                // 視界内
                            }
                            else {
                                // 視界外
                                break;
                            }
                        }
                        else {
                            // 通路内では隣接のみ視界内としたい
                            if (i == 2) break;
                        }
                    }
                    else if (scope.area == DEffectFieldScopeArea.Floor) {
                        throw new Error("Not implemented.");
                    }
                    else {
                        throw new Error("Unreachable");
                    }

                    // Block 内の Target にできる Entity を集める
                    const targets = block.getEntities().filter(target => {
                        // 勢力チェック
                        if (!this.testFactionMatch(performer, target, rmmzEffectScope)) return false;
                        return true;
                    })

                    if (targets.length > 0) {
                        candidates = candidates.concat(targets);
                    }
                }
            }

            return candidates;
            //return { action: action, targets: targets };
        }
        else {
            throw new Error("Unreachable.");
        }

        return [];
    }

    /** skillAction の射程範囲内に、有効なターゲットが１つでも含まれているか確認する */
    public static checkEntityWithinSkillActionRange(performer: LEntity, skillAction: CandidateSkillAction): boolean {
        const skill = REData.skills[skillAction.action.skillId];
        const effect = skill.emittor();
        //let count = 0;
        const entities = this.searchTargetEntities(performer, effect.scope, skill.rmmzEffectScope);
        for (const target of skillAction.targets) {
            if (!!entities.find(x => x == target)) {
                return true;
            }
        }
        return false;
        //for (const t of skillAction.targets) {
        //    if (this.checkEntityWithinRange(performer, effect, skill.rmmzEffectScope, t)) {
        //        return true;
        //    }
        //}
        //return count > 0;
    }

    /** effect の射程範囲内に target が含まれているかを確認する */
    /*
    public static checkEntityWithinRange(performer: LEntity, effect: DEffect, rmmzScope: DRmmzEffectScope, target: LEntity): boolean {
        const entities = this.searchTargetEntities(performer, effect.scope, rmmzScope);
        return !!entities.find(x => x == target);
    }
    */
}
