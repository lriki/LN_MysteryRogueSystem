import { REBasics } from "ts/re/data/REBasics";
import { DEffectFieldScopeRange, DSkillCostSource, DEmittorCost, DParamCostType, DParamCost, DEffectFieldScope, DRmmzEffectScope, DEffectSet } from "ts/re/data/DEffect";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REData } from "ts/re/data/REData";
import { LProjectableBehavior } from "ts/re/objects/behaviors/activities/LProjectableBehavior";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { onAttackReaction } from "ts/re/objects/internal";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "./RESystem";
import { SCommandContext } from "./SCommandContext";
import { SEffectContext, SEffectIncidentType, SEffectSubject } from "./SEffectContext";
import { SEntityFactory } from "./SEntityFactory";
import { UMovement } from "../usecases/UMovement";
import { assert, tr2 } from "ts/re/Common";
import { DParameterId } from "ts/re/data/DParameter";
import { SkillEmittedArgs } from "ts/re/data/predefineds/DBasicEvents";
import { DBlockLayerKind, DBlockLayerScope, DSkillId } from "../data/DCommon";
import { SEffectorFact } from "./SEffectApplyer";
import { DEffectCause, DEmittor } from "../data/DEmittor";
import { USearch } from "../usecases/USearch";
import { LBlock } from "../objects/LBlock";
import { UAction } from "../usecases/UAction";
import { UName } from "../usecases/UName";
import { SCommandResponse } from "./RECommand";

export type SOnPerformedFunc = (targets: LEntity[]) => void;

export class SEmittorPerformer {

    /*
    発動者(performer) と主題(subject) について
    ----------
    アイテムを投げ当てた時の処理は少しイメージしづらいかも。
    例えば薬草(ScopeはPerformer)を投げ当てた時、performer と target は当てられた相手になる。投げた自分ではない。
    感覚的には、当てられた側は「このアイテムを使いなさい！と言われたので使う。ただし効果は Cause=Hit で検索する」となる。
    */

    private _subject: LEntity;

    /** 発動者 */
    private _performer: LEntity;

    /** スキルとして発動する場合のスキルID. スキルではない場合 0. */
    private _skillId: DSkillId = 0;

    /** 発動する効果 */
    private _emittor: DEmittor | undefined;

    /** 発動元となったアイテム (杖など) */
    private _itemEntity: LEntity | undefined;

    /** Emittor がアイテムを対象とする場合、その対象となるアイテム */
    private _selectedTargetItems: LEntity[] = [];

    /** 対象に効果を適用する際の基準となる向き。ノックバック方向等に使用する。0 の場合、performer の向きを採用する。 */
    private _effectDirection = 0;

    private _projectilePriorityEffectSet: DEffectSet | undefined;

    private _onPerformed: SOnPerformedFunc | undefined;

    private constructor(subject: LEntity, performer: LEntity) {
        this._subject = subject;
        this._performer = performer;
        this._onPerformed = undefined;
    }

    public static makeWithSkill(subject: LEntity, performer: LEntity, skillId: DSkillId): SEmittorPerformer {
        assert(skillId > 0);
        const i = new SEmittorPerformer(subject, performer);
        i._skillId = skillId;
        return i;
    }

    public static makeWithEmitor(subject: LEntity, performer: LEntity, emittor: DEmittor): SEmittorPerformer {
        const i = new SEmittorPerformer(subject, performer);
        i._emittor = emittor;
        return i;
    }

    public setSkillId(value: DSkillId): this {
        this._skillId = value;
        return this;
    }

    public setEmittor(value: DEmittor): this {
        this._emittor = value;
        return this;
    }

    public setItemEntity(value: LEntity): this {
        this._itemEntity = value;
        return this;
    }

    public setSelectedTargetItems(value: LEntity[]): this {
        this._selectedTargetItems = value;
        return this;
    }

    public setDffectDirection(value: number): this {
        this._effectDirection = value;
        return this;
    }

    public setProjectilePriorityEffectSet(value: DEffectSet): this {
        this._projectilePriorityEffectSet = value;
        return this;
    }

    public performe(cctx: SCommandContext, onPerformed?: SOnPerformedFunc | undefined): void {
        this._onPerformed = onPerformed;

        if (this._skillId > 0) {
            this.performeSkill(cctx, this._performer, this._skillId);
        }
        else if (this._emittor) {
            this.performeEffect(cctx, this._performer, this._emittor, (this._effectDirection > 0) ? this._effectDirection : this._performer.dir, this._itemEntity,  this._selectedTargetItems, 0);
        }
        else {
            throw new Error("Unreachable.");
        }
    }






