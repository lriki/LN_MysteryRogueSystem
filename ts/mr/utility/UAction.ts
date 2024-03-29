import { assert, tr, tr2 } from "ts/mr/Common";
import { DEffectFieldScope, DEffectFieldScopeArea, DEffectFieldScopeType, DRmmzEffectScope } from "ts/mr/data/DEffect";
import { DHelpers } from "ts/mr/data/DHelper";
import { DSkill } from "ts/mr/data/DSkill";
import { MRData } from "ts/mr/data/MRData";
import { LGenerateDropItemCause, onPerformStepFeetProcess, onPreStepFeetProcess, onPreStepFeetProcess_Actor, onWalkedOnTopAction, onWalkedOnTopReaction } from "ts/mr/lively/internal";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { LEntityId } from "ts/mr/lively/LObject";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRBasics } from "../data/MRBasics";
import { DActionId, DBlockLayerKind } from "../data/DCommon";
import { LInventoryBehavior } from "../lively/entity/LInventoryBehavior";
import { DescriptionHighlightColor, LEntityDescription } from "../lively/LIdentifyer";
import { Helpers } from "../system/Helpers";
import { MRSystem } from "../system/MRSystem";
import { SCommandContext } from "../system/SCommandContext";
import { SEffectSubject } from "../system/SEffectContext";
import { SSoundManager } from "../system/SSoundManager";
import { UBlock } from "./UBlock";
import { UMovement } from "./UMovement";
import { UName } from "./UName";
import { USearch } from "./USearch";
import { SPoint } from "./UCommon";
import { LEquipmentUserBehavior } from "../lively/behaviors/LEquipmentUserBehavior";
import { LActivity } from "../lively/activities/LActivity";
import { ULimitations } from "./ULimitations";
import { SCommand, STestAddItemCommand } from "../system/SCommand";
import { STask } from "../system/tasks/STask";
import { STransferMapSource } from "../system/dialogs/STransferMapDialog";
import { LThinkingActionRatings } from "../lively/ai2/LThinkingAgent";

export interface LCandidateSkillAction {
    action: IDataAction;
    targets: LEntityId[];     // ターゲット候補
}

export class UAction {
    /*
    // TODO: Activity 経由で設定したい。.withConsumeAction()と一緒に使いたいので。
    public static postPerformSkill(cctx: SCommandContext, performer: LEntity, skillId: DSkillDataId): void {
        context.postCall(() => {
            SEmittorPerformer.makeWithSkill(performer, skillId).performe(context);
        });
    }
    */

    public static postEffectSensed(cctx: SCommandContext, entity: LEntity): void {
        cctx.postCall(() => {
            entity.iterateBehaviorsReverse(b => b.onEffectSensed(entity, cctx));
        });
    }

    public static postStepOnGround(cctx: SCommandContext, entity: LEntity): void {
        const block = MRLively.mapView.currentMap.block(entity.mx, entity.my);
        const layer = block.layer(DBlockLayerKind.Ground);
        const reactor = layer.firstEntity();
        if (reactor) {
            cctx.post(entity, reactor, new SEffectSubject(entity), undefined, onWalkedOnTopAction);
            cctx.post(reactor, entity, new SEffectSubject(reactor), undefined, onWalkedOnTopReaction);
        }
    }

    public static postPreStepFeetProcess(cctx: SCommandContext, entity: LEntity): void {
        const block = MRLively.mapView.currentMap.block(entity.mx, entity.my);
        const layer = block.layer(DBlockLayerKind.Ground);
        const reactor = layer.firstEntity();
        if (reactor) {
            
            cctx.callSymbol(entity, reactor, new SEffectSubject(entity), undefined, onPreStepFeetProcess_Actor);
            cctx.callSymbol(reactor, entity, new SEffectSubject(reactor), undefined, onPreStepFeetProcess);
            //cctx.post(reactor, entity, new SEffectSubject(reactor), undefined, onStepOnTrap);
        }
    }

    public static postAttemptPerformStepFeetProcess(cctx: SCommandContext, entity: LEntity): void {
        const block = MRLively.mapView.currentMap.block(entity.mx, entity.my);
        const layer = block.layer(DBlockLayerKind.Ground);
        const reactor = layer.firstEntity();
        if (reactor) {
            cctx.post(reactor, entity, new SEffectSubject(reactor), undefined, onPerformStepFeetProcess);
        }
    }

    public static postFall(cctx: SCommandContext, entity: LEntity): void {
        
        cctx.postActivity(LActivity.makeFall(entity))
        .then(() => {
            this.postDropOrDestroyOnCurrentPos(cctx, entity, entity.getHomeLayer());
        })
        .catch(() => {
            this.postDropOrDestroyOnCurrentPos(cctx, entity, entity.getHomeLayer());
        });
    }

