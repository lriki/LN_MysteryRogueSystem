import { REBasics } from "./REBasics";
import { DBlockLayerKind, DSpecialEffectCodes } from "./DCommon";
import { DBuffMode, DBuffOp, DEffect, DEffectFieldScopeRange, DParamCostType, DParameterApplyTarget, DParameterEffectApplyType, DSkillCostSource, DSubEffect, DSubEffectTargetKey, LStateLevelType } from "./DEffect";
import { DEffectCause } from "./DEmittor";
import { DEntity, DIdentificationDifficulty } from "./DEntity";
import { DIdentifiedTiming } from "./DIdentifyer";
import { DItemEffect } from "./DItemEffect";
import { DPrefab } from "./DPrefab";
import { DSkill } from "./DSkill";
import { DAutoRemovalTiming, DState, DStateRestriction } from "./DState";
import { DStateGroup } from "./DStateGroup";
import { REData } from "./REData";

export class RESetup {

    public static setupPrefab(data: DPrefab) {
        
        switch (data.key) {
            case "pActor1":
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
    
    public static setupDirectly_State(data: DState) {
        switch (data.key) {
            case "kState_UT気配察知":
                data.effect.traits.push({ code: REBasics.traits.UnitVisitor, dataId: 0, value: 0 });
                break;
            case "kState_UnitTest_攻撃必中":
                data.effect.traits.push({ code: REBasics.traits.CertainDirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_UTアイテム擬態":
                data.effect.behaviors.push("LItemImitatorBehavior");
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
            case "kState_UT目つぶし":
                data.effect.restriction = DStateRestriction.Blind;
                break;
            case "kState_UTまどわし":
                data.effect.behaviors.push("LIllusionStateBehavior");
                break;
            case "kState_UTくちなし":
                data.effect.traits.push({ code: REBasics.traits.SealActivity, dataId: REBasics.actions.EatActionId, value: 0 });
                data.effect.traits.push({ code: REBasics.traits.SealActivity, dataId: REBasics.actions.ReadActionId, value: 0 });
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.FloorTransfer });
                break;
            case "kState_UTかなしばり":
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.DamageTesting, paramId: REBasics.params.hp });
                data.effect.autoRemovals.push({ kind: DAutoRemovalTiming.ActualParam, formula: "a.fp <= 3" });
                break;
            case "kState_UT封印":
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
                data.effect.behaviors.push("LGrabFootBehavior");
                break;
            case "kState_UT身かわし":
                data.effect.traits.push({ code: REBasics.traits.CartailDodgePhysicalAttack, dataId: 0, value: 0 });
                break;
            case "kState_UT下手投げ":
                data.effect.traits.push({ code: REBasics.traits.AwfulPhysicalIndirectAttack, dataId: 0, value: 0 });
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
    
    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    public static setupDirectly_DItem(entity: DEntity) {
        const data = entity.item();
        switch (entity.entity.key) {
            case "kゴブリンのこん棒":
                entity.upgradeMin = -99;    // TODO: 攻撃力下限までにしたい
                entity.upgradeMax = 99;
                entity.idealParams[REBasics.params.upgradeValue] = 0;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kシルバーソード":
                entity.upgradeMin = -99;    // TODO: 攻撃力下限までにしたい
                entity.upgradeMax = 99;
                entity.idealParams[REBasics.params.upgradeValue] = 0;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kレザーシールド":
                entity.upgradeMin = -99;    // TODO: 攻撃力下限までにしたい
                entity.upgradeMax = 99;
                entity.idealParams[REBasics.params.upgradeValue] = 0;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kウッドアロー":
                entity.display.stackedName = "%1本の" + entity.display.name;
                data.traits.push({code: REBasics.traits.Stackable, dataId: 0, value: 0});
                entity.addReaction(REBasics.actions.ShootingActionId, 0);
                break;
            case "kItem_スピードドラッグ":
                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.emittorSet.addEmittor(DEffectCause.Eat, entity.emittorSet.mainEmittor());
                entity.emittorSet.addEmittor(DEffectCause.Hit, entity.emittorSet.mainEmittor());

                const emittor = REData.newEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                const effect = new DEffect();
                effect.qualifyings.buffQualifying.push({
                    paramId: REBasics.params.agi,
                    mode: DBuffMode.Strength,
                    level: 1,
                    levelType: LStateLevelType.RelativeValue,
                    op: DBuffOp.Add,
                    turn: 10,
                });
                emittor.effectSet.effects.push(effect);
                entity.emittorSet.addEmittor(DEffectCause.Eat, emittor);
                entity.emittorSet.addEmittor(DEffectCause.Hit, emittor);

                break;
            case "kパワードラッグ":

                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                
                {
                    const emittor = entity.emittorSet.emittors(DEffectCause.Eat)[0]; //entity.emittorSet.mainEmittor();
                    emittor.scope.range = DEffectFieldScopeRange.Performer;
                    const effect = new DEffect();
                    effect.qualifyings.parameterQualifyings.push({
                        parameterId: REBasics.params.pow,
                        applyTarget: DParameterApplyTarget.Current,
                        elementId: 0,
                        formula: "1",
                        applyType: DParameterEffectApplyType.Recover,
                        variance: 0,
                        silent: false,
                        conditionFormula: "a.pow < a.max_pow",
                    });
                    effect.qualifyings.parameterQualifyings.push({
                        parameterId: REBasics.params.pow,
                        applyTarget: DParameterApplyTarget.Maximum,
                        elementId: 0,
                        formula: "1",
                        applyType: DParameterEffectApplyType.Recover,
                        variance: 0,
                        silent: false,
                        conditionFormula: "a.pow >= a.max_pow",
                    });
                    emittor.effectSet.effects.push(effect);
                    //entity.emittorSet.addEmittor(DEffectCause.Eat, emittor);
                }
                
                break;
            case "kブラインドドラッグ":
                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.emittorSet.addEmittor(DEffectCause.Eat, entity.emittorSet.mainEmittor());
                entity.emittorSet.addEmittor(DEffectCause.Hit, entity.emittorSet.mainEmittor());
                break;
            case "kパニックドラッグ":
                entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.emittorSet.addEmittor(DEffectCause.Eat, entity.emittorSet.mainEmittor());
                entity.emittorSet.addEmittor(DEffectCause.Hit, entity.emittorSet.mainEmittor());
                break;
            case "kマッドドラッグ":
                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.emittorSet.addEmittor(DEffectCause.Eat, entity.emittorSet.mainEmittor());
                entity.emittorSet.addEmittor(DEffectCause.Hit, entity.emittorSet.mainEmittor());
                break;
            case "kキュアリーフ":
                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.emittorSet.addEmittor(DEffectCause.Eat, entity.emittorSet.mainEmittor());
                break;
            case "k火炎草70_50":
                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.emittorSet.addEmittor(DEffectCause.Eat, REData.getSkill("kSkill_火炎草ブレス").emittor());

                //const emittor = entity.effectSet.emittor(DEffectCause.Eat);
                //assert(emittor);
                //emittor.scope.range = DEffectFieldScopeRange.Front1;
                //entity.effectSet.setEmittor(DEffectCause.Hit, entity.effectSet.mainEmittor());
                //data.effectSet.setSkill(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_隣接"));
                //data.effectSet.setEffect(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_直線").effect());
                //entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                break;
            case "kItem_ドラゴン草":
                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                //entity.emittorSet.addEmittor(DEffectCause.Eat, entity.emittorSet.mainEmittor());
                entity.emittorSet.addEmittor(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_直線").emittor());
                break;
            case "kItem_しびれ草":
                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.emittorSet.addEmittor(DEffectCause.Eat, entity.emittorSet.mainEmittor());
                break;
            case "kItem_きえさり草":
                this.setupGrassCommon(entity);
                entity.addReaction(REBasics.actions.EatActionId, 0);
                entity.emittorSet.addEmittor(DEffectCause.Eat, entity.emittorSet.mainEmittor());
                break;
            case "kふきとばしの杖":
                //data.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").effect);
                entity.emittorSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_ふきとばし").emittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor().id);
                entity.idealParams[REBasics.params.remaining] = 5;
                entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                break;
            case "kItem_シールの杖":
                entity.emittorSet.addEmittor(DEffectCause.Hit, entity.emittorSet.mainEmittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor().id);
                entity.idealParams[REBasics.params.remaining] = 5;
                break;
            case "kItem_チェンジの杖":
                //data.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").effect);
                entity.emittorSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_変化").emittor());
                entity.addReaction(REBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor().id);
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
            case "k眠りガス":
                break;
            case "kItem_保存の壺":
                entity.addReaction(REBasics.actions.PutInActionId, 0);
                entity.addReaction(REBasics.actions.PickOutActionId, 0);
                break;
            case "kItem_ノーマウススクロール":
                //entity.effectSet.mainEmittor().effect.otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(REBasics.actions.ReadActionId, entity.emittorSet.mainEmittor().id);
                entity.emittorSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kItem_エスケープスクロール":
                entity.emittorSet.mainEmittor().effectSet.effects[0].qualifyings.otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(REBasics.actions.ReadActionId, entity.emittorSet.mainEmittor().id);
                entity.emittorSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kItem_識別の巻物":
                entity.emittorSet.mainEmittor().scope.range = DEffectFieldScopeRange.Selection;
                entity.emittorSet.mainEmittor().effectSet.effects[0].qualifyings.otherEffectQualifyings.push({key: "kSystemEffect_識別"});
                entity.addReaction(REBasics.actions.ReadActionId, entity.emittorSet.mainEmittor().id);
                entity.emittorSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kItem_Gold":
                entity.emittorSet.addEmittor(DEffectCause.Hit, REData.cloneEmittor(entity.emittorSet.mainEmittor()));
                break;
                
        }
    }
    
    static setupDirectly_Skill(data: DSkill) {
        const emittor = data.emittor();
        switch (data.key) {
            case "kSkill_炎のブレス_直線":
                emittor.scope.range = DEffectFieldScopeRange.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kSystem_炎のブレス";
                break;
            case "kSkill_魔法弾発射_一般":
                emittor.scope.range = DEffectFieldScopeRange.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kSystem_MagicBullet";
                data.emittor().costs.setParamCost(DSkillCostSource.Item, REBasics.params.remaining, {type: DParamCostType.Decrease, value: 1});
                break;
            case "kSkill_ふきとばし":
                emittor.effectSet.effects[0].qualifyings.otherEffectQualifyings.push({key: "kSystemEffect_ふきとばし"});
                break;
            case "kSkill_変化":
                emittor.effectSet.effects[0].qualifyings.otherEffectQualifyings.push({key: "kSystemEffect_変化"});
                break;
            case "kSkill_投げ当て_1ダメ":
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                break;
            case "kSkill_火炎草ブレス":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                //emittor.scope.length = Infinity;
                //emittor.scope.projectilePrefabKey = "kSystem_炎のブレス";
                break;
            case "kSkill_射撃_矢":
                emittor.scope.range = DEffectFieldScopeRange.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kウッドアロー";
                break;
            case "kSkill_足つかみ":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.effectSet.selfEffect.qualifyings.specialEffectQualifyings.push({code: DItemEffect.EFFECT_ADD_STATE, dataId: REData.getState("kState_UT足つかみ").id, value1: 100, value2: 0});
                break;
            case "kSkill_大爆発":
                emittor.scope.range = DEffectFieldScopeRange.Around;
                emittor.scope.length = 1;
                emittor.effectSet.effects[0].qualifyings.specialEffectQualifyings.push({code: DSpecialEffectCodes.DeadlyExplosion, dataId: 0, value1: 0, value2: 0});
                //emittor.selfAnimationId = 109;
                emittor.selfSequelId = REBasics.sequels.explosion;
                break;
            case "kSkill_アイテム盗み":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.scope.layers.push(DBlockLayerKind.Ground);
                emittor.effectSet.effects[0].qualifyings.effectBehaviors.push(REBasics.effectBehaviors.itemSteal);
                break;
            case "kSkill_ゴールド盗み":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                //emittor.scope.layers.push(DBlockLayerKind.Ground);
                emittor.effectSet.effects[0].qualifyings.effectBehaviors.push(REBasics.effectBehaviors.goldSteal);
                break;
            case "kSkill_装備サビ":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                break;
            case "kSkill_装備サビ_武器":
            case "kSkill_装備サビ_盾":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.effectSet.effects[0].qualifyings.parameterQualifyings.push({
                    parameterId: REBasics.params.upgradeValue,
                    applyTarget: DParameterApplyTarget.Current,
                    elementId: 0,
                    formula: "1",
                    applyType: DParameterEffectApplyType.Damage,
                    variance: 0,
                    silent: true,
                });
                break;
            case "kSkill_混乱魔法_部屋内":
                emittor.scope.range = DEffectFieldScopeRange.Room;
                break;
            case "kSkill_毒攻撃":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.effectSet.effects[0].qualifyings.parameterQualifyings.push({
                    parameterId: REBasics.params.pow,
                    applyTarget: DParameterApplyTarget.Current,
                    elementId: 0,
                    formula: "1",
                    applyType: DParameterEffectApplyType.Damage,
                    variance: 0,
                    silent: false,
                });
                break;
            case "kSkill_毒攻撃_強":
                emittor.scope.range = DEffectFieldScopeRange.Front1;
                emittor.effectSet.effects[0].qualifyings.parameterQualifyings.push({
                    parameterId: REBasics.params.pow,
                    applyTarget: DParameterApplyTarget.Current,
                    elementId: 0,
                    formula: "3",
                    applyType: DParameterEffectApplyType.Damage,
                    variance: 0,
                    silent: false,
                });
                break;

                
        }
    }
    
    static linkSkill(data: DSkill) {
        const emittor = data.emittor();
        switch (data.key) {
            case "kSkill_装備サビ":
                emittor.effectSet.subEffects.push(new DSubEffect(DSubEffectTargetKey.make("Equipped", REBasics.entityKinds.WeaponKindId), REData.getSkill("kSkill_装備サビ_武器").emittor().effectSet.effects[0].clone()));
                emittor.effectSet.subEffects.push(new DSubEffect(DSubEffectTargetKey.make("Equipped", REBasics.entityKinds.ShieldKindId), REData.getSkill("kSkill_装備サビ_盾").emittor().effectSet.effects[0].clone()));
                break;
        }
    }

    public static setupEnemy(entity: DEntity): void {
        const data = entity.enemyData();
        switch (entity.entity.key) {
            case "kEnemy_自爆屋":
                //entity.autoAdditionStates.push({ stateId: REData.getStateFuzzy("kState_UTかなしばり").id, condition: "a.hp<50" });
                break;
            case "kEnemy_走り屋A":
                entity.majorActionDeclines = 1;
                break;
            case "kEnemy_アイテム盗み屋":
                //data.traits.push({ code: DBasics.traits.ItemDropRate, dataId: 0, value: 1.0 });
                break;
            case "kEnemy_逃走屋":
                entity.majorActionDeclines = 1;
                break;
        }
    }
    

    private static setupGrassCommon(entity: DEntity): void {
        // FP 回復
        const emittor = REData.newEmittor();
        emittor.scope.range = DEffectFieldScopeRange.Performer;
        const effect = new DEffect();
        effect.qualifyings.parameterQualifyings.push({
            parameterId: REBasics.params.fp,
            applyTarget: DParameterApplyTarget.Current,
            elementId: 0,
            formula: "5",
            applyType: DParameterEffectApplyType.Recover,
            variance: 0,
            silent: true,
        });
        emittor.effectSet.effects.push(effect);
        entity.emittorSet.addEmittor(DEffectCause.Eat, emittor);

        // 投げ当てで MainEmittor 発動
        entity.emittorSet.addEmittor(DEffectCause.Hit, REData.cloneEmittor(entity.emittorSet.mainEmittor()));

        entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
        entity.identifiedTiming = DIdentifiedTiming.Eat;
        entity.canModifierState = false;
    }
}