    /**
     * スキル発動
     * 
     * 単純にスキルを発動する。地形や相手の状態による成否はこの中で判断する。
     */
    private performeSkill(cctx: SCommandContext, performer: LEntity, skillId: DSkillId): void {

        const skill = REData.skills[skillId];
        ///const effector = new SEffectorFact(entity, skill.effect);
        

        // もともと UntBehavior.onAction() で AttackActionId をフックして処理していたが、こちらに持ってきた。
        // Attack という Action よりは、「スキル発動」という Action を実行する方が自然かも。

        if (skill.message1.length > 0) {
            cctx.postMessage(tr2(skill.message1).format(UName.makeUnitName(performer), skill.name));
        }
        if (skill.message2.length > 0) {
            cctx.postMessage(tr2(skill.message2).format(UName.makeUnitName(performer), skill.name));
        }

        const effect = skill.emittor();
        if (effect) {
            this.performeEffect(cctx, performer, effect, performer.dir, undefined, [], skillId);
        }
    }

    private canPayParamCost(entity: LEntity, paramId: DParameterId, cost: DParamCost): boolean {
        if (cost.type == DParamCostType.Decrease) {
            if (entity.actualParam(paramId) < cost.value) return false;
        }
        else if (cost.type == DParamCostType.Increase) {
            const d = entity.idealParam(paramId) - entity.actualParam(paramId);
            if (d < cost.value) return false;
        }
        else {
            throw new Error("Unreachable.");
        }
        return true;
    }

    private payParamCost(entity: LEntity, paramId: DParameterId, cost: DParamCost): void {
        if (cost.type == DParamCostType.Decrease) {
            entity.gainActualParam(paramId, -cost.value);
        }
        else if (cost.type == DParamCostType.Increase) {
            entity.gainActualParam(paramId, cost.value);
        }
        else {
            throw new Error("Unreachable.");
        }
    }

    private canPaySkillCost(performer: LEntity, costs: DEmittorCost, item: LEntity | undefined): boolean {
        const performerCosts = costs.paramCosts[DSkillCostSource.Actor];
        if (performerCosts) {
            for (let paramId = 0; paramId < performerCosts.length; paramId++) {
                const cost = performerCosts[paramId];
                if (cost !== undefined) {
                    if (!this.canPayParamCost(performer, paramId, cost)) return false;
                }
            }
        }
        else {
            // No cost. Available.
        }

        const itemCosts = costs.paramCosts[DSkillCostSource.Item];
        if (itemCosts) {
            for (let paramId = 0; paramId < itemCosts.length; paramId++) {
                const cost = itemCosts[paramId];
                if (cost !== undefined) {
                    if (!item) return false;    // ItemCost があるのに item が無い場合は発動不可能
                    if (!this.canPayParamCost(item, paramId, cost)) return false;
                }
            }
        }
        else {
            // No cost. Available.
        }

        return true;
    }
    
    private paySkillCost(performer: LEntity, costs: DEmittorCost, item: LEntity | undefined): void {
        const performerCosts = costs.paramCosts[DSkillCostSource.Actor];
        if (performerCosts) {
            for (let paramId = 0; paramId < performerCosts.length; paramId++) {
                const cost = performerCosts[paramId];
                if (cost !== undefined) {
                    this.payParamCost(performer, paramId, cost);
                }
            }
        }

        const itemCosts = costs.paramCosts[DSkillCostSource.Item];
        if (itemCosts) {
            for (let paramId = 0; paramId < itemCosts.length; paramId++) {
                const cost = itemCosts[paramId];
                if (cost !== undefined) {
                    assert(item);
                    this.payParamCost(item, paramId, cost);
                }
            }
        }
    }

    private raiseSkillEmitted(cctx: SCommandContext, performer: LEntity, targets: LEntity[], skillId: DSkillId): void {
        const args: SkillEmittedArgs = {
            performer: performer,
            targets: targets,
            skillId: skillId,
        };
        REGame.eventServer.publish(cctx, REBasics.events.skillEmitted, args)
    }

    private callSkillPerformed(cctx: SCommandContext, entity: LEntity, targets: LEntity[], skillId: DSkillId): void {
        entity.iterateBehaviorsReverse(b => {
            b.onSkillPerformed(cctx, entity, targets, skillId);
            return true;
        });
    }

