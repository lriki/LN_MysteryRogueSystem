import { DClarificationType, REBasics } from "./REBasics";
import { DBlockLayerKind, DSpecialEffectCodes, DSubComponentEffectTargetKey } from "./DCommon";
import { DBuffMode, DBuffOp, DEffect, DEffectFieldScopeRange, DEffectHitType, DParamCostType, DParameterApplyTarget, DParameterEffectApplyType, DParameterQualifying, DSkillCostSource, LStateLevelType } from "./DEffect";
import { DEmittor } from "./DEmittor";
import { DEntity, DIdentificationDifficulty } from "./DEntity";
import { DIdentifiedTiming } from "./DIdentifyer";
import { DItemEffect } from "./DItemEffect";
import { DPrefab } from "./DPrefab";
import { DSkill } from "./DSkill";
import { DAutoRemovalTiming, DState, DStateIntentions, DStateRestriction } from "./DState";
import { DStateGroup } from "./DStateGroup";
import { REData } from "./REData";
import { assert, tr2 } from "../Common";
import { DItem } from "./DItem";
import { DRace } from "./DRace";

export class RESetup {

    public static setupPrefab(data: DPrefab): void {
        
        switch (data.key) {
            case "kPrefab_Actor_A":
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
                data.traits.push({code: REBasics.traits.ElementedRecoveryRate, dataId: 0, value: -1.0});
                break;
        }
    }
    
    public static setupActor(entity: DEntity): void {
        const actor = entity.actorData();
        switch (actor.id) {
            case 1:
                //entity.selfTraits.push({ code: REBasics.traits.TRAIT_STATE_RATE, dataId: REData.getState("kState_UT爆発四散").id, value: 0 });
                entity.selfTraits.push({ code: REBasics.traits.TRAIT_STATE_RESIST, dataId: REData.getState("kState_UT爆発四散").id, value: 0 });
                break;
        }
    }
    
    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    public static setupDirectly_DItem(entity: DEntity): void{
        const data = entity.item();

        switch (entity.entity.kindId) {
            case REBasics.entityKinds.WeaponKindId:
                this.setupWeaponCommon(entity);
                break;
            case REBasics.entityKinds.ShieldKindId:
                this.setupShieldCommon(entity);
                break;
        }

        switch (entity.entity.key) {
            case "kEntity_ゴブリンのこん棒_A":
                break;
            case "kEntity_シルバーソード_A":
                break;
            case "kEntity_ドラゴンキラー_A":
                entity.upgradeMin = -99;    // TODO: 攻撃力下限までにしたい
                entity.upgradeMax = 99;
                entity.idealParams[REBasics.params.upgradeValue] = 0;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                //entity.affestTraits.push({code: REBasics.traits.RaceRate, dataId: REData.getRace("kRace_ドラゴン系").id, value: 1.5});
                break;
            case "kEntity_ダミードラゴンキラー_A":
                break;
            case "kEntity_レザーシールド_A":
                entity.equipmentTraits.push({ code: REBasics.traits.SurvivalParamLossRate, dataId: REBasics.params.fp, value: 0.5 });
                entity.selfTraits.push({ code: REBasics.traits.ParamDamageRate, dataId: REBasics.params.upgradeValue, value: 0.0 });
                break;
            case "kEntity_アイアンシールド_A":
                break;
            case "kEntity_ポイズンシールド_A":
                entity.equipmentTraits.push({ code: REBasics.traits.SkillGuard, dataId: REData.getSkill("kSkill_毒攻撃").id, value: 0 });
                entity.equipmentTraits.push({ code: REBasics.traits.SkillGuard, dataId: REData.getSkill("kSkill_毒攻撃_強").id, value: 0 });
                break;
            case "kEntity_アウェイクリング_A":
                this.setupRingCommon(entity);
                break;
            case "kEntity_パワーリング_A":
                this.setupRingCommon(entity);
                assert(entity.equipment);
                entity.equipment.parameters[REBasics.params.pow] = { value: 3, upgradeRate: 0 };
                break;
            case "kEntity_ワープリング_A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: REBasics.traits.SuddenSkillEffect, dataId: REData.getSkill("kSkill_Warp").id, value: 1.0 / 16.0 });
                break;
            case "kEntity_スリープガードリング_A":
                this.setupRingCommon(entity);
                break;
            case "kEntity_ハングリーリング_A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: REBasics.traits.SurvivalParamLossRate, dataId: REBasics.params.fp, value: 2.0 });
                break;
            case "kEntity_ポイズンガードリング_A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: REBasics.traits.ParamDamageRate, dataId: REBasics.params.pow, value: 0.0 });
                break;
            case "kEntity_ビジブルリング_A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: REBasics.traits.ForceVisible, dataId: 0, value: 0 });
                break;
            case "kEntity_インプリング_A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: REBasics.traits.SkillGuard, dataId: REData.getSkill("kSkill_レベルダウン").id, value: 0 });
                entity.equipmentTraits.push({ code: REBasics.traits.SkillGuard, dataId: REData.getSkill("kSkill_毒攻撃_強").id, value: 0 });
                break;
            case "kEntity_アウェイクガードリング_A":
                this.setupRingCommon(entity);
                break;
            case "kEntity_トラップガードリング_A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: REBasics.traits.DisableTrap, dataId: 0, value: 0 });
                break;
            case "kEntity_ハングリーガードリング_A":
                this.setupRingCommon(entity);
                entity.equipmentTraits.push({ code: REBasics.traits.SurvivalParamLossRate, dataId: REBasics.params.fp, value: 0.0 });
                break;
            case "kEntity_きれいな指輪_A":
                this.setupRingCommon(entity);
                break;
            case "kEntity_ウッドアロー_A":
                this.setupArrowCommon(entity);
                entity.display.stackedName = "%1本の" + entity.display.name;
                entity.selfTraits.push({code: REBasics.traits.Stackable, dataId: 0, value: 0});
                entity.addReaction(REBasics.actions.ShootingActionId, undefined, true);
                break;
            case "kEntity_アイアンアロー_A":
                this.setupArrowCommon(entity);
                entity.display.stackedName = "%1本の" + entity.display.name;
                entity.selfTraits.push({code: REBasics.traits.Stackable, dataId: 0, value: 0});
                entity.addReaction(REBasics.actions.ShootingActionId, undefined, true);
                break;
            case "kEntity_シルバーアロー_A":
                this.setupArrowCommon(entity);
                entity.display.stackedName = "%1本の" + entity.display.name;
                entity.selfTraits.push({code: REBasics.traits.Stackable, dataId: 0, value: 0});
                entity.selfTraits.push({code: REBasics.traits.PenetrationItem, dataId: 0, value: 0});
                entity.addReaction(REBasics.actions.ShootingActionId, undefined, true);
                break;
            case "kEntity_毒矢_A":
                this.setupArrowCommon(entity);
                entity.display.stackedName = "%1本の" + entity.display.name;
                entity.selfTraits.push({code: REBasics.traits.Stackable, dataId: 0, value: 0});
                entity.addReaction(REBasics.actions.ShootingActionId, undefined, true);
                break;
            case "kEntity_スピードドラッグ_A": {
                const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());

                // const emittor = REData.newEmittor(entity.entity.key);
                // emittor.scope.range = DEffectFieldScopeRange.Performer;
                const effect = new DEffect(entity.entity.key);
                effect.buffQualifying.push({
                    paramId: REBasics.params.agi,
                    mode: DBuffMode.Strength,
                    level: 1,
                    levelType: LStateLevelType.RelativeValue,
                    op: DBuffOp.Add,
                    turn: 10,
                });
                eatEmittor.effectSet.effects.push(effect);
                collideEmittor.effectSet.effects.push(effect);

                
                effect.rmmzAnimationId = 12;
                
                // emittor.effectSet.effects.push(effect);
                // entity.addEmittor(DEffectCause.Eat, emittor);
                // entity.addEmittor(DEffectCause.Hit, emittor);

                break;
            }
            case "kEntity_パワードラッグ_A": {
                const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                //entity.addReaction(REBasics.actions.EatActionId, 0);
                
                {
                    //eatEmittor.scope.range = DEffectFieldScopeRange.Performer;
                    const effect = new DEffect(entity.entity.key);
                    effect.parameterQualifyings.push(
                        new DParameterQualifying(REBasics.params.pow, "1", DParameterEffectApplyType.Recover)
                        .withConditionFormula("a.pow < a.max_pow"));
                    effect.parameterQualifyings.push(
                        new DParameterQualifying(REBasics.params.pow, "1", DParameterEffectApplyType.Recover)
                        .withApplyTarget(DParameterApplyTarget.Maximum)
                        .withConditionFormula("a.pow >= a.max_pow"));
                    // effect.parameterQualifyings.push({
                    //     parameterId: REBasics.params.pow,
                    //     applyTarget: DParameterApplyTarget.Current,
                    //     elementId: 0,
                    //     formula: "1",
                    //     applyType: DParameterEffectApplyType.Recover,
                    //     variance: 0,
                    //     silent: false,
                    //     conditionFormula: ,
                    // });
                    // effect.parameterQualifyings.push({
                    //     parameterId: REBasics.params.pow,
                    //     applyTarget: DParameterApplyTarget.Maximum,
                    //     elementId: 0,
                    //     formula: "1",
                    //     applyType: DParameterEffectApplyType.Recover,
                    //     variance: 0,
                    //     silent: false,
                    //     conditionFormula: ,
                    // });
                    eatEmittor.effectSet.effects.push(effect);
                    //entity.addEmittor(DEffectCause.Eat, emittor);
                    effect.rmmzAnimationId = 51;
                }
                
                break;
            }
            case "kEntity_グロースドラッグ_A": {
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.parameterQualifyings.push(new DParameterQualifying(REBasics.params.level, "1", DParameterEffectApplyType.Recover));
                effect.rmmzAnimationId = 52;
                break;
            }
            case "kEntity_ワープドラッグ_A": {
                entity.mainEmittor().effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.warp });

