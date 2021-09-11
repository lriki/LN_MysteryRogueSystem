import { DBasics } from "./DBasics";
import { DBuffMode, DBuffOp, DEffectCause, DEffectFieldScopeRange, DParameterEffectApplyType, LStateLevelType } from "./DEffect";
import { DEntity, DIdentificationDifficulty } from "./DEntity";
import { DIdentifiedTiming } from "./DIdentifyer";
import { DAutoRemovalTiming, DState, DStateRestriction } from "./DState";
import { DStateGroup } from "./DStateGroup";
import { DTraits } from "./DTraits";
import { REData } from "./REData";

export class RESetup {
    
    public static setupDirectly_State(data: DState) {
        switch (data.key) {
            case "kState_UT気配察知":
                data.traits.push({ code: DTraits.UnitVisitor, dataId: 0, value: 0 });
                break;
            case "kState_UnitTest_攻撃必中":
                data.traits.push({ code: DTraits.CertainDirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_UTアイテム擬態":
                data.behaviors.push("LItemImitatorBehavior");
                break;
            case "kState_仮眠2":
                //data.behaviors.push("LDoze2Behavior");
                data.traits.push({ code: DTraits.StateRemoveByEffect, dataId: 0, value: 0 });
                break;
            case "kState_UT魔法使い":
                data.traits.push({ code: DTraits.EquipmentProficiency, dataId: REData.getEntityKind("Weapon").id, value: 0.5 });
                data.traits.push({ code: DTraits.EquipmentProficiency, dataId: REData.getEntityKind("Shield").id, value: 0.5 });
                data.traits.push({ code: DTraits.EffectProficiency, dataId: REData.getEntityKind("Grass").id, value: 2.0 });
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
                data.restriction = DStateRestriction.Blind;
                break;
            case "kState_UTまどわし":
                data.behaviors.push("LIllusionStateBehavior");
                break;
            case "kState_UTくちなし":
                data.traits.push({ code: DTraits.SealActivity, dataId: DBasics.actions.EatActionId, value: 0 });
                data.traits.push({ code: DTraits.SealActivity, dataId: DBasics.actions.ReadActionId, value: 0 });
                data.autoRemovals.push({ kind: DAutoRemovalTiming.FloorTransfer });
                break;
            case "kState_UTかなしばり":
                data.autoRemovals.push({ kind: DAutoRemovalTiming.DamageTesting, paramId: DBasics.params.hp });
                data.autoRemovals.push({ kind: DAutoRemovalTiming.ActualParam, formula: "a.fp <= 3" });
                break;
            case "kState_UT封印":
                data.traits.push({ code: DTraits.SealSpecialAbility, dataId: DBasics.actions.EatActionId, value: 0 });
                break;
            case "kState_UT透明":
                data.traits.push({ code: DTraits.Invisible, dataId: 0, value: 0 });
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
                entity.idealParams[DBasics.params.upgradeValue] = 0;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kシルバーソード":
                entity.idealParams[DBasics.params.upgradeValue] = -1;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kレザーシールド":
                entity.idealParams[DBasics.params.upgradeValue] = -1;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kウッドアロー":
                entity.display.stackedName = "%1本の" + entity.display.name;
                data.traits.push({code: DTraits.Stackable, dataId: 0, value: 0});
                entity.addReaction(DBasics.actions.ShootingActionId, 0);
                break;
            case "kItem_スピードドラッグ":
                this.setupGrassCommon(entity);
                entity.addReaction(DBasics.actions.EatActionId, 0);
                entity.effectSet.addEmittor(DEffectCause.Eat, entity.effectSet.mainEmittor());
                entity.effectSet.addEmittor(DEffectCause.Hit, entity.effectSet.mainEmittor());

                const emittor = REData.newEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effect.buffQualifying.push({
                    paramId: DBasics.params.agi,
                    mode: DBuffMode.Strength,
                    level: 1,
                    levelType: LStateLevelType.RelativeValue,
                    op: DBuffOp.Add,
                    turn: 10,
                });
                entity.effectSet.addEmittor(DEffectCause.Eat, emittor);
                entity.effectSet.addEmittor(DEffectCause.Hit, emittor);

                break;
            case "kブラインドドラッグ":
                this.setupGrassCommon(entity);
                entity.addReaction(DBasics.actions.EatActionId, 0);
                entity.effectSet.addEmittor(DEffectCause.Eat, entity.effectSet.mainEmittor());
                entity.effectSet.addEmittor(DEffectCause.Hit, entity.effectSet.mainEmittor());
                break;
            case "kパニックドラッグ":
                entity.addReaction(DBasics.actions.EatActionId, 0);
                entity.effectSet.addEmittor(DEffectCause.Eat, entity.effectSet.mainEmittor());
                entity.effectSet.addEmittor(DEffectCause.Hit, entity.effectSet.mainEmittor());
                break;
            case "kマッドドラッグ":
                this.setupGrassCommon(entity);
                entity.addReaction(DBasics.actions.EatActionId, 0);
                entity.effectSet.addEmittor(DEffectCause.Eat, entity.effectSet.mainEmittor());
                entity.effectSet.addEmittor(DEffectCause.Hit, entity.effectSet.mainEmittor());
                break;
            case "kキュアリーフ":
                this.setupGrassCommon(entity);
                entity.effectSet.addEmittor(DEffectCause.Eat, entity.effectSet.mainEmittor());
                break;
            case "k火炎草70_50":
                this.setupGrassCommon(entity);
                entity.effectSet.addEmittor(DEffectCause.Eat, REData.getSkill("kSkill_火炎草ブレス").emittor());

                //const emittor = entity.effectSet.emittor(DEffectCause.Eat);
                //assert(emittor);
                //emittor.scope.range = DEffectFieldScopeRange.Front1;
                //entity.effectSet.setEmittor(DEffectCause.Hit, entity.effectSet.mainEmittor());
                //data.effectSet.setSkill(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_隣接"));
                //data.effectSet.setEffect(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_直線").effect());
                //entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                break;
            case "kItem_しびれ草":
                this.setupGrassCommon(entity);
                entity.addReaction(DBasics.actions.EatActionId, 0);
                entity.effectSet.addEmittor(DEffectCause.Eat, entity.effectSet.mainEmittor());
                break;
            case "kItem_きえさり草":
                this.setupGrassCommon(entity);
                entity.addReaction(DBasics.actions.EatActionId, 0);
                entity.effectSet.addEmittor(DEffectCause.Eat, entity.effectSet.mainEmittor());
                break;
            case "kふきとばしの杖":
                //data.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").effect);
                entity.effectSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_ふきとばし").emittor());
                entity.addReaction(DBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor().id);
                entity.idealParams[DBasics.params.remaining] = 5;
                entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                break;
            case "kItem_シールの杖":
                entity.effectSet.addEmittor(DEffectCause.Hit, entity.effectSet.mainEmittor());
                entity.addReaction(DBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor().id);
                entity.idealParams[DBasics.params.remaining] = 5;
                break;
            case "kItem_チェンジの杖":
                //data.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").effect);
                entity.effectSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_変化").emittor());
                entity.addReaction(DBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor().id);
                entity.idealParams[DBasics.params.remaining] = 3;
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
                entity.addReaction(DBasics.actions.PutInActionId, 0);
                entity.addReaction(DBasics.actions.PickOutActionId, 0);
                break;
            case "kItem_ノーマウススクロール":
                //entity.effectSet.mainEmittor().effect.otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(DBasics.actions.ReadActionId, entity.effectSet.mainEmittor().id);
                entity.effectSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kItem_エスケープスクロール":
                entity.effectSet.mainEmittor().effect.otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(DBasics.actions.ReadActionId, entity.effectSet.mainEmittor().id);
                entity.effectSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kItem_識別の巻物":
                entity.effectSet.mainEmittor().scope.range = DEffectFieldScopeRange.Selection;
                entity.effectSet.mainEmittor().effect.otherEffectQualifyings.push({key: "kSystemEffect_識別"});
                entity.addReaction(DBasics.actions.ReadActionId, entity.effectSet.mainEmittor().id);
                entity.effectSet.addEmittor(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
                
        }
    }

    private static setupGrassCommon(entity: DEntity): void {
        // FP 回復
        const emittor = REData.newEmittor();
        emittor.scope.range = DEffectFieldScopeRange.Performer;
        emittor.effect.parameterQualifyings.push({
            parameterId: DBasics.params.fp,
            elementId: 0,
            formula: "5",
            applyType: DParameterEffectApplyType.Recover,
            variance: 0,
            silent: true,
        });
        entity.effectSet.addEmittor(DEffectCause.Eat, emittor);

        // 投げ当てで MainEmittor 発動
        entity.effectSet.addEmittor(DEffectCause.Hit, REData.cloneEmittor(entity.effectSet.mainEmittor()));

        entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
        entity.identifiedTiming = DIdentifiedTiming.Eat;
        entity.canModifierState = false;
    }
}

