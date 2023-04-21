import { DClarificationType, MRBasics } from "./MRBasics";
import { DBlockLayerKind, DSubComponentEffectTargetKey } from "./DCommon";
import { DBuffMode, DBuffType, DEffect, DEffectFieldScopeType, DEffectHitType, DParamCostType, DValuePoint, DParameterEffectApplyType, DParameterQualifying, DSkillCostSource, LStateLevelType, DBuffLevelOp } from "./DEffect";
import { DEmittor } from "./DEmittor";
import { DEntity, DIdentificationDifficulty } from "./DEntity";
import { DItemEffect } from "./DItemEffect";
import { DPrefab } from "./DPrefab";
import { DSkill } from "./DSkill";
import { DAutoRemovalTiming, DState, DStateIntentions, DStateRestriction } from "./DState";
import { DStateGroup } from "./DStateGroup";
import { MRData } from "./MRData";
import { assert, tr2 } from "../Common";
import { DRace } from "./DRace";
import { DParameterFlavorEffect, DValueAddition, DParameter } from "./DParameter";
import { DFlavorEffect, DSound } from "./DFlavorEffect";
import { DTextManager } from "./DTextManager";
import { DFactionType } from "./DFaction";
import { DEffectRef } from "./DEffectSuite";
import { DBehaviorInstantiation } from "./DBehavior";

export class MRSetup {

    public static setupParameter(data: DParameter) {

        const setupComon = (data: DParameter) => {
            {   // 味方の被ダメージ
                const p = new DParameterFlavorEffect();
                p.flavorEffect = new DFlavorEffect();
                p.flavorEffect.text = [DTextManager.actorDamage.replace("%2", "%3")];
                p.looksFaction = DFactionType.Neutral; // Neutral & Friendly
                p.point = DValuePoint.Actual;
                p.addition = DValueAddition.Loss;
                data.parameterFlavorEffects.push(p);
            }
            {   // 敵対者の被ダメージ
                const p = new DParameterFlavorEffect();
                p.flavorEffect = new DFlavorEffect();
                p.flavorEffect.text = [DTextManager.enemyDamage.replace("%2", "%3")];
                p.looksFaction = DFactionType.Hostile;
                p.point = DValuePoint.Actual;
                p.addition = DValueAddition.Loss;
                data.parameterFlavorEffects.push(p);
            }
            {   // 味方の増加・回復
                const p = new DParameterFlavorEffect();
                p.flavorEffect = new DFlavorEffect();
                p.flavorEffect.text = [DTextManager.actorRecovery];
                p.looksFaction = DFactionType.Neutral; // Neutral & Friendly
                p.point = DValuePoint.Actual;
                p.addition = DValueAddition.Gain;
                data.parameterFlavorEffects.push(p);
            }
            {   // 敵対者の増加・回復
                const p = new DParameterFlavorEffect();
                p.flavorEffect = new DFlavorEffect();
                p.flavorEffect.text = [DTextManager.enemyRecovery];
                p.looksFaction = DFactionType.Hostile;
                p.point = DValuePoint.Actual;
                p.addition = DValueAddition.Gain;
                data.parameterFlavorEffects.push(p);
            }
            {   // 最大値の変化は "回復した" ではなく "増えた" にしたい。
                const p = new DParameterFlavorEffect();
                p.flavorEffect = new DFlavorEffect();
                p.flavorEffect.text = [DTextManager.actorGain];
                p.looksFaction = DFactionType.Neutral; // Neutral & Friendly & Hostile
                p.point = DValuePoint.Growth;
                p.addition = DValueAddition.Gain;
                data.parameterFlavorEffects.push(p);
            }
    
            if (data.id == MRBasics.params.hp) {
                // HP の場合、無効ダメージだった場合は NoDamage を表示したい (ツクールがそうなっているので)
                {   // 味方
                    const p = new DParameterFlavorEffect();
                    p.flavorEffect = new DFlavorEffect();
                    p.flavorEffect.text = [DTextManager.actorNoDamage];
                    p.looksFaction = DFactionType.Neutral;
                    p.point = DValuePoint.Actual;
                    p.addition = DValueAddition.None;
                    data.parameterFlavorEffects.push(p);
                }
                {   // 敵対
                    const p = new DParameterFlavorEffect();
                    p.flavorEffect = new DFlavorEffect();
                    p.flavorEffect.text = [DTextManager.enemyNoDamage];
                    p.looksFaction = DFactionType.Hostile;
                    p.point = DValuePoint.Actual;
                    p.addition = DValueAddition.None;
                    data.parameterFlavorEffects.push(p);
                }
            }
            else {
                const p = new DParameterFlavorEffect();
                p.flavorEffect = new DFlavorEffect();
                p.flavorEffect.text = [tr2("%1の%2は変化しなかった。")];
                p.looksFaction = DFactionType.Neutral;
                p.point = DValuePoint.Actual;
                p.addition = DValueAddition.None;
                data.parameterFlavorEffects.push(p);
            }
        }

        switch  (data.id) {
            case MRBasics.params.hp:
            case MRBasics.params.mp:
            case MRBasics.params.atk:
            case MRBasics.params.def:
            case MRBasics.params.mat:
            case MRBasics.params.mdf:
            case MRBasics.params.agi:
            case MRBasics.params.luk:
            case MRBasics.params.tp:
                
            //case MRBasics.params.fp:
            //case MRBasics.params.pow:
            //case MRBasics.params.upgradeValue:
            case MRBasics.params.remaining:
            //case MRBasics.params.capacity:
            case MRBasics.params.gold:
            //case MRBasics.params.level:
            case MRBasics.params.exp:
                setupComon(data);
                break;
            case MRBasics.params.fp: {
                break;
            }
            case MRBasics.params.pow: {
                setupComon(data);
                // 一律「増えた・減った」にしたいので、上書き
                data.parameterFlavorEffects = data.parameterFlavorEffects.filter(x => x.looksFaction == DFactionType.Neutral);
                {
                    const p = new DParameterFlavorEffect();
                    p.flavorEffect = new DFlavorEffect();
                    p.flavorEffect.text = [DTextManager.actorLoss];
                    p.looksFaction = DFactionType.Neutral; // Neutral & Friendly & Hostile
                    p.point = DValuePoint.Actual;
                    p.addition = DValueAddition.Loss;
                    data.parameterFlavorEffects.push(p);
                }
                break;
            }
            case MRBasics.params.upgradeValue: {
                setupComon(data);
                // 一律「増えた・減った」にしたいので、上書き
                data.parameterFlavorEffects = data.parameterFlavorEffects.filter(x => x.looksFaction == DFactionType.Neutral);
                {
                    const p = new DParameterFlavorEffect();
                    p.flavorEffect = new DFlavorEffect();
                    p.flavorEffect.text = [DTextManager.actorGain];
                    p.looksFaction = DFactionType.Neutral; // Neutral & Friendly & Hostile
                    p.point = DValuePoint.Actual;
                    p.addition = DValueAddition.Gain;
                    data.parameterFlavorEffects.push(p);
                }
                {
                    const p = new DParameterFlavorEffect();
                    p.flavorEffect = new DFlavorEffect();
                    p.flavorEffect.text = [DTextManager.actorLoss];
                    p.looksFaction = DFactionType.Neutral; // Neutral & Friendly & Hostile
                    p.point = DValuePoint.Actual;
                    p.addition = DValueAddition.Loss;
                    data.parameterFlavorEffects.push(p);
                }
                break;
            }
        }

        // TODO: drain
    }

    public static setupPrefab(data: DPrefab): void {
        
        switch (data.key) {
            case "kPrefab_ActorA":
                data.downImage.characterName = "Damage1";
                data.downImage.characterIndex = 0;
                data.downImage.direction = 4;
                data.downImage.pattern = 0;
                data.downImage.directionFix = true;
                data.downImage.stepAnime = false;
                data.downImage.walkAnime = false;
                break;
        }
    }

    public static setupRace(data: DRace): void {
        switch (data.key) {
            case "kRace_アンデッド系":
                data.traits.push({code: MRBasics.traits.ElementedRecoveryRate, dataId: 0, value: -1.0});
                break;
        }
    }
    