    private onPerformed(cctx: SCommandContext, targets: LEntity[]): void {
        if (this._onPerformed) {
            this._onPerformed(targets);
        }

        if (this._emittor) {
            const emittor = this._emittor;
            for (const target of targets) {
                target.iterateBehaviorsReverse(b => {
                    return b.onEffectPerformed(target, cctx, emittor) == SCommandResponse.Pass;
                });
            }
        }
    }

    
    /**
     * 
     * @param cctx 
     * @param performer 
     * @param emittor 
     * @param itemData 杖など
     */
    private performeEffect(
        cctx: SCommandContext,
        performer: LEntity,
        emittor: DEmittor,
        effectDir: number,
        itemEntity: LEntity | undefined,
        selectedItems: LEntity[],
        skillId: DSkillId): void {


        // コストで発動可否判断
        if (!this.canPaySkillCost(performer, emittor.costs, itemEntity)) {
            return;
        }

        // コスト消費
        this.paySkillCost(performer, emittor.costs, itemEntity);


        // 発動側アニメーション
        {
            if (emittor.selfAnimationId > 0) {
                cctx.postAnimation(performer, emittor.selfAnimationId, true);
            }
            if (emittor.selfSequelId > 0) {
                cctx.postSequel(performer, emittor.selfSequelId, true);
            }
        }


        //const subject = performer.getEntityBehavior(LBattlerBehavior);

        
        if (emittor.scope.range == DEffectFieldScopeRange.Performer) {
            const effectSubject = new SEffectorFact(this._subject, emittor.effectSet, SEffectIncidentType.IndirectAttack, effectDir/*performer.dir*/);
            if (itemEntity) {
                effectSubject.withIncidentEntityKind(itemEntity.kindDataId());
                effectSubject.withItem(itemEntity);
            }
            const effectContext = new SEffectContext(effectSubject, cctx.random());
    
            // if (emittor.effect.rmmzAnimationId) {
            //    cctx.postAnimation(performer, emittor.effect.rmmzAnimationId, true);
            // }

            const targets = [performer];
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            cctx.postCall(() => {
                effectContext.applyWithWorth(cctx, targets);
                this.onPerformed(cctx, targets);
                if (skillId > 0) {
                    this.raiseSkillEmitted(cctx, performer, targets, skillId);
                    this.callSkillPerformed(cctx, performer, targets, skillId);
                }
            });
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Front1) {

            // TODO: ユーザー側モーション
            cctx.postSequel(performer, REBasics.sequels.attack);
            
            // TODO: 正面3方向攻撃とかの場合はここをループする
            //for ()
            {
                // 攻撃対象決定
                //const target = cctx.findReactorEntityInBlock(UMovement.getFrontBlock(performer), DBasics.actions.AttackActionId);
                const targets = this.getTargetInBlock(UMovement.getFrontBlock(performer), emittor.scope);
                for (const target of targets)  {

                    const effectSubject = new SEffectorFact(this._subject, emittor.effectSet, SEffectIncidentType.DirectAttack, performer.dir);
                    if (itemEntity) {
                        effectSubject.withIncidentEntityKind(itemEntity.kindDataId());
                        effectSubject.withItem(itemEntity);
                    }
                    const effectContext = new SEffectContext(effectSubject, cctx.random());
                    //effectContext.addEffector(effector);


                    if (UMovement.checkDiagonalWallCornerCrossing(performer, performer.dir)) {
                        // 斜め向きで壁の角と交差しているので通常攻撃は通らない
                    }
                    else {
                        // const rmmzAnimationId = (emittor.effect.rmmzAnimationId < 0) ? subject.attackAnimationId() : emittor.effect.rmmzAnimationId;
                        // if (rmmzAnimationId > 0) {
                        //    cctx.postAnimation(target, rmmzAnimationId, true);
                        // }
                        
                        // TODO: SEffectSubject はダミー
                        cctx.post(target, performer, new SEffectSubject(performer), {effectContext: effectContext}, onAttackReaction)
                            .then(() => {
                                this.onPerformed(cctx, [target]);
                                if (skillId > 0) {
                                    //this.raiseSkillEmitted(cctx, performer, [target], skillId);
                                    this.callSkillPerformed(cctx, performer, [target], skillId);
                                }
                                return true;
                            });
                    }
                }
                
                // target が無くても、スキル発動したことは伝える
                if (skillId > 0) this.raiseSkillEmitted(cctx, performer, targets, skillId);
            }
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.StraightProjectile) {
            this.performeEffect_StraightProjectile(cctx, performer, emittor, itemEntity, performer.x, performer.y, performer.dir);
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.ReceiveProjectile) {
            const dir = this._effectDirection != 0 ? this._effectDirection : performer.dir;
            const block = USearch.findFirstWallInDirection(performer.x, performer.y, dir);
            this.performeEffect_StraightProjectile(cctx, performer, emittor, itemEntity, block.x(), block.y(), UMovement.reverseDir(dir));
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Selection) {
            const effectSubject = new SEffectorFact(this._subject, emittor.effectSet, SEffectIncidentType.IndirectAttack, effectDir/*performer.dir*/);
            if (itemEntity) {
                effectSubject.withIncidentEntityKind(itemEntity.kindDataId());
                effectSubject.withItem(itemEntity);
            }
            const effectContext = new SEffectContext(effectSubject, cctx.random());


            effectContext.applyWithWorth(cctx, selectedItems);
            this.onPerformed(cctx, selectedItems);
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Around || emittor.scope.range == DEffectFieldScopeRange.AroundAndCenter) {
            const withCenter = (emittor.scope.range == DEffectFieldScopeRange.AroundAndCenter);

            const targets: LEntity[] = [];
            USearch.iterateAroundEntities(performer.x, performer.y, emittor.scope.length, withCenter, (entity) => {
                if (!entity.equals(performer)) {
                    targets.push(entity);
                }
            });

            this.applyEffect(cctx, performer, emittor, targets, skillId, itemEntity);
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Center) {
            const targets: LEntity[] = [];
            const block = REGame.map.tryGetBlock(performer.x, performer.y);
            if (block) {
                for (const entity of block.getEntities()) {
                    if (!entity.equals(performer)) {
                        targets.push(entity);
                    }
                }
            }
            this.applyEffect(cctx, performer, emittor, targets, skillId, itemEntity);
        }
        else if (emittor.scope.range == DEffectFieldScopeRange.Room) {
            const targets: LEntity[] = [];
            REGame.map.room(performer.roomId()).forEachEntities(entity => {
                if (UAction.testFactionMatch(performer, entity, DRmmzEffectScope.Opponent_All)) {
                    targets.push(entity);
                };
            });
            this.applyEffect(cctx, performer, emittor, targets, skillId, itemEntity);
        }
        else {
            throw new Error("Not implemented.");
        }
    }
    private performeEffect_StraightProjectile(
        cctx: SCommandContext,
        performer: LEntity,
        emittor: DEmittor,
        itemEntity: LEntity | undefined,
        startX: number,
        startY: number,
        dir: number)
    {
        const bullet = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity(emittor.scope.projectilePrefabKey).id));
        REGame.map.appearEntity(bullet, startX, startY);
        bullet.dir = dir;

        // Projectile は item とは異なる Entity であり、Projectile 自体はデータベース上では Effect を持たない。
        // そのため、Projectile の発生原因となった item から Hit 時の Effect を取り出し、Projectile 衝突時にこれを発動する。
        const emittorEffects = itemEntity?.data().emittorSet.emittors(DEffectCause.Hit);
        // ↑今は杖用。杖を投げ当てた時と同じ効果を取り出す。

        //const actualEmittor = emittorEffects ?? emittor;
        let actualEmittor = emittor;
        if (emittorEffects) {
            assert(emittorEffects.length == 1); // TODO: 今は一つだけ
            actualEmittor = emittorEffects[0];
        }

        let actualEffectSet = actualEmittor.effectSet;
        if (this._projectilePriorityEffectSet) {
            actualEffectSet = this._projectilePriorityEffectSet;
        }

        LProjectableBehavior.startMoveAsEffectProjectile(cctx, bullet, new SEffectSubject(performer), dir, emittor.scope.length, actualEffectSet);
    }

    private applyEffect(cctx: SCommandContext, performer: LEntity, emittor: DEmittor, targets: LEntity[], skillId: DSkillId, itemEntity: LEntity | undefined) {
        
        const effectSubject = new SEffectorFact(this._subject, emittor.effectSet, SEffectIncidentType.DirectAttack, performer.dir);
        if (itemEntity) {
            effectSubject.withIncidentEntityKind(itemEntity.kindDataId());
            effectSubject.withItem(itemEntity);
        }
        const effectContext = new SEffectContext(effectSubject, cctx.random());
        
        cctx.postCall(() => {
            effectContext.applyWithWorth(cctx, targets);
            this.onPerformed(cctx, targets);
            if (skillId > 0) {
                this.raiseSkillEmitted(cctx, performer, targets, skillId);
                this.callSkillPerformed(cctx, performer, targets, skillId);
            }
        });
    }

    public getTargetInBlock(block: LBlock, scope: DEffectFieldScope): LEntity[] {
        if (scope.layerScope == DBlockLayerScope.TopOnly) {
            for (let i = DBlockLayerKind.Top; i >= 0; i--) {
                if (scope.layers.includes(i)) {
                    const entity = block.layer(i).firstEntity();
                    if (entity) {
                        return [entity];
                    }
                }
            }
            return [];
        }
        else if (scope.layerScope == DBlockLayerScope.All) {
            throw new Error("Not implemented.");
        }
        else {
            throw new Error("Unreachable.");
        }
    }
}