                const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                break;
            }
            case "kEntity_ブラインドドラッグ_A": {}
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                break;
            case "kEntity_パニックドラッグ_A": {
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.rmmzAnimationId = 63;
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                break;
            }
            case "kEntity_ビジブルドラッグ_A": {
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.rmmzAnimationId = 97;
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                break;
            }
            case "kEntity_マッドドラッグ_A":
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                break;
            case "kEntity_ポイズンドラッグ_A": {
                // mainEmittor は setupGrassCommon() の中で clone されて Eat と Collide に振り分けられるので、共通 Effect は先に設定しておく。
                const mainEmittor = entity.mainEmittor();
                const effect = mainEmittor.effectSet.effects[0];
                effect.conditions.fallback = true;
                effect.parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "5", DParameterEffectApplyType.Damage));
                effect.parameterQualifyings.push(new DParameterQualifying(REBasics.params.pow, "3", DParameterEffectApplyType.Damage));
                effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_REMOVE_STATE, dataId: REData.getState("kState_UTまどわし").id, value1: 1.0, value2: 0 });
                effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_REMOVE_STATE, dataId: REData.getState("kState_UT混乱").id, value1: 1.0, value2: 0 });
                effect.rmmzAnimationId = 59;
                
                const effect2 = new DEffect(entity.entity.key);
                effect2.conditions.kindId = REBasics.entityKinds.MonsterKindId;
                effect2.parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "1", DParameterEffectApplyType.Damage));
                mainEmittor.effectSet.effects.push(effect2);

                const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                break;
            }
            case "kEntity_毒草_B": { // シレン仕様
                // mainEmittor は setupGrassCommon() の中で clone されて Eat と Collide に振り分けられるので、共通 Effect は先に設定しておく。
                const mainEmittor = entity.mainEmittor();
                const effect = mainEmittor.effectSet.effects[0];
                effect.conditions.fallback = true;
                effect.parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "5", DParameterEffectApplyType.Damage));
                effect.parameterQualifyings.push(new DParameterQualifying(REBasics.params.pow, "1", DParameterEffectApplyType.Damage));
                effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_REMOVE_STATE, dataId: REData.getState("kState_UTまどわし").id, value1: 1.0, value2: 0 });
                effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_REMOVE_STATE, dataId: REData.getState("kState_UT混乱").id, value1: 1.0, value2: 0 });
                effect.rmmzAnimationId = 59;
                
                const effect2 = new DEffect(entity.entity.key);
                effect2.conditions.kindId = REBasics.entityKinds.MonsterKindId;
                effect2.parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "5", DParameterEffectApplyType.Damage));
                effect2.parameterQualifyings.push(new DParameterQualifying(REBasics.params.atk, "b.atk", DParameterEffectApplyType.Damage));
                mainEmittor.effectSet.effects.push(effect2);

                const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                break;
            }
            case "kEntity_アンチポイズン_A": {
                const mainEmittor = entity.mainEmittor();

                const effect1 = mainEmittor.effectSet.effects[0];
                effect1.conditions.fallback = true;
                const q = new DParameterQualifying(REBasics.params.pow, "b.max_pow - b.pow", DParameterEffectApplyType.Recover);
                q.alliesSideGainMessage = "%1の%2が回復した。";
                effect1.parameterQualifyings.push(q);
                effect1.rmmzAnimationId = 45;

                const effect2 = new DEffect(entity.entity.key);
                effect2.conditions.raceId = REData.getRace("kRace_ドレイン系").id;
                effect2.parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "50", DParameterEffectApplyType.Damage));
                effect2.rmmzAnimationId = 45;
                mainEmittor.effectSet.effects.push(effect2);

                const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());

                //const emittor = entity.getReaction(REBasics.actions.collide).emittor();

                break;
            }
            case "kEntity_キュアリーフ_A": {
                if (1) {
                    const mainEmittor = entity.mainEmittor();
                    const effect1 = mainEmittor.effectSet.effects[0];
                    const effect2 = effect1.clone();

                    // effect1: 一般用 (HP 回復のみ)
                    effect1.conditions.fallback = true;

                    // effect2: Actor 専用 (最大HP の上昇効果もある)
                    effect2.conditions.kindId = REBasics.entityKinds.actor;
                    effect2.parameterQualifyings[0].conditionFormula = "a.hp < a.max_hp";
                    effect2.parameterQualifyings.push(
                        new DParameterQualifying(REBasics.params.hp, "1", DParameterEffectApplyType.Recover)
                        .withApplyTarget(DParameterApplyTarget.Maximum)
                        .withConditionFormula("a.hp >= a.max_hp"));
                    mainEmittor.effectSet.effects.push(effect2);

                    const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                }
                else {
                    const mainEmittor = entity.mainEmittor();
    
                    const effect1 = mainEmittor.effectSet.effects[0];
    
                    // ダメージを与えるときに 最大HP 上昇効果を発動したくない。
                    // そうすると、薬草アイテム側の効果として、対象の種類や種族によって効果を分ける必要がある。
                    // 単に受け側で回復をダメージ扱いするだけでは足りない。
                    const effect2 = effect1.clone();
                    effect2.conditions.raceId = REData.getRace("kRace_アンデッド系").id;
                    //effect2.parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "50", DParameterEffectApplyType.Damage));
                    mainEmittor.effectSet.effects.push(effect2);
                    effect2.rmmzAnimationId = 0;
    
                    effect1.parameterQualifyings[0].conditionFormula = "a.hp < a.max_hp";
    
                    const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                    // entity.addReaction(REBasics.actions.EatActionId, 0);
                    // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
    
                    //const emittor = entity.getReaction(REBasics.actions.EatActionId).emittor();
                    const effect = eatEmittor.effectSet.effects[0];
                    effect.parameterQualifyings.push(
                        new DParameterQualifying(REBasics.params.hp, "1", DParameterEffectApplyType.Recover)
                        .withApplyTarget(DParameterApplyTarget.Maximum)
                        .withConditionFormula("a.hp >= a.max_hp"));
    
                }
                break;
            }
            case "kEntity_スリープドラッグ_A": {
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.rmmzAnimationId = 62;
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                break;
            }
            case "kEntity_フレイムリーフ_A": {
                const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);

                const eatEmittor2 = REData.getItem("kEntity_火炎草_ブレス").mainEmittor();
                eatEmittor2.scope.range = DEffectFieldScopeRange.Front1;
                entity.addReaction(REBasics.actions.EatActionId, eatEmittor2);
                // const effect1 = .effectSet.effects[0];
                // eatEmittor2.effectSet.effects.push effect1;

                const effect2 = REData.getItem("kEntity_火炎草_投げ当て").mainEmittor().effectSet.effects[0];
                collideEmittor.effectSet.effects[0] = effect2;

                // entity.addReaction(REBasics.actions.EatActionId, 0);]
                //entity.addReaction(REBasics.actions.EatActionId, REData.getSkill("kSkill_火炎草ブレス").emittor());
                // const emittor = entity.getReaction(REBasics.actions.EatActionId).emittor();
                // emittor
                //entity.addEmittor(DEffectCause.Eat, REData.getSkill("kSkill_火炎草ブレス").emittor());

                //const emittor = entity.effectSet.emittor(DEffectCause.Eat);
                //assert(emittor);
                //emittor.scope.range = DEffectFieldScopeRange.Front1;
                //entity.effectSet.setEmittor(DEffectCause.Hit, entity.effectSet.mainEmittor());
                //data.effectSet.setSkill(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_隣接"));
                //data.effectSet.setEffect(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_直線").effect());
                //entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                break;
            }
            case "kEntity_エリクシール_A": {
                const mainEmittor = entity.mainEmittor();
                const effect1 = mainEmittor.effectSet.effects[0];
                const effect2 = effect1.clone();

                // effect1: 一般用 (HP 回復のみ)
                effect1.conditions.fallback = true;

                // effect2: Actor 専用 (最大HP の上昇効果もある)
                effect2.conditions.kindId = REBasics.entityKinds.actor;
                effect2.parameterQualifyings[0].conditionFormula = "a.hp < a.max_hp";
                effect2.parameterQualifyings.push(
                    new DParameterQualifying(REBasics.params.hp, "2", DParameterEffectApplyType.Recover)
                    .withApplyTarget(DParameterApplyTarget.Maximum)
                    .withConditionFormula("a.hp >= a.max_hp"));
                mainEmittor.effectSet.effects.push(effect2);

                const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                break;

                // const [eatEmittor, collideEmittor] = this.setupGrassCommon(entity);
                // // entity.addReaction(REBasics.actions.EatActionId, 0);
                // // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                // // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                // //const emittor = entity.getReaction(REBasics.actions.EatActionId).emittor();
                // eatEmittor.effectSet.effects[0].parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "999", DParameterEffectApplyType.Recover));
                // eatEmittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.removeStatesByIntentions, value: DStateIntentions.Negative });
                break;
            }
            case "kEntity_ドラゴン草_A":
                this.setupGrassCommon(entity);
                //entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.addReaction(REBasics.actions.EatActionId, REData.getSkill("kSkill_炎のブレス_直線").emittor());
                //entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                //entity.addEmittor(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_直線").emittor());
                break;
            case "kEntity_しびれ草_A":
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                break;
            case "kEntity_きえさり草_A":
                this.setupGrassCommon(entity);
                // entity.addReaction(REBasics.actions.EatActionId, 0);
                // entity.addEmittor(DEffectCause.Eat, entity.mainEmittor());
                break;
            case "kEntity_RevivalGrass_A":
                this.setupGrassCommon(entity);
                entity.entity.behaviors.push({name: "RevivalItem"});
                entity.addReaction(REBasics.actions.dead, entity.mainEmittor());
                break;
            case "kEntity_System_炎のブレス_A":
                entity.volatilityProjectile = true;
                break;
            case "kEntity_System_MagicBullet_A":
                entity.volatilityProjectile = true;
                break;
            case "kEntity_ふきとばしの杖_A":
                //this.setupStaffCommon(entity);
                //data.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").effect);
                entity.addReaction(REBasics.actions.collide, REData.getSkill("kSkill_ふきとばし").emittor());
                //entity.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_ふきとばし").emittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                break;
            case "kEntity_ハーフの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.parameterQualifyings.push(new DParameterQualifying(REBasics.params.hp, "b.hp / 2", DParameterEffectApplyType.Damage));
                effect.rmmzAnimationId = 55;
                break;
            }
            case "kEntity_インヴィジブルの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UT透明").id, value1: 1.0, value2: 0 });
                effect.rmmzAnimationId = 101;
                break;
            }
            case "kEntity_スピードアップの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];effect.buffQualifying.push({
                    paramId: REBasics.params.agi,
                    mode: DBuffMode.Strength,
                    level: 1,
                    levelType: LStateLevelType.RelativeValue,
                    op: DBuffOp.Add,
                    turn: 10,
                });
                effect.rmmzAnimationId = 12;
                break;
            }
            case "kEntity_スパークの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.parameterQualifyings.push(
                    new DParameterQualifying(REBasics.params.hp, "35", DParameterEffectApplyType.Damage)
                    .withVariance(20));
                effect.rmmzAnimationId = 77;
                break;
            }
            case "kEntity_パニックの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UT混乱").id, value1: 1.0, value2: 0 });
                effect.rmmzAnimationId = 63;
                break;
            }
            case "kEntity_スピリットの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.division });
                effect.rmmzAnimationId = 106;
                break;
            }
            case "kEntity_スリープの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.rmmzSpecialEffectQualifyings.push({ code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_睡眠").id, value1: 1.0, value2: 0 });
                effect.rmmzAnimationId = 62;
                break;
            }
            case "kEntity_シールの杖_A":
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                break;
            case "kEntity_チェンジの杖_A":
                //this.setupStaffCommon(entity);
                entity.addReaction(REBasics.actions.collide, REData.getSkill("kSkill_変化").emittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 3;
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
            case "kEntity_ワープの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.warp });
                break;
            }
            case "kEntity_スピードダウンの杖_A": {
                this.setupStaffCommon(entity);
               // entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.buffQualifying.push({
                    paramId: REBasics.params.agi,
                    mode: DBuffMode.Weakness,
                    level: 1,
                    levelType: LStateLevelType.RelativeValue,
                    op: DBuffOp.Add,
                    turn: 10,
                });
                effect.rmmzAnimationId = 54;
                break;
            }
            case "kEntity_ダブルペインの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const emittor = entity.mainEmittor();
                //emittor.selfAnimationId = 60;

                //emittor.scope.range = DEffectFieldScopeRange.Performer;
                const effect1 = emittor.effectSet.effects[0];
                effect1.rmmzAnimationId = 60;

                const effect2 = REData.getItem("kEntity_ダブルペインの杖_使用者側効果_A").mainEmittor().effectSet.effects[0];
                effect2.rmmzAnimationId = 60;
                emittor.effectSet.succeededSelfEffect = effect2;

                break;
            }
            case "kEntity_リープの杖_A":
                this.setupStaffCommon(entity);
                entity.mainEmittor().effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.stumble });
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;

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
            case "kEntity_デスの杖_A": {
                this.setupStaffCommon(entity);
                //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor());
                entity.idealParams[REBasics.params.remaining] = 5;
                const effect = entity.mainEmittor().effectSet.effects[0];
                effect.rmmzAnimationId = 65;
                break;
            }
            case "kEntity_眠りガス_A": {
                const emittor = entity.mainEmittor();
                emittor.selfAnimationId = 35;
                emittor.scope.range = DEffectFieldScopeRange.Center;
                break;
            }
            case "kEntity_地雷_A": {
                const emittor = entity.mainEmittor();
                const effect = emittor.effectSet.effects[0];
                
                emittor.scope.range = DEffectFieldScopeRange.AroundAndCenter;
                emittor.scope.length = 1;
                emittor.selfAnimationId = 109;
                //emittor.selfSequelId = REBasics.sequels.explosion;
                //effect.qualifyings.specialEffectQualifyings.push({code: DSpecialEffectCodes.DeadlyExplosion, dataId: 0, value1: 0, value2: 0});
                effect.parameterQualifyings.push(
                    new DParameterQualifying(REBasics.params.hp, "b.hp / 2", DParameterEffectApplyType.Damage)
                    .withElementId(REBasics.elements.explosion));
                // effect.parameterQualifyings.push({
                //     parameterId: REBasics.params.hp,
                //     applyTarget: DParameterApplyTarget.Current,
                //     elementId: REBasics.elements.explosion,
                //     formula: "b.hp / 2",
                //     applyType: DParameterEffectApplyType.Damage,
                //     variance: 0,
                //     silent: false,
                // });
                effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UT爆発四散").id, value1: 1.0, value2: 0});

                // 必中だと耐性を持っているはずの Player も即死してしまうので。
                effect.hitType = DEffectHitType.Magical;

                entity.counterActions.push({ conditionAttackType: REBasics.elements.explosion, emitSelf: true });

                entity.selfTraits.push({ code: REBasics.traits.TRAIT_STATE_RESIST, dataId: REData.getState("kState_UT爆発四散").id, value: 0 });

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
                break;
            }
            case "kEntity_トラバサミ_A": {
                const emittor = entity.mainEmittor();
                const effect = emittor.effectSet.effects[0];
                emittor.scope.range = DEffectFieldScopeRange.Center;
                effect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UTトラバサミ").id, value1: 1.0, value2: 0});
                break;
            }
            case "kEntity_バネ_A": {
                const emittor = entity.mainEmittor();
                const effect = emittor.effectSet.effects[0];
                emittor.scope.range = DEffectFieldScopeRange.Center;
                effect.effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.warp });
                break;
            }
            case "kEntity_転び石_A":
                entity.mainEmittor().scope.range = DEffectFieldScopeRange.Center;
                entity.mainEmittor().effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.stumble });
                break;
            case "kEntity_木の矢の罠_A": {
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.ReceiveProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_ウッドアロー_A";
                break;
            }
            case "kEntity_毒矢の罠_A": {
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.ReceiveProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_毒矢_A";
                emittor.effectSet.effects[0].parameterQualifyings.push(
                    new DParameterQualifying(REBasics.params.pow, "1", DParameterEffectApplyType.Damage));
                // emittor.effectSet.effects[0].parameterQualifyings.push({
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
            case "kEntity_錆ワナ_A":
                break;
            case "kEntity_落とし穴_A": {
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Center;
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.transferToLowerFloor });
                break;
            }
            case "kEntity_突風の罠_A": {
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Center;
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.transferToNextFloor });
                emittor.selfAnimationId = 94;
                break;
            }
            case "kEntity_保存の壺_A":
                entity.addReaction(REBasics.actions.PutInActionId);
                entity.addReaction(REBasics.actions.PickOutActionId);
                break;
            case "kEntity_ノーマウススクロール_A":
                this.setupScrollCommon(entity);
                //entity.effectSet.mainEmittor().effect.otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(REBasics.actions.ReadActionId, entity.mainEmittor());
                //entity.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kEntity_トラップスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.trapProliferation });
                emittor.selfAnimationId = 54;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_プレートスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Selection;
                emittor.effectSet.effects[0].rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_System_Plating").id, value1: 1.0, value2: 0});
                emittor.effectSet.effects[0].rmmzAnimationId = 12;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_モンスタースクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.clarification, value: DClarificationType.Unit });
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.performeSkill, dataId: REData.getSkill("kSkill_アイテム擬態解除_全体").id });
                emittor.effectSet.effects[0].rmmzAnimationId = 44;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_アイテムスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.clarification, value: DClarificationType.Item });
                emittor.effectSet.effects[0].rmmzAnimationId = 44;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_マップスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.clarification, value: DClarificationType.Unit });
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.clarification, value: DClarificationType.Trap });
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.clarification, value: DClarificationType.Terrain });
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.clarification, value: DClarificationType.Sight });
                emittor.effectSet.effects[0].rmmzAnimationId = 44;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_レインフォーススクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effectSet.effects = [];
                for (const effect of REData.getSkill("kSkill_武器強化").emittor().effectSet.effects) {
                    emittor.effectSet.effects.push(effect);
                }
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_レデューススクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effectSet.effects = [];
                for (const effect of REData.getSkill("kSkill_防具強化").emittor().effectSet.effects) {
                    emittor.effectSet.effects.push(effect);
                }
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_ディスペルスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                //emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.dispelEquipments });
                emittor.effectSet.effects[0].rmmzAnimationId = 46;

                
                const effect1 = REData.getSkill("kSkill_解呪").emittor().effectSet.effects[0].clone();
                const effect2 = REData.getSkill("kSkill_解呪").emittor().effectSet.effects[0].clone();
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.WeaponKindId);
                effect2.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.ShieldKindId);
                emittor.effectSet.effects.push(effect1);
                emittor.effectSet.effects.push(effect2);

                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_フランスパンスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Selection;
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.changeInstance, entityId: REData.getItem("kEntity_フランスパン_A").id });
                emittor.effectSet.effects[0].rmmzAnimationId = 2;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_マジックスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Selection;
                emittor.effectSet.effects[0].parameterQualifyings.push(new DParameterQualifying(REBasics.params.remaining, "5", DParameterEffectApplyType.Recover));
                emittor.effectSet.effects[0].rmmzAnimationId = 46;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_ストップスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Around;
                emittor.scope.length = 1;
                emittor.effectSet.effects[0].rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UTかなしばり").id, value1: 1.0, value2: 0});
                emittor.effectSet.effects[0].rmmzAnimationId = 15;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_ストームスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Room;
                emittor.effectSet.effects[0].parameterQualifyings.push(
                    new DParameterQualifying(REBasics.params.hp, "35", DParameterEffectApplyType.Damage)
                    .withVariance(20));
                emittor.selfAnimationId = 94;
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                break;
            }
            case "kEntity_リスタートスクロール_A": {
                this.setupScrollCommon(entity);
                const emittor = entity.mainEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.restartFloor });
                entity.addReaction(REBasics.actions.ReadActionId, emittor);
                emittor.selfAnimationId = 118;
                break;
            }
            case "kEntity_エスケープスクロール_A":
                this.setupScrollCommon(entity);
                entity.mainEmittor().effectSet.effects[0].otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(REBasics.actions.ReadActionId, entity.mainEmittor());
                entity.addReaction(REBasics.actions.collide, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                //entity.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kEntity_識別の巻物_A":
                this.setupScrollCommon(entity);
                entity.mainEmittor().scope.range = DEffectFieldScopeRange.Selection;
                entity.mainEmittor().effectSet.effects[0].otherEffectQualifyings.push({key: "kSystemEffect_識別"});
                entity.addReaction(REBasics.actions.ReadActionId, entity.mainEmittor());
                //entity.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kEntity_Gold_A":
                entity.addReaction(REBasics.actions.collide, entity.mainEmittor());
                //entity.addEmittor(DEffectCause.Hit, REData.cloneEmittor(entity.mainEmittor()));
                break;
            case "kEntity_投擲反射石_A":
                entity.selfTraits.push({code: REBasics.traits.PhysicalProjectileReflector, dataId: 0, value: 0});
                break;
                
        }
    }
    
    static setupDirectly_Skill(data: DSkill) {
        const emittor = data.emittor();
        switch (data.key) {
            case "kSkill_炎のブレス_直線":
                emittor.scope.range = DEffectFieldScopeRange.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_System_炎のブレス_A";
                break;
            case "kSkill_魔法弾発射_一般":
                emittor.scope.range = DEffectFieldScopeRange.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_System_MagicBullet_A";
                data.emittor().costs.setParamCost(DSkillCostSource.Item, REBasics.params.remaining, {type: DParamCostType.Decrease, value: 1});
                break;
            case "kSkill_ふきとばし":
                emittor.effectSet.effects[0].otherEffectQualifyings.push({key: "kSystemEffect_ふきとばし"});
                break;
            case "kSkill_変化":
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.changeInstance });
                emittor.effectSet.effects[0].rmmzAnimationId = 40;
                break;
            case "kSkill_投げ当て_1ダメ":
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                break;
            case "kSkill_火炎草ブレス":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                //emittor.scope.length = Infinity;
                //emittor.scope.projectilePrefabKey = "kEntity_System_炎のブレス_A";
                break;
            case "kSkill_射撃_矢":
                emittor.scope.range = DEffectFieldScopeRange.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kEntity_ウッドアロー_A";
                break;
            case "kSkill_足つかみ":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.effectSet.selfEffect.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UT足つかみ").id, value1: 100, value2: 0});
                break;
            case "kSkill_大爆発":
                emittor.scope.range = DEffectFieldScopeRange.Around;
                emittor.scope.length = 1;
                //emittor.effectSet.effects[0].qualifyings.specialEffectQualifyings.push({code: DSpecialEffectCodes.DeadlyExplosion, dataId: 0, value1: 0, value2: 0});
                //emittor.effectSet.effects[0].qualifyings.parameterQualifyings;
                emittor.effectSet.effects[0].rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UT爆発四散").id, value1: 100, value2: 0});
                //emittor.selfAnimationId = 109;
                emittor.selfSequelId = REBasics.sequels.explosion;
                emittor.effectSet.effects[0].hitType = DEffectHitType.Magical;
                break;
            case "kSkill_アイテム盗み":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.scope.layers.push(DBlockLayerKind.Ground);
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.itemSteal });
                break;
            case "kSkill_ゴールド盗み":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                //emittor.scope.layers.push(DBlockLayerKind.Ground);
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.goldSteal });
                break;
            case "kSkill_装備サビ":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                break;
            case "kSkill_装備サビ_武器":
            case "kSkill_装備サビ_盾":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                const p = new DParameterQualifying(REBasics.params.upgradeValue, "1", DParameterEffectApplyType.Damage);
                p.alliesSideGainMessage = tr2("%1はサビてしまった。"),
                p.alliesSideLossMessage = tr2("%1はサビてしまった。"),
                p.opponentGainMessage = tr2("%1はサビてしまった。"),
                p.opponentLossMessage = tr2("%1はサビてしまった。"),
                emittor.effectSet.effects[0].parameterQualifyings.push(p);
                // emittor.effectSet.effects[0].parameterQualifyings.push({
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
                    emittor.effectSet.effects[0].subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.WeaponKindId);
                }
                else {
                    emittor.effectSet.effects[0].subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.ShieldKindId);
                }
                break;
            case "kSkill_混乱魔法_部屋内":
                emittor.scope.range = DEffectFieldScopeRange.Room;
                emittor.selfAnimationId = 97;
                break;
            case "kSkill_毒攻撃":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.effectSet.effects[0].parameterQualifyings.push(new DParameterQualifying(REBasics.params.pow, "1", DParameterEffectApplyType.Damage));
                // emittor.effectSet.effects[0].parameterQualifyings.push({
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
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.effectSet.effects[0].parameterQualifyings.push(new DParameterQualifying(REBasics.params.pow, "3", DParameterEffectApplyType.Damage));
                // emittor.effectSet.effects[0].parameterQualifyings.push({
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
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.levelDown });
                break;
            case "kSkill_ワープ魔法":
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.warp });
                break;
            case "kSkill_Warp":
                emittor.effectSet.effects[0].effectBehaviors.push({ specialEffectId: REBasics.effectBehaviors.warp });
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                break;
            case "kSkill_KnockbackAttack":
                emittor.effectSet.effects[0].otherEffectQualifyings.push({key: "kSystemEffect_ふきとばし"});
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                break;
            case "kSkill_武器強化": {
                const effect1 = emittor.effectSet.effects[0];
                effect1.parameterQualifyings.push(new DParameterQualifying(REBasics.params.upgradeValue, "1", DParameterEffectApplyType.Recover));
                effect1.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_REMOVE_STATE, dataId: REData.system.states.curse, value1: 1.0, value2: 0});
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.WeaponKindId);
                effect1.conditions.applyRating = 7;
                effect1.rmmzAnimationId = 51;
                break;
            }
            case "kSkill_武器強化_強": {
                const effect1 = emittor.effectSet.effects[0];
                effect1.parameterQualifyings.push(new DParameterQualifying(REBasics.params.upgradeValue, "3", DParameterEffectApplyType.Recover));
                effect1.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_REMOVE_STATE, dataId: REData.system.states.curse, value1: 1.0, value2: 0});
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.WeaponKindId);
                effect1.conditions.applyRating = 3;
                effect1.rmmzAnimationId = 52;
                break;
            }
            case "kSkill_防具強化": {
                const effect1 = emittor.effectSet.effects[0];
                effect1.parameterQualifyings.push(new DParameterQualifying(REBasics.params.upgradeValue, "1", DParameterEffectApplyType.Recover));
                effect1.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_REMOVE_STATE, dataId: REData.system.states.curse, value1: 1.0, value2: 0});
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.ShieldKindId);
                effect1.conditions.applyRating = 7;
                effect1.rmmzAnimationId = 51;
                break;
            }
            case "kSkill_防具強化_強": {
                const effect1 = emittor.effectSet.effects[0];
                effect1.parameterQualifyings.push(new DParameterQualifying(REBasics.params.upgradeValue, "3", DParameterEffectApplyType.Recover));
                effect1.rmmzSpecialEffectQualifyings.push({code: DItemEffect.EFFECT_REMOVE_STATE, dataId: REData.system.states.curse, value1: 1.0, value2: 0});
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.ShieldKindId);
                effect1.conditions.applyRating = 3;
                effect1.rmmzAnimationId = 52;
                break;
            }
            case "kSkill_アイテム擬態解除_全体": {
                emittor.scope.range = DEffectFieldScopeRange.Map;
                break;
            }
        }
    }
    
    static linkSkill(data: DSkill) {
        const emittor = data.emittor();
        switch (data.key) {
            case "kSkill_装備サビ": {
                const effect1 = REData.getSkill("kSkill_装備サビ_武器").emittor().effectSet.effects[0].clone();
                const effect2 = REData.getSkill("kSkill_装備サビ_盾").emittor().effectSet.effects[0].clone();
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.WeaponKindId);
                effect2.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.ShieldKindId);
                emittor.effectSet.effects.push(effect1);
                emittor.effectSet.effects.push(effect2);
                break;
            }
            case "kSkill_武器強化": {
                const effect2 = REData.getSkill("kSkill_武器強化_強").emittor().effectSet.effects[0].clone();
                emittor.effectSet.effects.push(effect2);
                break;
            }
            case "kSkill_防具強化": {
                const effect2 = REData.getSkill("kSkill_防具強化_強").emittor().effectSet.effects[0].clone();
                emittor.effectSet.effects.push(effect2);
                break;
            }
        }
    }

    static linkItem(entity: DEntity) {
        const data = entity.item();
        switch (entity.entity.key) {
            case "kEntity_錆ワナ_A": {
                const emittor = entity.mainEmittor();
                const effect1 = REData.getSkill("kSkill_装備サビ_武器").emittor().effectSet.effects[0].clone();
                const effect2 = REData.getSkill("kSkill_装備サビ_盾").emittor().effectSet.effects[0].clone();
                effect1.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.WeaponKindId);
                effect2.subEntityFindKey.key = DSubComponentEffectTargetKey.make("Equipped", REBasics.entityKinds.ShieldKindId);
                emittor.effectSet.effects.push(effect1);
                emittor.effectSet.effects.push(effect2);
                emittor.scope.range = DEffectFieldScopeRange.Center;
                emittor.selfAnimationId = 82;
                break;
            }
        }
    }

    public static setupEnemy(entity: DEntity): void {
        const data = entity.enemyData();
        switch (entity.entity.key) {
            case "kEnemy_ブラストミミックA":
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
            case "kEnemy_プレゼンにゃーA":
                //data.traits.push({ code: DBasics.traits.ItemDropRate, dataId: 0, value: 1.0 });
                break;
            case "kEnemy_キングプレゼンにゃーA":
                entity.majorActionDeclines = 1;
                break;
            case "kEnemy_インビジブルバットA":
                data.traits.push({ code: REBasics.traits.Invisible, dataId: 0, value: 0 });
                break;
            case "kEnemy_店主A":
                entity.factionId = REData.system.factions.neutral;
                break;
        }
    }
    
    public static setupDirectly_State(data: DState) {
        switch (data.key) {
            case "kState_System_ItemStanding":
                data.effect.behaviors.push({ name: "LItemStandingBehavior" });
                break;
            case "kState_睡眠":
                data.idleSequel = REBasics.sequels.asleep;
                break;
            case "kState_UT気配察知":
                data.effect.traits.push({ code: REBasics.traits.UnitVisitor, dataId: 0, value: 0 });
                break;
            case "kState_UTよくみえ":
                data.effect.traits.push({ code: REBasics.traits.ForceVisible, dataId: 0, value: 0 });
                break;
            case "kState_UnitTest_攻撃必中":
                data.effect.traits.push({ code: REBasics.traits.CertainDirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_UnitTest_投擲必中":
                data.effect.traits.push({ code: REBasics.traits.CertainIndirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_System_kNap":
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.DamageTesting, paramId: REBasics.params.hp });
                break;
            case "kState_UTアイテム擬態":
                data.effect.behaviors.push({ name: "LItemImitatorBehavior" });
                break;
            case "kState_仮眠2":
                //data.behaviors.push("LDoze2Behavior");
                data.effect.traits.push({ code: REBasics.traits.StateRemoveByEffect, dataId: 0, value: 0 });
                data.idleSequel = REBasics.sequels.asleep;
                break;
            case "kState_UT魔法使い":
                data.effect.traits.push({ code: REBasics.traits.EquipmentProficiency, dataId: REData.getEntityKind("Weapon").id, value: 0.5 });
                data.effect.traits.push({ code: REBasics.traits.EquipmentProficiency, dataId: REData.getEntityKind("Shield").id, value: 0.5 });
                data.effect.traits.push({ code: REBasics.traits.EffectProficiency, dataId: REData.getEntityKind("Grass").id, value: 2.0 });
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
                data.effect.behaviors.push({ name: "LIllusionStateBehavior" });
                break;
            case "kState_UTからぶり":
                break;
            case "kState_UTくちなし":
                data.effect.traits.push({ code: REBasics.traits.SealActivity, dataId: REBasics.actions.EatActionId, value: 0 });
                data.effect.traits.push({ code: REBasics.traits.SealActivity, dataId: REBasics.actions.ReadActionId, value: 0 });
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.FloorTransfer });
                break;
            case "kState_UTかなしばり":
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.DamageTesting, paramId: REBasics.params.hp });
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.ActualParam, formula: "a.fp <= 0" });
                break;
            case "kState_System_Seal":
                data.effect.traits.push({ code: REBasics.traits.SealSpecialAbility, dataId: REBasics.actions.EatActionId, value: 0 });
                break;
            case "kState_UT透明":
                data.effect.traits.push({ code: REBasics.traits.Invisible, dataId: 0, value: 0 });
                data.submatchStates.push(REData.getState("kState_UT透明_モンスター").id);
                break;
            case "kState_UT透明_モンスター":
                data.effect.traits.push({ code: REBasics.traits.Invisible, dataId: 0, value: 0 });
                data.effect.matchConditions.kindId = REBasics.entityKinds.MonsterKindId;
                break;
            case "kState_UT足つかみ":
                data.effect.behaviors.push({ name: "LGrabFootBehavior" });
                break;
            case "kState_物理投擲回避":
                data.effect.traits.push({ code: REBasics.traits.DodgePhysicalIndirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_UT下手投げ":
                data.effect.traits.push({ code: REBasics.traits.AwfulPhysicalIndirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_Anger":
                data.effect.traits.push({ code: REBasics.traits.UseSkillForced, dataId: 0, value: 0 });
                break;
            case "kState_UT爆発四散":
                data.deadState  = true;
                break;
            case "kState_UTトラバサミ":
                data.effect.traits.push({ code: REBasics.traits.SealActivity, dataId: REBasics.actions.MoveToAdjacentActionId, value: 0 });
                break;
            case "kState_System_Plating":
                data.effect.traits.push({ code: REBasics.traits.ParamDamageRate, dataId: REBasics.params.upgradeValue, value: 0.0 });
                data.applyConditions.kindIds = [REBasics.entityKinds.WeaponKindId, REBasics.entityKinds.ShieldKindId];
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

    private static setupWeaponCommon(entity: DEntity): void {
        entity.upgradeMin = -99;    // TODO: 攻撃力下限までにしたい
        entity.upgradeMax = 99;
        entity.idealParams[REBasics.params.upgradeValue] = 0;
        entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
        entity.identifiedTiming = DIdentifiedTiming.Equip;
    }

    private static setupShieldCommon(entity: DEntity): void {
        entity.upgradeMin = -99;    // TODO: 攻撃力下限までにしたい
        entity.upgradeMax = 99;
        entity.idealParams[REBasics.params.upgradeValue] = 0;
        entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
        entity.identifiedTiming = DIdentifiedTiming.Equip;
    }

    private static setupRingCommon(entity: DEntity): void {
        entity.entity.behaviors.push({name: "Equipment"});
    }

    private static setupGrassCommon(entity: DEntity): [DEmittor, DEmittor] {
        // MainEmittor が Eat, Collide 両方の効果になるようにする。
        // ただし Eat には FP 回復効果も付くため、先に Collide 用の Emittor を clone で作っておき、
        // そのあと MainEmittor に FP 回復効果を追加する。

        const mainEmittor = entity.mainEmittor();
        mainEmittor.scope.range = DEffectFieldScopeRange.Performer;

        // Collide
        const collideEmittor = REData.cloneEmittor(mainEmittor);
        entity.addReaction(REBasics.actions.collide, collideEmittor);
        //entity.addEmittor(DEffectCause.Hit, collideEmittor);

        // FP 回復
        const eatEmittor = mainEmittor;//REData.newEmittor(entity.entity.key);

        const fpEffect = new DEffect(entity.entity.key);
        fpEffect.parameterQualifyings.push(new DParameterQualifying(REBasics.params.fp, "500", DParameterEffectApplyType.Recover).withSilent());
        eatEmittor.effectSet.effects.push(fpEffect);
        entity.addReaction(REBasics.actions.EatActionId, eatEmittor);
        //entity.addEmittor(DEffectCause.Eat, eatEmittor);

        // 投げ当てで MainEmittor 発動
        //entity.addEmittor(DEffectCause.Hit, REData.cloneEmittor(entity.mainEmittor()));

        entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
        entity.identifiedTiming = DIdentifiedTiming.Eat;
        entity.canModifierState = false;

        return [eatEmittor, collideEmittor];
    }

    private static setupStaffCommon(entity: DEntity): void {
        const mainEmittor = entity.mainEmittor();
        entity.addReaction(REBasics.actions.collide, mainEmittor);
        //entity.addEmittor(DEffectCause.Hit, entity.mainEmittor());
    }

    private static setupScrollCommon(entity: DEntity): void {
        entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
        entity.identifiedTiming = DIdentifiedTiming.Read;
    }

    private static setupArrowCommon(entity: DEntity): void {
        const emittor = REData.newEmittor(entity.entity.key);
        emittor.scope.range = DEffectFieldScopeRange.Performer;
        const effect = new DEffect(entity.entity.key);
        effect.critical = false;
        effect.successRate = 100;
        effect.hitType = DEffectHitType.Physical;
        // const q: DParameterQualifying = {
        //     parameterId: REBasics.params.hp,
        //     applyTarget: DParameterApplyTarget.Current,
        //     elementId: 0,
        //     formula: "a.atk * 4 - b.def * 2",
        //     applyType: DParameterEffectApplyType.Damage,
        //     variance: 20,
        //     silent: false,
        // };
        const q = new DParameterQualifying(REBasics.params.hp, "a.atk * 4 - b.def * 2", DParameterEffectApplyType.Damage)
            .withVariance(20);
        effect.parameterQualifyings.push(q);
        emittor.effectSet.effects.push(effect);
        //entity.addEmittor(DEffectCause.Hit, emittor);
        entity.addReaction(REBasics.actions.collide, emittor);

    }
}