    public static setupActor(entity: DEntity): void {
        const actor = entity.actorData();
        switch (actor.id) {
            case 1:
                //entity.selfTraits.push({ code: REBasics.traits.TRAIT_STATE_RATE, dataId: REData.getState("kState_UT爆発四散").id, value: 0 });
                //entity.selfTraits.push({ code: REBasics.traits.TRAIT_STATE_RESIST, dataId: REData.getState("kState_UT爆発四散").id, value: 0 });
                break;
        }
    }
    
    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    public static setupDirectly_DItem(entity: DEntity): void{
        const data = entity.item();

        // switch (entity.entity.kindId) {
        //     case MRBasics.entityCategories.WeaponKindId:
        //         this.setupWeaponCommon(entity);
        //         break;
        //     case MRBasics.entityCategories.ShieldKindId:
        //         this.setupShieldCommon(entity);
        //         break;
        // }

        switch (entity.entity.key) {
            // case "kEntity_皮の盾A":
            //     entity.equipmentTraits.push({ code: MRBasics.traits.SurvivalParamLossRate, dataId: MRBasics.params.fp, value: 0.5 });
            //     entity.selfTraits.push({ code: MRBasics.traits.ParamDamageRate, dataId: MRBasics.params.upgradeValue, value: 0.0 });
            //     break;
            // case "kEntity_青銅の盾A":
            //     break;
            // case "kEntity_うろこの盾A":
            //     entity.equipmentTraits.push({ code: MRBasics.traits.SkillGuard, dataId: MRData.getSkill("kSkill_毒攻撃").id, value: 0 });
            //     entity.equipmentTraits.push({ code: MRBasics.traits.SkillGuard, dataId: MRData.getSkill("kSkill_毒攻撃_強").id, value: 0 });
            //     break;
            // case "kEntity_金の盾A":
            //     entity.selfTraits.push({ code: MRBasics.traits.ParamDamageRate, dataId: MRBasics.params.upgradeValue, value: 0.0 });
            //     break;
            case "kEntity_目覚めの指輪A":
                this.setupRingCommon(entity);
                break;
            case "kEntity_ちからの指輪A":
                this.setupRingCommon(entity);
                assert(entity.equipment);
                entity.equipment.parameters[MRBasics.params.pow] = { value: 3, upgradeRate: 0 };
                break;
            case "kEntity_高跳びの指輪A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: MRBasics.traits.SuddenSkillEffect, dataId: MRData.getSkill("kSkill_Warp").id, value: 1.0 / 16.0 });
                break;
            case "kEntity_睡眠よけの指輪A":
                this.setupRingCommon(entity);
                break;
            case "kEntity_ハラヘリの指輪A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: MRBasics.traits.SurvivalParamLossRate, dataId: MRBasics.params.fp, value: 2.0 });
                break;
            case "kEntity_毒消しの指輪A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: MRBasics.traits.ParamDamageRate, dataId: MRBasics.params.pow, value: 0.0 });
                break;
            case "kEntity_影読みの指輪A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: MRBasics.traits.ForceVisible, dataId: 0, value: 0 });
                break;
            case "kEntity_インプよけの指輪A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: MRBasics.traits.SkillGuard, dataId: MRData.getSkill("kSkill_レベルダウン").id, value: 0 });
                entity.equipmentTraits.push({ code: MRBasics.traits.SkillGuard, dataId: MRData.getSkill("kSkill_毒攻撃_強").id, value: 0 });
                break;
            case "kEntity_忍び足の指輪A":
                this.setupRingCommon(entity);
                break;
            case "kEntity_罠よけの指輪A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: MRBasics.traits.DisableTrap, dataId: 0, value: 0 });
                break;
            case "kEntity_ハラヘラズの指輪A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: MRBasics.traits.SurvivalParamLossRate, dataId: MRBasics.params.fp, value: 0.0 });
                break;
            case "kEntity_きれいな指輪A":
                this.setupRingCommon(entity);
                break;
            case "kEntity_木の矢A":
                this.setupArrowCommon(entity);
                entity.shortcut = true;
                entity.display.stackedName = "%1本の" + entity.display.name;
                entity.selfTraits.push({code: MRBasics.traits.Stackable, dataId: 0, value: 0});
                entity.addReaction(MRBasics.actions.ShootActionId, undefined, true);
                entity.initialStackCount = { minValue: 2, maxValue: 7 };
                break;
            case "kEntity_鉄の矢A":
                this.setupArrowCommon(entity);
                entity.shortcut = true;
                entity.display.stackedName = "%1本の" + entity.display.name;
                entity.selfTraits.push({code: MRBasics.traits.Stackable, dataId: 0, value: 0});
                entity.addReaction(MRBasics.actions.ShootActionId, undefined, true);
                entity.initialStackCount = { minValue: 2, maxValue: 7 };
                break;
            case "kEntity_銀の矢A":
                this.setupArrowCommon(entity);
                entity.shortcut = true;
                entity.display.stackedName = "%1本の" + entity.display.name;
                entity.selfTraits.push({code: MRBasics.traits.Stackable, dataId: 0, value: 0});
                entity.selfTraits.push({code: MRBasics.traits.PenetrationItem, dataId: 0, value: 0});
                entity.addReaction(MRBasics.actions.ShootActionId, undefined, true);
                entity.initialStackCount = { minValue: 2, maxValue: 7 };
                break;
            case "kEntity_毒矢A":
                this.setupArrowCommon(entity);
                entity.shortcut = true;
                entity.display.stackedName = "%1本の" + entity.display.name;
                entity.selfTraits.push({code: MRBasics.traits.Stackable, dataId: 0, value: 0});
                entity.addReaction(MRBasics.actions.ShootActionId, undefined, true);
                entity.initialStackCount = { minValue: 2, maxValue: 7 };
                break;
            case "kEntity_GoldA":
                this.setupItemCommon(entity);
                entity.addReaction(MRBasics.actions.collide, entity.mainEmittor());
                //entity.addEmittor(DEffectCause.Hit, REData.cloneEmittor(entity.mainEmittor()));
                break;
            case "kEntity_弟切草A": {
                // const mainEmittor = entity.mainEmittor();
                // const effect1 = mainEmittor.effectSuite.targetEffect(0);
                // const effect2 = MRData.cloneEffect(effect1.effect);

                // // effect1: 一般用 (HP 回復のみ)
                // effect1.conditions.fallback = true;

                // // effect2: Actor 専用 (最大HP の上昇効果もある)
                // const effect2Ref = new DEffectRef(effect2.id);
                // effect2Ref.conditions.targetCategoryId = MRBasics.entityCategories.actor;
                // effect2Ref.effect.parameterQualifyings[0].conditionFormula = "a.hp < a.max_hp";
                // effect2Ref.effect.parameterQualifyings.push(
                //     new DParameterQualifying(MRBasics.params.hp, "2", DParameterEffectApplyType.Recover)
                //     .withApplyTarget(DValuePoint.Growth)
                //     .withConditionFormula("a.hp >= a.max_hp"));
                // mainEmittor.effectSuite.addTargetEffect(effect2Ref);

                // const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                // break;

                // const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                // // entity.addReaction(REBasics.actions.EatActionId, 0);
                // // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                // //const emittor = entity.getReaction(REBasics.actions.EatActionId).emittor();
                // eatEmittor.effectSet.effect(0).effect.parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "999", DParameterEffectApplyType.Recover));
                // eatEmittor.effectSet.effect(0).effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.removeStatesByIntentions, value: DStateIntentions.Negative });
                break;
            }
            case "kEntity_ドラゴン草A":
                this.setupGrassCommon(entity);
                //entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.addReaction(MRBasics.actions.EatActionId, MRData.getSkill("kSkill_炎のブレス_直線").emittor());
                //entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                //entity.addEmittor(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_直線").emittor());
                break;
            case "kEntity_しびれ草A":
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                break;
            case "kEntity_きえさり草A":
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                break;
            case "kEntity_RevivalGrassA":
                this.setupGrassCommon(entity);
                entity.entity.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("RevivalItem").id, undefined));
                entity.addReaction(MRBasics.actions.dead, entity.mainEmittor());
                break;
            case "kEntity_System_炎のブレスA":
                entity.volatilityProjectile = true;
                break;
            case "kEntity_System_MagicBulletA":
                entity.volatilityProjectile = true;
                break;
            case "kEntity_ふきとばしの杖A":
                //this.setupStaffCommon(entity);
                //data.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").effect);
                entity.addReaction(MRBasics.actions.collide, MRData.getSkill("kSkill_ふきとばし").emittor());
                //entity.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_ふきとばし").emittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                break;
            case "kEntity_大損の杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.hp, "b.hp / 2", DParameterEffectApplyType.Damage));
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(55);
                break;
            }
            case "kEntity_透明の杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_ADD_STATE, dataId: MRData.getState("kState_UT透明").id, value1: 1.0, value2: 0 });
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(101);
                break;
            }
            case "kEntity_倍速の杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.buffQualifying.push({
                    paramId: MRBasics.params.agi,
                    level: 1,
                    levelType: DBuffLevelOp.Add,
                    type: DBuffType.Add,
                    turn: 10,
                });
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(12);
                break;
            }
            case "kEntity_いかずちの杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.parameterQualifyings.push(
                    new DParameterQualifying(MRBasics.params.hp, "35", DParameterEffectApplyType.Damage)
                    .withVariance(20));
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(77);
                break;
            }
            case "kEntity_混乱の杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_ADD_STATE, dataId: MRData.getState("kState_UT混乱").id, value1: 1.0, value2: 0 });
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(63);
                break;
            }
            case "kEntity_分裂の杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.division, entityId: 0, dataId: 0, value: 0 });
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(106);
                break;
            }
            case "kEntity_睡眠の杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_ADD_STATE, dataId: MRData.getState("kState_睡眠").id, value1: 1.0, value2: 0 });
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(62);
                break;
            }
            case "kEntity_封印の杖A":
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                break;
            case "kEntity_変化の杖A":
                //this.setupStaffCommon(entity);
                entity.addReaction(MRBasics.actions.collide, MRData.getSkill("kSkill_変化").emittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 3;
                entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                /*
                    杖のメモ (2021/7/5時点のこうしたい)
                    ----------
                    [振る] はスキルの発動。火炎草が "Eat" でブレススキルを発動するのと同じ。
                    魔法弾はスキル側が生成する。
                    もし炎ブレススキルと合わせるなら、魔法弾スキルを効果の数だけ用意することになる。
                    でも実際はそのほうがいいかもしれない。投げ当てと魔法弾で効果が変わるものもあるため。(トンネルの杖)
                    でもやっぱりほとんどの魔法弾は、投げ当てと同じ効果を発動する。そういった設定も欲しいかも。

                    ある種の、elona の「銃器」みたいな考えの方がいいだろうか？
                    杖と魔法弾、銃と弾丸。
                    弾丸の威力に銃の性能が反映されるように、魔法弾の効果に杖の効果が反映される感じ。
                    投げと魔法弾で異なる効果は、魔法弾に独自の Effect を持たせる。
                    そうでなければ、魔法弾は「自分を射出したEntity(杖) の Cause.Hit の効果を発動する」とか。
                */
                break;
            case "kEntity_高跳びの杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.randomWarp, entityId: 0, dataId: 0, value: 0 });
                break;
            }
            case "kEntity_鈍足の杖A": {
                this.setupStaffCommon(entity);
               // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.buffQualifying.push({
                    paramId: MRBasics.params.agi,
                    level: -1,
                    levelType: DBuffLevelOp.Add,
                    type: DBuffType.Add,
                    turn: 10,
                });
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(54);
                break;
            }
            case "kEntity_もろはの杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const emittor = entity.mainEmittor();
                //emittor.selfAnimationId = 60;

                //emittor.scope.range = DEffectFieldScopeRange.Performer;
                const effect1 = emittor.effectSuite.targetEffect(0);
                effect1.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(60);

                const effect2 = MRData.getItem("kEntity_もろはの杖A_使用者側効果").mainEmittor().effectSuite.targetEffect(0);
                effect2.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(60);
                emittor.effectSuite.succeededSelfEffect = effect2;

                break;
            }
            case "kEntity_転ばぬ先の杖A":
                this.setupStaffCommon(entity);
                entity.mainEmittor().effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.stumble, entityId: 0, dataId: 0, value: 0 });
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;

                entity.isTraitCharmItem = true;
                //entity.affestTraits.push({ code: REBasics.traits.SealActivity, dataId: REBasics.actions.stumble, value: 0 });
                /*
                [2021/10/27]
                ----------
                Seal を利用するのはちょっと違う気がする。封印というより、リソースを消費して防御したい。
                ある意味カウンターに該当するが、これは防御目的になり、ダメージや効果の減少を扱う。
                RMMZはこのような仕組みは「反撃」「魔法反射」などがあるが、それぞれ通常攻撃や元スキルに限るなど制約は非常に大きい。
                実質今回の要求のように、防御目的で何か効果を発動する仕組みは存在しない。

                とりあえずRMMZエディタで強引に定義するなら、スキルの一つとして作る方がいいだろう。少なくともターン数などは持たないのでステートではない。

                一瞬だけステートを付加する案は？
                アリそうだけど、その効果終了のタイミングが難しい。例えば連撃を受けた場合はその分だけコスト減が発生してほしい。
                RMMZでは「防御」がステート扱いなのでイメージはしやすいのかもしれないが…。

                スキルとステートのハイブリッドがよいかも？
                これなら、カウンター攻撃と同じように発動できる。
                - onActivityで反応
                - EmittorPerformer で、itemEntity に対してコストを要求する
                - 転倒防止ステートを付加する

                こんな複雑なことする必要ある？
                機能の組み合わせで行けそうではある一方、抽象的すぎるのが心配。

                バリアみたいな考えにしてみる？
                持っている間、ステートを付与するような感じ。

                コスト減算は使い捨ての盾と似ているようだがちょっと違う。そっちは後処理。こっちは前処理。

                余りにも汎用性を考えすぎて、例えばステートにしても、ステートのほかのフィールドがほとんど意味をなさない、となればステートにする必要もない。

                どんなときにカウンターしたい？
                - 特定の属性の攻撃を受けた時 (誘爆など。または、RMMZにある物理攻撃・魔法攻撃)
                - 特定の Activity を実行するとき (Action, Reaction)
                
                そもそもどんなものを予防したい？
                - サビよけ
                - 盗み守り
                - 所持金守り
                - ついばみ守り
                - 転び防止
                - 催眠無効
                - 混乱無効
                - にぎり避け
                - 受け流し
                - 呪い無効
                - パラメータダウン無効
                - はじきよけ
                - 罠除け
                ステートはともかく、具体的な処理が伴う盗み、はじきなどは、あらかじめ Trait として設定された「盗みよけ」が存在するかどうかで、
                処理自体を行うかどうかを内部的に判断することにした。これは全部 Activity にしきれない背景もある。

                ざっと分類すると
                - パラメータ変化の可否
                - ステート変化の可否
                - 動作の可否

                当初は全部 Action-Reaction の仕組みで何とかしようとしてたけど… どうなんだろう？

                SkillともStateとも違うデータ構造があったほうが良いとは思うが、
                それを設けたとしても汎用化しづらい。
                そうすると、例えば Protect みたいな予防用データ構造を設けたとしても Behavior と大して変わらない運用になる。
                それなら Behavior でいいだろう。
                具象的な実装が増えることを懸念して Behavior にするのを躊躇っていたが、今はこのほうがよさそう。
                実装を続ける中で共通化できる部分も見えてくるだろう。
                …ということで、ひとまずは Behavior で行ってみる。当初の計画通りと言えばその通りだけど。

                あとはどうやって通知するか。
                ポイントとしては、発動側のアクション自体を取りやめるのではなく、効果および後処理(盗んだ後にワープなど)をリジェクトすること。
                行動の可否については Action-Reaction の仕組みでも可能だが、パラメータとステートについては新たな専用のメソッドが必要になりそう。

                onEffectBehaviorReaction とか？
                IDはなんか、EffectBehaviorId でいい気がする。
                パラメータは ParamId, ステートは StateId で、それぞれ onEffectParam, onEffectState とかを用意することで、
                「Effect」として一貫性は持たせられそう。

                [2021/10/28]
                ----------
                転び石はダメージと転びは別の仕組みで適用される。そのためEffectBehaviorだけ防止しても、ダメージは防止できない。
                対策としては…
                A. Effect自体の発動を無効にする
                B. Effectを複数に分けて、最初の転倒が防止されたら後続のダメージを与えるEffectは発動しない
                C. どのタイミングでリジェクトするか、preview 側で決める
                考えなくてはならないこととして、
                - 例えば毒攻撃は、毒を防止されても攻撃は通したい

                C はやめたほうがいいかも。リジェクト側が扱いたいのはあくまで「転倒を防止したい」「毒を防止したい」「そうび弾きを防止したい」
                といったことであって、それに付属するダメージ等他Effectまで関心を持つべきではないだろう。
                - 転びであれば、付属する微ダメージは転びの表現の一部
                - 毒攻撃であれば、HPダメージにあくまでオプションとして付く効果
                …というように考えることもできる。
                
                [2021/10/31] Effect 側が RejectionLevel を持つのはやめたほうがいいかも
                ----------
                途中まで実装したけどやめてみる。
                攻撃と一言にいっても、装備につく印やステートによって、ある Effect に追加の EffectBehavior や SpecialEffect が付くことがある。
                Level.All(ひとつでも効果が無効なら、Effect全体を無効化)していると、そういった追加によって攻撃全体がキャンセルされる可能性がある。
                例えば、転びの追加効果のある攻撃、など。
                かなりコーナーケースではあるとおもうけど、拡張に対して回避の難しい問題が潜在することになるので、やめたいところ。

                スキル、Effect, EffectBehavior, SpecialEffect などそれぞれでリジェクトするかを Behavior 側で判断できる仕組みにしてみる。
                */
                break;
            case "kEntity_死の杖A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.WaveActionId, MRData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[MRBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSuite.targetEffect(0);
                effect.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(65);
                break;
            }


            case "kEntity_眠りガスA": {
                const emittor = entity.mainEmittor();
                emittor.selfAnimationId = 35;
                emittor.scope.range = DEffectFieldScopeType.Center;
                break;
            }
            case "kEntity_地雷A": {
                const emittor = entity.mainEmittor();
                const effect = emittor.effectSuite.targetEffect(0);
                
                emittor.scope.range = DEffectFieldScopeType.AroundAndCenter;
                emittor.scope.length = 1;
                emittor.selfAnimationId = 109;
                //emittor.selfSequelId = REBasics.sequels.explosion;
                //effect.qualifyings.specialEffectQualifyings.push({code: DSpecialEffectCodes.DeadlyExplosion, dataId: 0, value1: 0, value2: 0});
                const pp = new DParameterQualifying(MRBasics.params.hp, "b.hp / 2", DParameterEffectApplyType.Damage)
                    .withElementId(MRBasics.elements.explosion);
                pp.elementIds.push(MRData.getElement("kElement_DeathExplosion").id);
                effect.effect.parameterQualifyings.push(pp);
                    // effect.effect.parameterQualifyings.push(
                    //     new DParameterQualifying(0, "0", DParameterEffectApplyType.Damage)
                    //     .withElementId(REData.getAttackElement("kElement_DeathExplosion").id));
                // effect.effect.parameterQualifyings.push({
                //     parameterId: REBasics.params.hp,
                //     applyTarget: DParameterApplyTarget.Current,
                //     elementId: REBasics.elements.explosion,
                //     formula: "b.hp / 2",
                //     applyType: DParameterEffectApplyType.Damage,
                //     variance: 0,
                //     silent: false,
                // });
                //effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UT爆発四散").id, value1: 1.0, value2: 0});

                // 必中だと耐性を持っているはずの Player も即死してしまうので。
                effect.effect.hitType = DEffectHitType.Magical;

                entity.counterActions.push({ conditionAttackType: MRBasics.elements.explosion, emitSelf: true });

                //entity.selfTraits.push({ code: REBasics.traits.TRAIT_STATE_RESIST, dataId: REData.getState("kState_UT爆発四散").id, value: 0 });

                /*
                地雷でEnemy側に「ダメージを受けた」メッセージが出る問題
                ----------

                地雷側に、対象別の効果を設ける？
                →やめたほうがいいかも。地雷効果をどのように受けるかは相手側による。普通の敵は消滅するが、パワーアップする者もいるし、誘爆することもある。

                SubEffectという仕組みはあり今は装備のサビ効果で使用しているが、これは本当にスキル側の都合を定義するだけ。
                相手側がメッキされているとか、そういった事情は考慮しない。

                しかし「致死性の爆発」という特徴は Effect 側の設定にするべき。
                致死性の爆発にも、ダメージ 1/2 や 1/4、HP1にするなど様々なので、この式は設定できるようにするべき。
                そうすると方針は、
                A. 「致死性の爆発」をTraitにして、これを受け付けた場合はダメージ計算を無しにする。
                B. 「致死性の爆発」をState付加にして、これを受け付けた場合はダメージ計算を無しにする。
                …どちらにしてもダメージ計算を何とかする仕組みは必要になる。
                前者は Behavior の実装が必要であり汎用化できないのでできれば避けたいが…。
                ダメージ計算を考えても、State の方が有利かも。
                ツクールデフォルトとは多分異なるが、戦闘不能系ステートが付加されたらParamResultを全部クリアしてしまう、で行けそう。
                */
                /*
                [2022/5/29] 即死爆発
                ----------
                これまでは戦闘不能ステート (kState_UT爆発四散) を用いることで対策してきた。
                しかしこれだとデフォが消滅になるため、重要なオブジェクトには間違いなく爆死ステート耐性を持たせなければならない。
                階段などに指定し忘れると、ゲームが進行不能になる。(実際に遇った)
                なので、デフォは耐性持ちにしたい。
                
                それか、「ある属性に対する脆弱性」のような Trait で実現したほうがいいだろうか？

                ### デフォでステート耐性を持たせる場合
                - 「持たせない」という指定をどうするのか、逆にちょっと仕様がすっきりしないかも。
                - RMMZ で同じ「アイテム」画面で設定するが、カテゴリによってデフォが異なるので、何に対しでデフォで耐性つけるのか仕様を考える必要がある。
                  - 通常のアイテムは耐性無し
                  - トラップは耐性あり、など
                - どのステートをデフォの耐性アリとするのか？の指定をどうするか（kState_UT爆発四散 だけでよいのか？）

                ### 脆弱性システムを作る場合
                - 必要なものに Trait などを指定すればよいので、「脆弱性が "ある"」というイメージで設定しやすい。
                - デフォが脆弱性無しなので、少なくとも想定外のオブジェクトが消えてしまう問題を回避できる。

                ### 属性脆弱 vs ステート脆弱
                どちらでもよさそう。
                - 爆発属性は自然。爆発戦闘不能というステートを作るとすると、爆発耐性の無い Entity にとっては不要なステートが付かないような工夫が要る。
                - 毒状態が付いたら即死するようなモンスターのデザインは在りかも。

                */
                break;
            }
            case "kEntity_トラバサミA": {
                const emittor = entity.mainEmittor();
                const effect = emittor.effectSuite.targetEffect(0);
                emittor.scope.range = DEffectFieldScopeType.Center;
                effect.effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: MRData.getState("kState_UTトラバサミ").id, value1: 1.0, value2: 0});
                break;
            }
            case "kEntity_バネA": {
                const emittor = entity.mainEmittor();
                const effect = emittor.effectSuite.targetEffect(0);
                emittor.scope.range = DEffectFieldScopeType.Center;
                effect.effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.randomWarp, entityId: 0, dataId: 0, value: 0 });
                break;
            }
            case "kEntity_転び石A":
                entity.mainEmittor().scope.range = DEffectFieldScopeType.Center;
                entity.mainEmittor().effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.stumble, entityId: 0, dataId: 0, value: 0 });
                break;
            case "kEntity_木の矢の罠A": {
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.ReceiveProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_木の矢A";
                break;
            }
            case "kEntity_毒矢の罠A": {
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.ReceiveProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_毒矢A";
                emittor.effectSuite.targetEffect(0).effect.parameterQualifyings.push(
                    new DParameterQualifying(MRBasics.params.pow, "1", DParameterEffectApplyType.Damage));
                // emittor.effectSet.effect(0).effect.parameterQualifyings.push({
                //     parameterId: REBasics.params.pow,
                //     applyTarget: DParameterApplyTarget.Current,
                //     elementId: 0,
                //     formula: "1",
                //     applyType: DParameterEffectApplyType.Damage,
                //     variance: 0,
                //     silent: false,
                // });
                break;
            }
            case "kEntity_錆ワナA":
                break;
            case "kEntity_落とし穴A": {
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Center;
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.transferToLowerFloor, entityId: 0, dataId: 0, value: 0});
                break;
            }
            case "kEntity_突風の罠A": {
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Center;
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.transferToNextFloor, entityId: 0, dataId: 0, value: 0 });
                emittor.selfAnimationId = 94;
                break;
            }
            case "kEntity_保存の壺A":
                entity.addReaction(MRBasics.actions.PutInActionId);
                entity.addReaction(MRBasics.actions.PickOutActionId);
                entity.entity.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("Inventory").id, {code: "Inventory", minCapacity: 4, maxCapacity: 6, storage: true}));
                break;
            case "kEntity_くちなしの巻物A":
                this.setupScrollCommon(entity);
                //entity.effectSet.mainEmittor().effect.otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(MRBasics.actions.ReadActionId, entity.mainEmittor());
                //entity.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kEntity_ワナの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.trapProliferation, entityId: 0, dataId: 0, value: 0 });
                emittor.selfAnimationId = 54;
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_メッキの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Selection;
                emittor.effectSuite.targetEffect(0).effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: MRData.getState("kState_System_Plating").id, value1: 1.0, value2: 0});
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(12);
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_地獄耳の巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Performer;
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.clarification, entityId: 0, dataId: 0, value: DClarificationType.Unit });
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.performeSkill, entityId: 0, dataId: MRData.getSkill("kSkill_アイテム擬態解除_全体").id, value: 0 });
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(44);
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_千里眼の巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Performer;
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.clarification, entityId: 0, dataId: 0, value: DClarificationType.Item });
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(44);
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_あかりの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Performer;
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.clarification, entityId: 0, dataId: 0, value: DClarificationType.Unit });
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.clarification, entityId: 0, dataId: 0, value: DClarificationType.Trap });
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.clarification, entityId: 0, dataId: 0, value: DClarificationType.Terrain });
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.clarification, entityId: 0, dataId: 0, value: DClarificationType.Sight });
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(44);
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_天の恵みの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = MRData.cloneEmittor(MRData.getSkill("kSkill_武器強化").emittor());
                emittor.scope.range = DEffectFieldScopeType.Performer;
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_地の恵みの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = MRData.cloneEmittor(MRData.getSkill("kSkill_防具強化").emittor());
                emittor.scope.range = DEffectFieldScopeType.Performer;
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_おはらいの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Performer;
                //emittor.effectSet.effect(0).effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.dispelEquipments });
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(46);

                
                const effect1 = MRData.cloneEffect(MRData.getSkill("kSkill_解呪").emittor().effectSuite.targetEffect(0).effect);
                const effect2 = MRData.cloneEffect(MRData.getSkill("kSkill_解呪").emittor().effectSuite.targetEffect(0).effect);
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.WeaponKindId);
                effect2.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.ShieldKindId);
                emittor.effectSuite.addTargetEffect(new DEffectRef(effect1.id));
                emittor.effectSuite.addTargetEffect(new DEffectRef(effect2.id));

                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_食料の巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Selection;
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.changeInstance, entityId: MRData.getItem("kEntity_大きなおにぎりA").id, dataId: 0, value: 0 });
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(2);
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_祈りの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Selection;
                emittor.effectSuite.targetEffect(0).effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.remaining, "5", DParameterEffectApplyType.Recover));
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(46);
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_かなしばりの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Around;
                emittor.scope.length = 1;
                emittor.effectSuite.targetEffect(0).effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: MRData.getState("kState_UTかなしばり").id, value1: 1.0, value2: 0});
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(15);
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_真空切りの巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Room;
                emittor.effectSuite.targetEffect(0).effect.parameterQualifyings.push(
                    new DParameterQualifying(MRBasics.params.hp, "35", DParameterEffectApplyType.Damage)
                    .withVariance(20));
                emittor.selfAnimationId = 94;
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_時の砂の巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Performer;
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.restartFloor, entityId: 0, dataId: 0, value: 0 });
                entity.addReaction(MRBasics.actions.ReadActionId, emittor);
                emittor.selfAnimationId = 118;
                break;
            }
            case "kEntity_脱出の巻物A":
                this.setupScrollCommon(entity);
                entity.mainEmittor().effectSuite.targetEffect(0).effect.otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(MRBasics.actions.ReadActionId, entity.mainEmittor());
                entity.addReaction(MRBasics.actions.collide, MRData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                //entity.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kEntity_聖域の巻物A":
                this.setupScrollCommon(entity);
                entity.addReaction(MRBasics.actions.ReadActionId);
                entity.addReaction(MRBasics.actions.collide, MRData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kEntity_識別の巻物A":
                this.setupScrollCommon(entity);
                entity.mainEmittor().scope.range = DEffectFieldScopeType.Selection;
                entity.mainEmittor().effectSuite.targetEffect(0).effect.otherEffectQualifyings.push({key: "kSystemEffect_識別"});
                entity.addReaction(MRBasics.actions.ReadActionId, entity.mainEmittor());
                //entity.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kEntity_壺増大の巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Selection;
                entity.addReaction(MRBasics.actions.ReadActionId, entity.mainEmittor());
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.gainCapacity, entityId: 0, dataId: 0, value: 1 });
                break;
            }
            case "kEntity_壺縮小の巻物A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeType.Selection;
                entity.addReaction(MRBasics.actions.ReadActionId, entity.mainEmittor());
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.gainCapacity, entityId: 0, dataId: 0, value: -1 });
                break;
            }
            case "kEntity_投擲反射石A":
                entity.selfTraits.push({code: MRBasics.traits.PhysicalProjectileReflector, dataId: 0, value: 0});
                break;
                
        }
    }
    
    static setupDirectly_Skill(data: DSkill) {
        const emittor = data.emittor();
        switch (data.key) {
            case "kSkill_炎のブレス_直線":
                emittor.scope.range = DEffectFieldScopeType.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_System_炎のブレスA";
                break;
            case "kSkill_魔法弾発射_一般":
                emittor.scope.range = DEffectFieldScopeType.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_System_MagicBulletA";
                data.emittor().costs.setParamCost(DSkillCostSource.Item, MRBasics.params.remaining, {type: DParamCostType.Decrease, value: 1});
                break;
            case "kSkill_ふきとばし": {
                const effect = emittor.effectSuite.targetEffect(0);
                effect.effect.otherEffectQualifyings.push({key: "kSystemEffect_ふきとばし"});
                effect.effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.hp, "5", DParameterEffectApplyType.Damage));
                break;
            }
            case "kSkill_変化":
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.changeInstance, entityId: 0, dataId: 0, value: 0 });
                emittor.effectSuite.targetEffect(0).effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(40);
                break;
            case "kSkill_投げ当て_1ダメ":
                emittor.scope.range = DEffectFieldScopeType.Performer;
                break;
            case "kSkill_火炎草ブレス":
                emittor.scope.range = DEffectFieldScopeType.Front1;
                //emittor.scope.length = Infinity;
                //emittor.scope.projectilePrefabKey = "kEntity_System_炎のブレスA";
                break;
            case "kSkill_射撃_矢":
                emittor.scope.range = DEffectFieldScopeType.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_木の矢A";
                break;
            case "kSkill_足つかみ":
                emittor.scope.range = DEffectFieldScopeType.Front1;
                emittor.effectSuite.selfEffect.effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: MRData.getState("kState_UT足つかみ").id, value1: 100, value2: 0});
                break;
            case "kSkill_大爆発":
                emittor.scope.range = DEffectFieldScopeType.Around;
                emittor.scope.length = 1;
                //emittor.effectSet.effect(0).qualifyings.specialEffectQualifyings.push({code: DSpecialEffectCodes.DeadlyExplosion, dataId: 0, value1: 0, value2: 0});
                //emittor.effectSet.effect(0).qualifyings.effect.parameterQualifyings;
                //emittor.effectSet.effect(0).rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UT爆発四散").id, value1: 100, value2: 0});
                //emittor.selfAnimationId = 109;
                emittor.effectSuite.targetEffect(0).effect.parameterQualifyings[0].elementIds.push(MRData.getElement("kElement_DeathExplosion").id);
                emittor.selfSequelId = MRBasics.sequels.explosion;
                emittor.effectSuite.targetEffect(0).effect.hitType = DEffectHitType.Magical;
                break;
            case "kSkill_アイテム盗み":
                emittor.scope.range = DEffectFieldScopeType.Front1;
                emittor.scope.layers.push(DBlockLayerKind.Ground);
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.itemSteal, entityId: 0, dataId: 0, value: 0 });
                break;
            case "kSkill_ゴールド盗み":
                emittor.scope.range = DEffectFieldScopeType.Front1;
                //emittor.scope.layers.push(DBlockLayerKind.Ground);
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.goldSteal, entityId: 0, dataId: 0, value: 0 });
                break;
            case "kSkill_装備サビ":
                emittor.scope.range = DEffectFieldScopeType.Front1;
                break;
            case "kSkill_装備サビ_武器":
            case "kSkill_装備サビ_盾":
                emittor.scope.range = DEffectFieldScopeType.Front1;
                const p = new DParameterQualifying(MRBasics.params.upgradeValue, "1", DParameterEffectApplyType.Damage);
                p.alliesSideGainMessage = tr2("%1はサビてしまった。"),
                p.alliesSideLossMessage = tr2("%1はサビてしまった。"),
                p.opponentGainMessage = tr2("%1はサビてしまった。"),
                p.opponentLossMessage = tr2("%1はサビてしまった。"),
                emittor.effectSuite.targetEffect(0).effect.parameterQualifyings.push(p);
                // emittor.effectSet.effect(0).effect.parameterQualifyings.push({
                //     parameterId: REBasics.params.upgradeValue,
                //     applyTarget: DParameterApplyTarget.Current,
                //     elementId: 0,
                //     formula: "1",
                //     applyType: DParameterEffectApplyType.Damage,
                //     variance: 0,
                //     silent: false,
                //     alliesSideGainMessage: tr2("%1はサビてしまった。"),
                //     alliesSideLossMessage: tr2("%1はサビてしまった。"),
                //     opponentGainMessage: tr2("%1はサビてしまった。"),
                //     opponentLossMessage: tr2("%1はサビてしまった。"),
                // });
                if (data.key == "kSkill_装備サビ_武器") {
                    emittor.effectSuite.targetEffect(0).effect.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.WeaponKindId);
                }
                else {
                    emittor.effectSuite.targetEffect(0).effect.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.ShieldKindId);
                }
                break;
            case "kSkill_混乱魔法_部屋内":
                emittor.scope.range = DEffectFieldScopeType.Room;
                emittor.selfAnimationId = 97;
                break;
            case "kSkill_毒攻撃":
                emittor.scope.range = DEffectFieldScopeType.Front1;
                emittor.effectSuite.targetEffect(0).effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.pow, "1", DParameterEffectApplyType.Damage));
                // emittor.effectSet.effect(0).effect.parameterQualifyings.push({
                //     parameterId: REBasics.params.pow,
                //     applyTarget: DParameterApplyTarget.Current,
                //     elementId: 0,
                //     formula: "1",
                //     applyType: DParameterEffectApplyType.Damage,
                //     variance: 0,
                //     silent: false,
                // });
                break;
            case "kSkill_毒攻撃_強":
                emittor.scope.range = DEffectFieldScopeType.Front1;
                emittor.effectSuite.targetEffect(0).effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.pow, "3", DParameterEffectApplyType.Damage));
                // emittor.effectSet.effect(0).effect.parameterQualifyings.push({
                //     parameterId: REBasics.params.pow,
                //     applyTarget: DParameterApplyTarget.Current,
                //     elementId: 0,
                //     formula: "3",
                //     applyType: DParameterEffectApplyType.Damage,
                //     variance: 0,
                //     silent: false,
                // });
                break;
            case "kSkill_レベルダウン":
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.levelDown, entityId: 0, dataId: 0, value: 0 });
                break;
            case "kSkill_ワープ魔法":
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.randomWarp, entityId: 0, dataId: 0, value: 0 });
                break;
            case "kSkill_Warp":
                emittor.effectSuite.targetEffect(0).effect.effectBehaviors.push({ specialEffectId: MRBasics.effectBehaviors.randomWarp, entityId: 0, dataId: 0, value: 0 });
                emittor.scope.range = DEffectFieldScopeType.Performer;
                break;
            case "kSkill_KnockbackAttack":
                emittor.effectSuite.targetEffect(0).effect.otherEffectQualifyings.push({key: "kSystemEffect_ふきとばし"});
                emittor.scope.range = DEffectFieldScopeType.Front1;
                break;
            case "kSkill_武器強化": {
                const effect1 = emittor.effectSuite.targetEffect(0);
                effect1.effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.upgradeValue, "1", DParameterEffectApplyType.Recover));
                effect1.effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_REMOVE_STATE, dataId: MRData.system.states.curse, value1: 1.0, value2: 0});
                effect1.effect.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.WeaponKindId);
                effect1.conditions.applyRating = 7;
                effect1.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(51);
                break;
            }
            case "kSkill_武器強化_強": {
                const effect1 = emittor.effectSuite.targetEffect(0);
                effect1.effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.upgradeValue, "3", DParameterEffectApplyType.Recover));
                effect1.effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_REMOVE_STATE, dataId: MRData.system.states.curse, value1: 1.0, value2: 0});
                effect1.effect.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.WeaponKindId);
                effect1.conditions.applyRating = 3;
                effect1.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(52);
                break;
            }
            case "kSkill_防具強化": {
                const effect1 = emittor.effectSuite.targetEffect(0);
                effect1.effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.upgradeValue, "1", DParameterEffectApplyType.Recover));
                effect1.effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_REMOVE_STATE, dataId: MRData.system.states.curse, value1: 1.0, value2: 0});
                effect1.effect.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.ShieldKindId);
                effect1.conditions.applyRating = 7;
                effect1.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(51);
                break;
            }
            case "kSkill_防具強化_強": {
                const effect1 = emittor.effectSuite.targetEffect(0);
                effect1.effect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.upgradeValue, "3", DParameterEffectApplyType.Recover));
                effect1.effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_REMOVE_STATE, dataId: MRData.system.states.curse, value1: 1.0, value2: 0});
                effect1.effect.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.ShieldKindId);
                effect1.conditions.applyRating = 3;
                effect1.effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(52);
                break;
            }
            case "kSkill_アイテム擬態解除_全体": {
                emittor.scope.range = DEffectFieldScopeType.Map;
                break;
            }
        }
    }
    
    static linkSkill(data: DSkill) {
        const emittor = data.emittor();
        switch (data.key) {
            case "kSkill_装備サビ": {
                const effect1 = MRData.cloneEffect(MRData.getSkill("kSkill_装備サビ_武器").emittor().effectSuite.targetEffect(0).effect);
                const effect2 = MRData.cloneEffect(MRData.getSkill("kSkill_装備サビ_盾").emittor().effectSuite.targetEffect(0).effect);
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.WeaponKindId);
                effect2.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.ShieldKindId);
                emittor.effectSuite.addTargetEffect(new DEffectRef(effect1.id));
                emittor.effectSuite.addTargetEffect(new DEffectRef(effect2.id));
                break;
            }
            case "kSkill_武器強化": {
                // const effect2 = MRData.cloneEffect(MRData.getSkill("kSkill_武器強化_強").emittor().effectSet.targetEffect(0).effect);
                // emittor.effectSet.addTargetEffect(new DEffectRef(effect2.id));
                const ref = MRData.getSkill("kSkill_武器強化_強").emittor().effectSuite.targetEffect(0);
                emittor.effectSuite.addTargetEffect(ref);
                break;
            }
            case "kSkill_防具強化": {
                // const effect2 = MRData.cloneEffect(MRData.getSkill("kSkill_防具強化_強").emittor().effectSet.targetEffect(0).effect);
                // emittor.effectSet.addTargetEffect(new DEffectRef(effect2.id));
                const ref = MRData.getSkill("kSkill_防具強化_強").emittor().effectSuite.targetEffect(0);
                emittor.effectSuite.addTargetEffect(ref);
                break;
            }
        }
    }

    static linkItem(entity: DEntity) {
        const data = entity.item();
        switch (entity.entity.key) {
            case "kEntity_錆ワナA": {
                const emittor = entity.mainEmittor();
                const effect1 = MRData.cloneEffect(MRData.getSkill("kSkill_装備サビ_武器").emittor().effectSuite.targetEffect(0).effect);
                const effect2 = MRData.cloneEffect(MRData.getSkill("kSkill_装備サビ_盾").emittor().effectSuite.targetEffect(0).effect);
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.WeaponKindId);
                effect2.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", MRBasics.entityCategories.ShieldKindId);
                emittor.effectSuite.addTargetEffect(new DEffectRef(effect1.id));
                emittor.effectSuite.addTargetEffect(new DEffectRef(effect2.id));
                emittor.scope.range = DEffectFieldScopeType.Center;
                emittor.selfAnimationId = 82;
                break;
            }
        }
    }

    public static setupEnemy(entity: DEntity): void {
        const data = entity.enemyData();
        data.traits.push({ code: MRBasics.traits.DeathVulnerableElement, dataId: MRData.getElement("kElement_DeathExplosion").id, value: MRData.getState("kState_System_ExplosionDeath").id });
        switch (entity.entity.key) {
            case "kEnemy_ボムA":
                entity.entity.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("SelfExplosion").id, undefined));
                //entity.autoAdditionStates.push({ stateId: REData.getStateFuzzy("kState_UTかなしばり").id, condition: "a.hp<50" });
                break;
            case "kEnemy_ウルフA":
                entity.majorActionDeclines = 1;
                break;
            case "kEnemy_ゾンビA":
                //data.traits.push({ code: REBasics.traits.RecoverRate, dataId: 0, value: -1.0 });
                // entity.raceIds.push(REData.getRace("kRace_ドレイン系").id);
                // entity.raceIds.push(REData.getRace("kRace_アンデッド系").id);
                break;
            case "kEnemy_瑠璃猫A":
                //data.traits.push({ code: DBasics.traits.ItemDropRate, dataId: 0, value: 1.0 });
                break;
            case "kEnemy_金剛猫A":
                entity.majorActionDeclines = 1;
                break;
            case "kEnemy_黒幕バットA":
                data.traits.push({ code: MRBasics.traits.Invisible, dataId: 0, value: 0 });
                break;
            case "kEnemy_店主A":
                entity.factionId = MRData.system.factions.neutral;
                break;
            case "kEnemy_ボスドラゴンA":
                entity.selfTraits.push({ code: MRBasics.traits.DisableMovement, dataId: 0, value: 0 });
                break;
        }
    }
    
    public static setupDirectly_State(data: DState) {
        switch (data.key) {
            case "kState_System_ItemStanding":
                data.effect.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("LItemStandingBehavior").id, undefined));
                break;
            case "kState_System_ExplosionDeath":
                data.deadState = true;
                break;
            case "kState_睡眠":
                data.idleSequel = MRBasics.sequels.asleep;
                break;
            case "kState_UT気配察知":
                data.effect.traits.push({ code: MRBasics.traits.UnitVisitor, dataId: 0, value: 0 });
                break;
            case "kState_UTよくみえ":
                data.effect.traits.push({ code: MRBasics.traits.ForceVisible, dataId: 0, value: 0 });
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.FloorTransfer });
                break;
            case "kState_UnitTest_攻撃必中":
                data.effect.traits.push({ code: MRBasics.traits.CertainDirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_UnitTest_投擲必中":
                data.effect.traits.push({ code: MRBasics.traits.CertainIndirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_System_kNap":
                data.effect.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("LNapStateBehavior").id, undefined));
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.DamageTesting, paramId: MRBasics.params.hp });
                break;
            case "kState_Test_MoveRight":
                data.effect.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("LDebugMoveRightBehavior").id, undefined));
                break;
            case "kState_仮眠2":
                data.effect.traits.push({ code: MRBasics.traits.StateRemoveByEffect, dataId: 0, value: 0 });
                data.idleSequel = MRBasics.sequels.asleep;
                break;
            case "kState_UTアイテム擬態":
                data.effect.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("LItemImitatorBehavior").id, undefined));
                break;
            case "kState_UT魔法使い":
                data.effect.traits.push({ code: MRBasics.traits.EquipmentProficiency, dataId: MRBasics.entityCategories.WeaponKindId, value: 0.5 });
                data.effect.traits.push({ code: MRBasics.traits.EquipmentProficiency, dataId: MRBasics.entityCategories.ShieldKindId, value: 0.5 });
                data.effect.traits.push({ code: MRBasics.traits.EffectProficiency, dataId: MRBasics.entityCategories.grass, value: 2.0 });
                break;
                /*
            case "kState_UT速度バフ":
                data.minBuffLevel = -1;
                data.maxBuffLevel = 2;
                data.parameterBuffFormulas[DBasics.params.agi] = "100*slv";
                break;
                */
            case "kState_UT鈍足":
                data.autoAdditionCondition = "a.agi<0";
                break;
            case "kState_UT倍速":
                data.autoAdditionCondition = "a.agi>=100";
                break;
            case "kState_UT3倍速":
                data.autoAdditionCondition = "a.agi>=200";
                break;
            case "kState_UT混乱":
                data.intentions = DStateIntentions.Negative;
                break;
            case "kState_UT目つぶし":
                data.intentions = DStateIntentions.Negative;
                data.effect.restriction = DStateRestriction.Blind;
                break;
            case "kState_UTまどわし":
                data.effect.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("LIllusionStateBehavior").id, undefined));
                break;
            case "kState_UTからぶり":
                break;
            case "kState_UTくちなし":
                data.effect.traits.push({ code: MRBasics.traits.SealActivity, dataId: MRBasics.actions.EatActionId, value: 0 });
                data.effect.traits.push({ code: MRBasics.traits.SealActivity, dataId: MRBasics.actions.ReadActionId, value: 0 });
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.FloorTransfer });
                break;
            case "kState_UTかなしばり":
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.DamageTesting, paramId: MRBasics.params.hp });
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.ActualParam, formula: "a.fp <= 0" });
                break;
            case "kState_System_Seal":
                data.effect.traits.push({ code: MRBasics.traits.SealSpecialAbility, dataId: MRBasics.actions.EatActionId, value: 0 });
                break;
            case "kState_UT透明":
                data.effect.traits.push({ code: MRBasics.traits.Invisible, dataId: 0, value: 0 });
                data.submatchStates.push(MRData.getState("kState_UT透明_モンスター").id);
                break;
            case "kState_UT透明_モンスター":
                data.effect.traits.push({ code: MRBasics.traits.Invisible, dataId: 0, value: 0 });
                data.effect.matchConditions.kindId = MRBasics.entityCategories.MonsterKindId;
                break;
            case "kState_UT足つかみ":
                data.effect.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("LGrabFootBehavior").id, undefined));
                break;
            case "kState_物理投擲回避":
                data.effect.traits.push({ code: MRBasics.traits.DodgePhysicalIndirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_UT下手投げ":
                data.effect.traits.push({ code: MRBasics.traits.AwfulPhysicalIndirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_Anger":
                data.effect.traits.push({ code: MRBasics.traits.UseSkillForced, dataId: 0, value: 0 });
                break;
            case "kState_ATK0":
                data.effect.traits.push({ code: MRBasics.traits.ForceParameter, dataId: MRBasics.params.atk, value: 0 });
                break;

                
            // case "kState_UT爆発四散":
            //     data.deadState  = true;
            //     break;
            case "kState_UTトラバサミ":
                data.effect.traits.push({ code: MRBasics.traits.SealActivity, dataId: MRBasics.actions.MoveToAdjacentActionId, value: 0 });
                break;
            case "kState_System_Plating":
                data.effect.traits.push({ code: MRBasics.traits.ParamDamageRate, dataId: MRBasics.params.upgradeValue, value: 0.0 });
                data.applyConditions.kindIds = [MRBasics.entityCategories.WeaponKindId, MRBasics.entityCategories.ShieldKindId];
                break;
        }
    }
    
    public static setupDirectly_StateGroup(data: DStateGroup) {
        switch (data.key) {
            case "kStateGroup_睡眠系":
                data.exclusive = true;
                break;
            case "kStateGroup_SG速度変化":
                data.exclusive = true;
                break;
        }
    }

    private static setupItemCommon(entity: DEntity): void {
        this.addVulnerableDeathExplosion(entity);
    }

    public static setupWeaponCommon(entity: DEntity): void {
        this.setupItemCommon(entity);
        entity.upgradeMin = -99;    // TODO: 攻撃力下限までにしたい
        entity.upgradeMax = 99;
        entity.idealParams[MRBasics.params.upgradeValue] = 0;
        entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
        entity.identificationReaction = MRData.getSkill("kAction_Equip").id;
        
        // Collide
        // TODO: 暫定対応。とりあえずダメージを出したい
        this.setupArrowCommon(entity);
        entity.entity.kindId = MRBasics.entityCategories.WeaponKindId;

    }

    public static setupShieldCommon(entity: DEntity): void {
        this.setupItemCommon(entity);
        entity.entity.kindId = MRBasics.entityCategories.ShieldKindId;
        entity.upgradeMin = -99;    // TODO: 攻撃力下限までにしたい
        entity.upgradeMax = 99;
        entity.idealParams[MRBasics.params.upgradeValue] = 0;
        entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
        entity.identificationReaction = MRData.getSkill("kAction_Equip").id;

        const damage = entity.equipment?.parameters[MRBasics.params.def];
        assert(damage);
        
        const emittor = MRData.newEmittor(entity.entity.key);
        emittor.scope.range = DEffectFieldScopeType.Performer;
        const effect = MRData.newEffect(entity.entity.key);
        effect.critical = false;
        effect.successRate = 100;
        effect.hitType = DEffectHitType.Physical;
        const q = new DParameterQualifying(MRBasics.params.hp, damage.value.toString(), DParameterEffectApplyType.Damage);
        effect.parameterQualifyings.push(q);
        emittor.effectSuite.addTargetEffect(new DEffectRef(effect.id));
        entity.addReaction(MRBasics.actions.collide, emittor);
    }

    // TOOD: 矢は 武器ではなくアイテムで設定する方がふさわしいかもしれない。
    //       ツクールの「武器」「防具」は身に着けることで様々な能力を身に着けるものであるが、
    //       矢は「セット」という動作が装備アイテムっぽいというだけで、実体は「投げる」のショートカットである。
    //       それよりも矢を「投げ当てた」ときの効果の方が実際は重要なので、矢はアイテムとして設定する方が良いかもしれない。
    private static setupArrowCommon(entity: DEntity): void {
        this.setupItemCommon(entity);
        entity.entity.kindId = MRBasics.entityCategories.ArrowKindId;
        const emittor = MRData.newEmittor(entity.entity.key);
        emittor.scope.range = DEffectFieldScopeType.Performer;
        const effect = MRData.newEffect(entity.entity.key);
        effect.critical = false;
        effect.successRate = 100;
        effect.hitType = DEffectHitType.Physical;
        // TODO: DB で定義したい
        const q = new DParameterQualifying(MRBasics.params.hp, "a.atk * 4 - b.def * 2", DParameterEffectApplyType.Damage)
            .withVariance(20);
        effect.parameterQualifyings.push(q);
        if (entity.equipment) {
            effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(entity.equipment.targetRmmzAnimationId);
        }
        emittor.effectSuite.addTargetEffect(new DEffectRef(effect.id));
        entity.addReaction(MRBasics.actions.collide, emittor);

    }

    private static setupRingCommon(entity: DEntity): void {
        this.setupItemCommon(entity);
        entity.entity.behaviors.push(new DBehaviorInstantiation(MRData.getBehavior("Equipment").id, undefined));
    }

    public static setupFoodCommon(entity: DEntity, fp?: number): void {
        this.setupItemCommon(entity);
        entity.entity.kindId = MRBasics.entityCategories.FoodKindId;
        const mainEmittor = entity.mainEmittor();
        entity.addReaction(MRBasics.actions.EatActionId, mainEmittor);
    }

    public static setupGrassCommon(entity: DEntity, fp?: number): [DEmittor, DEmittor] {
        this.setupItemCommon(entity);
        entity.entity.kindId = MRBasics.entityCategories.grass;

        fp = fp ?? 500;

        // MainEmittor が Eat, Collide 両方の効果になるようにする。
        // ただし Eat には FP 回復効果も付くため、先に Collide 用の Emittor を clone で作っておき、
        // そのあと MainEmittor に FP 回復効果を追加する。

        const mainEmittor = entity.mainEmittor();
        mainEmittor.scope.range = DEffectFieldScopeType.Performer;

        // Collide
        const collideEmittor = MRData.cloneEmittor(mainEmittor);
        entity.addReaction(MRBasics.actions.collide, collideEmittor);
        //entity.addEmittor(DEffectCause.Hit, collideEmittor);

        // FP 回復
        const eatEmittor = mainEmittor;//REData.newEmittor(entity.entity.key);

        const fpEffect = MRData.newEffect(entity.entity.key);
        fpEffect.parameterQualifyings.push(new DParameterQualifying(MRBasics.params.fp, fp.toString(), DParameterEffectApplyType.Recover).withSilent());
        eatEmittor.effectSuite.addTargetEffect(new DEffectRef(fpEffect.id));
        const reaction = entity.addReaction(MRBasics.actions.EatActionId, eatEmittor);
        reaction.overrideDisplayCommandName = tr2("飲む");
        //entity.addEmittor(DEffectCause.Eat, eatEmittor);

        // 投げ当てで MainEmittor 発動
        //entity.addEmittor(DEffectCause.Hit, REData.cloneEmittor(entity.mainEmittor()));

        entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
        entity.identificationReaction = MRData.getSkill("kAction_Eat").id;
        entity.allowModifierState = false;

        return [eatEmittor, collideEmittor];
    }

    /*
    杖の処理見直し
    ----------
    v0.7.0 時点の杖の処理の流れ
    1. Wave の Reaction として、 「kSkill_魔法弾発射_一般のEmittor」 を発動する
    2. 「kSkill_魔法弾発射_一般のEmittor」 の Range は StraightProjectile である。
    3. performeEffect() にて、Performer は杖ItemEntity を使って、 StraightProjectile を発動する。
    4. StraightProjectile は、使われた ItemEntity を投げ当てた時の効果を発動する。

    今は StraightProjectile は Collide 固定だが、土塊の杖やトンネルの杖など、振ったときと投げた時で効果が変わるものはある。

    多分イメージが簡単なのは、「吹き飛ばしの魔法弾」「トンネルの魔法弾」など個別に作ることだろう。
    現状の StraightProjectile は ItemEntity の Collide を参照しているが、これをやめ、個別に設定できるようにする。
    v0.7.0 ではコード上で手動設定していたため、簡略化を狙ってちょっとややこしくなっていた。

    トドの壺など押したらコストを消費して何かが飛んでいくものにも応用できるかもしれない。

    修正後の流れ
    1. Wave の Reaction として、 kEmittor_吹き飛ばしの魔法弾 を発動する
    2. kEmittor_吹き飛ばしの魔法弾 の Range は StraightProjectile で、効果は Emittor に紐づいている。
    3. performeEffect() にて、Performer は StraightProjectile を発動する。
    4. StraightProjectile は、kEmittor_吹き飛ばしの魔法弾 に紐づいた効果を発動する。

    なお、ドラゴンの炎ブレスはSkill側でダメージ設定している。
    performeEffect_StraightProjectile() で、 次のようになっている。
    - ItemEntity が指定されている場合はその collide を使う。
    - そうでなければ、 emittor に紐づいている Effect を使う。
    */
    private static setupStaffCommon(entity: DEntity): void {
        this.setupItemCommon(entity);
        const mainEmittor = entity.mainEmittor();
        entity.addReaction(MRBasics.actions.collide, mainEmittor);
        //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
    }

    private static setupScrollCommon(entity: DEntity): void {
        this.setupItemCommon(entity);
        entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
        entity.identificationReaction = MRData.getSkill("kAction_Read").id;
    }

    public static setupStorageCommon(entity: DEntity): void {
        this.setupItemCommon(entity);
        entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
        entity.selfTraits.push({ code: MRBasics.traits.DisallowIntoStorage, dataId: 0, value: 0 });
    }

    private static addVulnerableDeathExplosion(entity: DEntity) {
        entity.selfTraits.push({ code: MRBasics.traits.DeathVulnerableElement, dataId: MRData.getElement("kElement_DeathExplosion").id, value: MRData.getState("kState_System_ExplosionDeath").id });
    }
}






