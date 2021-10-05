import { assert, tr, tr2 } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { DEffectFieldScope, DEffectFieldScopeArea, DEffectFieldScopeRange, DRmmzEffectScope } from "ts/re/data/DEffect";
import { DHelpers } from "ts/re/data/DHelper";
import { DSkill } from "ts/re/data/DSkill";
import { REData } from "ts/re/data/REData";
import { LGenerateDropItemCause, onWalkedOnTopAction, onWalkedOnTopReaction, testPutInItem } from "ts/re/objects/internal";
import { LEntity } from "ts/re/objects/LEntity";
import { LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { REBasics } from "../data/REBasics";
import { DBlockLayerKind } from "../data/DCommon";
import { LInventoryBehavior } from "../objects/behaviors/LInventoryBehavior";
import { DescriptionHighlightLevel, LEntityDescription } from "../objects/LIdentifyer";
import { Helpers } from "../system/Helpers";
import { RESystem } from "../system/RESystem";
import { RECCMessageCommand, SCommandContext } from "../system/SCommandContext";
import { SEffectSubject } from "../system/SEffectContext";
import { SSoundManager } from "../system/SSoundManager";
import { UBlock } from "./UBlock";
import { UMovement } from "./UMovement";
import { UName } from "./UName";

export interface LCandidateSkillAction {
    action: IDataAction;
    targets: LEntityId[];     // ターゲット候補
}

export class UAction {

    /*
    // TODO: Activity 経由で設定したい。.withConsumeAction()と一緒に使いたいので。
    public static postPerformSkill(context: SCommandContext, performer: LEntity, skillId: DSkillDataId): void {
        context.postCall(() => {
            SEmittorPerformer.makeWithSkill(performer, skillId).performe(context);
        });
    }
    */

    public static postStepOnGround(context: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.x, entity.y);
        const layer = block.layer(DBlockLayerKind.Ground);
        const reactor = layer.firstEntity();
        if (reactor) {
            context.post(entity, reactor, new SEffectSubject(entity), undefined, onWalkedOnTopAction);
            context.post(reactor, entity, new SEffectSubject(reactor), undefined, onWalkedOnTopReaction);
        }
    }

    /** @deprecated */
    public static postPickItem(context: SCommandContext, self: LEntity, inventory: LInventoryBehavior, itemEntity: LEntity): RECCMessageCommand {
        return context.post(
            self, itemEntity, new SEffectSubject(self), undefined, testPutInItem,
            () => {
                REGame.map._removeEntity(itemEntity);
                inventory.addEntityWithStacking(itemEntity);
                
                const name = LEntityDescription.makeDisplayText(UName.makeUnitName(self), DescriptionHighlightLevel.UnitName);
                context.postMessage(tr("{0} は {1} をひろった", name, UName.makeNameAsItem(itemEntity)));
                SSoundManager.playPickItem();

                return true;
            });
    }
    
    /**
     * entity を現在マップの指定位置へ落とす。"Fall" ではないため、これによって罠が発動したりすることは無い。
     */
    public static dropOrDestroy(context: SCommandContext, entity: LEntity, mx: number, my: number): void {
        REGame.world._transferEntity(entity, REGame.map.floorId(), mx, my);
        this.postDropOrDestroyOnCurrentPos(context, entity, entity.getHomeLayer());
    }

    /**
     * entity を現在位置から HomeLayer へ落とす。"Fall" ではないため、これによって罠が発動したりすることは無い。
     * 
     */
    public static postDropOrDestroyOnCurrentPos(context: SCommandContext, entity: LEntity, targetLayer: DBlockLayerKind): void {
        const block = UMovement.selectNearbyLocatableBlock(context.random(), entity.x, entity.y, targetLayer, entity);
        console.log("postDropOrDestroyOnCurrentPos", block);
        if (block) {
            //context.postSequel(entity, RESystem.sequels.dropSequel, { movingDir: blowDirection });
            //context.postCall(() => {
                UMovement.locateEntity(entity, block.x(), block.y(), targetLayer);
                //REGame.world._transferEntity(entity, REGame.map.floorId(), block.x(), block.y());
                context.postSequel(entity, REBasics.sequels.dropSequel);
            //});
        }
        else {
            // 落下できるところが無ければ Entity 削除
            context.postMessage(tr2("消えてしまった…。"));
            context.postDestroy(entity);
        }
    }




    /**
     * item を actionId として使うとき、対象アイテムの選択が必要であるかを判断する。
     */
    public static checkItemSelectionRequired(item: LEntity, actionId: DActionId): boolean {
        const reactions = item.data().reactions.filter(x => x.actionId == actionId);
        for (const reaction of reactions) {
            const emittor = REData.getEmittorById(reaction.emittingEffect);
            if (emittor.scope.range == DEffectFieldScopeRange.Selection) return true;
        }
        return false;
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

    /**
     * スキルの効果範囲内にいる、有効な対象を取得する
     * @param performer 
     * @param skill 
     */
    public static getSkillEffectiveTargets(performer: LEntity, skill: DSkill, checkFaction: boolean): LEntity[] {
        const effect = skill.emittor();
        return this.searchTargetEntities(performer, effect.scope, skill.rmmzEffectScope, checkFaction);
    }

    public static makeCandidateSkillActions(performer: LEntity, primaryTargetId: LEntityId): LCandidateSkillAction[] {
        const actions = performer.collectSkillActions();
        let result: LCandidateSkillAction[] = [];
        let hasAdjacentAction = false;



        // まずは射程や地形状況を考慮して、発動可能な Skill を集める
        for (const action of actions) {
            const targets = this.getSkillEffectiveTargets(performer, REData.skills[action.skillId], true);
            if (targets.length > 0) {
                result.push({ action: action, targets: targets.map(e => e.entityId()) });
            }
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

        // 状況に応じた候補追加
        performer.iterateBehaviorsReverse(b => {
            b.onPostMakeSkillActions(result);
            return true;
        });

        let maxRating = 0;
        result.forEach(r => maxRating = Math.max(r.action.rating, maxRating));

        // 最大 Rating からの差が 10 以内を有効とする
        result = result.filter(x => x.action.rating >= maxRating - 10);


        // 攻撃対象が隣接していれば、"移動" を外す
        if (primaryTargetId.hasAny() && UMovement.checkEntityAdjacent(performer, REGame.world.entity(primaryTargetId))) {
            result.mutableRemove(x => x.action.skillId == RESystem.skills.move);
        }
        else {
            let found = false;
            for (const c of result) {
                for (const id of c.targets) {
                    const target = REGame.world.entity(id);
                    if (UMovement.checkEntityAdjacent(performer, target)) {
                        result.mutableRemove(x => x.action.skillId == RESystem.skills.move);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }

        return result;
    }

    private static testFactionMatch(performer: LEntity, target: LEntity, scope: DRmmzEffectScope): boolean {
        if (DHelpers.isForFriend(scope)) {
            if (Helpers.isFriend(performer, target)) return true;
        }
        else if (DHelpers.isForOpponent(scope)) {
            if (Helpers.isHostile(performer, target)) return true;
        }
        else {
            // TODO: 中立は未対応
            throw new Error("Not implemented.");
        }
        return false;
    }
    
    private static searchTargetEntities(performer: LEntity, scope: DEffectFieldScope, rmmzEffectScope: DRmmzEffectScope, checkFaction: boolean): LEntity[] {
        if (scope.range == DEffectFieldScopeRange.Performer) {
            return [performer];
        }
        else if (scope.range == DEffectFieldScopeRange.Front1) {
            // ターゲット候補を集める
            const candidates = UMovement.getAdjacentEntities(performer).filter(target => {
                if (checkFaction) {
                    if (!this.testFactionMatch(performer, target, rmmzEffectScope)) return false;
                }

                if (!this.checkAdjacentDirectlyAttack(performer, target)) return false; // 壁の角など、隣接攻撃できなければダメ

                const targetBlock = REGame.map.block(target.x, target.y);
                if (!targetBlock || UBlock.checkPurifier(targetBlock, performer)) return false; // target の場所に聖域効果があるならダメ

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
    //public static checkEntityWithinSkillActionRange(performer: LEntity, skillAction: CandidateSkillAction): boolean {
    public static checkEntityWithinSkillActionRange(performer: LEntity, skill: DSkill, checkFaction: boolean, targets: LEntity[]): boolean {
        //const skill = REData.skills[skillAction.action.skillId];
        const effect = skill.emittor();
        //let count = 0;
        const entities = this.searchTargetEntities(performer, effect.scope, skill.rmmzEffectScope, checkFaction);
        for (const target of targets) {//skillAction.targets) {
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

    public static chekcVisible(subject: LEntity, target: LEntity): boolean {
        return (target.traits(REBasics.traits.Invisible).length == 0);
    }
   
    /**
     * self の視界内にいる敵対 Entity のうち、一番近いものを検索する。
     */
    public static findInSightNearlyHostileEntity(self: LEntity): LEntity | undefined {
        return REGame.map.getInsightEntities(self)
                .filter(e => Helpers.isHostile(self, e) && this.chekcVisible(self, e))
                .immutableSort((a, b) => Helpers.getDistance(self, a) - Helpers.getDistance(self, b))
                .find(e => Helpers.isHostile(self, e));
    }

    /**
     * 正面に話しかけられる Entity がいれば返す。
     */
    public static findTalkableFront(entity: LEntity): LEntity | undefined {
        const frontTarget = UMovement.getFrontBlock(entity).getFirstEntity();
        if (frontTarget && !Helpers.isHostile(entity, frontTarget)) {
            if (frontTarget.queryReactions().includes(REBasics.actions.talk)) {
                return frontTarget;
            }
        }
        return undefined;
    }

    public static postDropItems(cctx: SCommandContext, entity: LEntity, cause: LGenerateDropItemCause): void {
        const map = REGame.map;
        assert(map.checkAppearing(entity));
        const items = entity.generateDropItems(cause);
        for (const item of items) {
            this.dropOrDestroy(cctx, item, entity.x, entity.y);
        }
    }

}