    /** @deprecated */
    public static postPickItem(cctx: SCommandContext, self: LEntity, inventory: LInventoryBehavior, itemEntity: LEntity): STask {
        return cctx.postCommandTask(new STestAddItemCommand(self, itemEntity))
            .then2(() => {
                MRLively.mapView.currentMap._removeEntity(itemEntity);
                inventory.addEntityWithStacking(itemEntity);
                
                const name = LEntityDescription.makeDisplayText(UName.makeUnitName(self), DescriptionHighlightColor.UnitName);
                cctx.postMessage(tr("{0} は {1} をひろった", name, UName.makeNameAsItem(itemEntity)));
                SSoundManager.playPickItem();
            });
    }
    
    /**
     * entity を現在マップの指定位置へ落とす。"Fall" ではないため、これによって罠が発動したりすることは無い。
     * 
     * @deprecated use TDrop
     */
    public static postDropOrDestroy(cctx: SCommandContext, entity: LEntity, mx: number, my: number): void {
        cctx.postCall(() => {
            MRLively.world.transferEntity(entity, MRLively.mapView.currentMap.floorId(), mx, my);
            this.postDropOrDestroyOnCurrentPos(cctx, entity, entity.getHomeLayer());
        });
    }

    /**
     * entity を現在位置から HomeLayer へ落とす。"Fall" ではないため、これによって罠が発動したりすることは無い。
     * 
     * @deprecated use TDrop
     */
    public static postDropOrDestroyOnCurrentPos(cctx: SCommandContext, entity: LEntity, targetLayer: DBlockLayerKind): void {

        if (ULimitations.isItemCountFullyInMap()) {

        }
        else {
            const block = UMovement.selectNearbyLocatableBlock(entity.map, cctx.random(), entity.mx, entity.my, targetLayer, entity);
            if (block) {
                //context.postSequel(entity, RESystem.sequels.dropSequel, { movingDir: blowDirection });
                //context.postCall(() => {
                    entity.map.locateEntity(entity, block.mx, block.my, targetLayer);
                    //REGame.world._transferEntity(entity, REGame.map.floorId(), block.x(), block.y());
                    cctx.postSequel(entity, MRBasics.sequels.dropSequel);
                //});
                return;
            }
        }



        // 落下できるところが無ければ Entity 削除
        cctx.postMessage(tr2("%1は消えてしまった…。").format(UName.makeNameAsItem(entity)));
        cctx.postDestroy(entity);
    }

    public static postWarp(cctx: SCommandContext, entity: LEntity): void {

        const block = USearch.selectUnitSpawnableBlock(cctx.random());
        if (block) {
            cctx.postTransferFloor(entity, entity.floorId, block.mx, block.my);   // SpecialEffect として実行される場合は事前にpostされる発動側Animationを待ちたいので post.
            cctx.postSequel(entity, MRBasics.sequels.warp);
        }
        else {
            throw new Error("Not implemented.");
        }
    }



    /**
     * item を actionId として使うとき、対象アイテムの選択が必要であるかを判断する。
     */
    public static checkItemSelectionRequired(item: LEntity, actionId: DActionId): boolean {
        const reaction = item.data.findReaction(actionId);
        if (reaction) {
            for (const emittor of reaction.emittors()) {
                if (emittor.scope.range == DEffectFieldScopeType.Selection) return true;
            }
        }
        return false;
    }


    private static checkAdjacentDirectlyAttack(self: LEntity, target: LEntity): boolean {
        const map = MRLively.mapView.currentMap;
        const selfBlock = map.block(self.mx, self.my);
        const targetBlock = map.block(target.mx, target.my);
        const dx = targetBlock.mx - selfBlock.mx;
        const dy = targetBlock.my - selfBlock.my;

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
        let actions = performer.collectSkillActions();
        let result: LCandidateSkillAction[] = [];

        if (performer.hasTrait(MRBasics.traits.SealSpecialAbility)) {
            actions = actions.filter(x => x.skillId == MRData.system.skills.normalAttack);
        }


        // まずは射程や地形状況を考慮して、発動可能な Skill を集める
        for (const action of actions) {
            const targets = this.getSkillEffectiveTargets(performer, MRData.skills[action.skillId], true);
            if (targets.length > 0) {
                result.push({ action: action, targets: targets.map(e => e.entityId()) });
            }
        }


        // "移動" は特別扱い。まずは常に使用できるものとして追加しておく
        if (!result.find(x => x.action.skillId == MRData.system.skills.move)) {
            result.push({
                action: { 
                    conditionParam1: undefined,
                    conditionParam2: undefined,
                    conditionType: undefined,
                    rating: LThinkingActionRatings.Moving,
                    skillId: MRData.system.skills.move,
                },
                targets: []
            });
        }

        // 状況に応じた候補追加
        performer.iterateBehaviorsReverse(b => {
            b.onPostMakeSkillActions(result);
        });

        if (performer.hasTrait(MRBasics.traits.UseSkillForced)) {
            result.mutableRemove(x => x.action.skillId == MRData.system.skills.normalAttack);
        }

        let maxRating = 0;
        result.forEach(r => maxRating = Math.max(r.action.rating, maxRating));

        // 最大 Rating からの差が 5 以内を有効とする
        result = result.filter(x => x.action.rating >= maxRating - 5);


        // 攻撃対象が隣接していれば、"移動" を外す
        if (primaryTargetId.hasAny() && UMovement.checkEntityAdjacent(performer, MRLively.world.entity(primaryTargetId))) {
            result.mutableRemove(x => x.action.skillId == MRData.system.skills.move);
        }
        else {
            let found = false;
            for (const c of result) {
                for (const id of c.targets) {
                    const target = MRLively.world.entity(id);
                    if (UMovement.checkEntityAdjacent(performer, target)) {
                        result.mutableRemove(x => x.action.skillId == MRData.system.skills.move);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }

        return result;
    }

    public static testFactionMatch(performer: LEntity, target: LEntity, scope: DRmmzEffectScope): boolean {
        if (scope == DRmmzEffectScope.Everyone) {
            return true;
        }
        else if (DHelpers.isForFriend(scope)) {
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
        if (scope.range == DEffectFieldScopeType.Performer) {
            return [performer];
        }
        else if (scope.range == DEffectFieldScopeType.Front1) {
            // ターゲット候補を集める
            const candidates = UMovement.getAdjacentEntities(performer).filter(target => {
                if (checkFaction) {
                    if (!this.testFactionMatch(performer, target, rmmzEffectScope)) return false;
                }

                if (!this.checkAdjacentDirectlyAttack(performer, target)) return false; // 壁の角など、隣接攻撃できなければダメ

                const targetBlock = MRLively.mapView.currentMap.block(target.mx, target.my);
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
        else if (scope.range == DEffectFieldScopeType.StraightProjectile) {
            let candidates: LEntity[] = [];
            for (const dir of UMovement.directions) {
                //const [ox, oy] = Helpers._dirToTileOffsetTable[dir];
                const ox = Helpers._dirToTileOffsetTable[dir].x;
                const oy = Helpers._dirToTileOffsetTable[dir].y;
                for (let i = 1; i < scope.length; i++) { // 足元を含む必要はないので i=1 から開始
                    const x = performer.mx + (ox * i);
                    const y = performer.my + (oy * i);
                    const block = MRLively.mapView.currentMap.tryGetBlock(x, y);

                    // マップ外まで見たら列挙終了
                    if (!block) {
                        break;
                    }

                    // Block の視界内チェック (部屋の外周 1 マスは視界内)
                    if (scope.area == DEffectFieldScopeArea.Room) {
                        const room = block.room();
                        if (room) {
                            if (USearch.checkInSightBlockFromSubject(performer, block)) {
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
        }
        else if (scope.range == DEffectFieldScopeType.Room) {
            const candidates: LEntity[] = [];
            MRLively.mapView.currentMap.room(performer.roomId()).forEachEntities(entity => {
                if (this.testFactionMatch(performer, entity, rmmzEffectScope)) {
                    candidates.push(entity);
                };
            });
            return candidates;
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

    // public static chekcVisible(subject: LEntity, target: LEntity): boolean {
    //     if (subject.hasTrait(REBasics.traits.bli))

    //     return (target.traits(REBasics.traits.Invisible).length == 0);
    // }
   
    /**
     * self の視界内にいる敵対 Entity のうち、一番近いものを検索する。
     */
    // TODO: Move o USerarch
    public static findInSightNearlyHostileEntity(self: LEntity): LEntity | undefined {
        if (USearch.hasBlindness(self)) return undefined;   // 盲目

        return MRLively.mapView.currentMap.getInsightEntities(self)
                .filter(e => Helpers.isHostile(self, e) && USearch.isVisibleFromSubject(self, e))
                .immutableSort((a, b) => Helpers.getDistance(self, a) - Helpers.getDistance(self, b))
                .find(e => Helpers.isHostile(self, e));
    }

    /**
     * 正面に話しかけられる Entity がいれば返す。
     */
    public static findTalkableFront(entity: LEntity): LEntity | undefined {
        const frontBlock = UMovement.getFrontBlock(entity);
        const frontTarget = frontBlock.getFirstEntity();
        if (frontTarget && !Helpers.isHostile(entity, frontTarget)) {
            if (!!frontTarget.queryReactions().find(x => x.actionId == MRBasics.actions.talk)) {
                return frontTarget;
            }
        }
        return undefined;
    }


}
