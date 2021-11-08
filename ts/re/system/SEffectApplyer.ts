import { REBasics } from "../data/REBasics";
import { DEffectBehaviorId, DEntityKindId } from "../data/DCommon";
import { DEffect, DEffectHitType, DEffectSet, DOtherEffectQualifying, DParamBuff, DParameterApplyTarget, DParameterEffectApplyType, DParameterQualifying, DQualifyings, DSubEffectTargetKey } from "../data/DEffect";
import { DItemEffect } from "../data/DItemEffect";
import { DParameterId } from "../data/DParameter";
import { DEffectBehavior } from "../data/DSkill";
import { LandExitResult, REData } from "../data/REData";
import { LProjectableBehavior } from "../objects/behaviors/activities/LProjectableBehavior";
import { LBattlerBehavior } from "../objects/behaviors/LBattlerBehavior";
import { LEffectResult, LParamEffectResult } from "../objects/LEffectResult";
import { LEntity } from "../objects/LEntity";
import { LRandom } from "../objects/LRandom";
import { REGame } from "../objects/REGame";
import { UEffect } from "../usecases/UEffect";
import { UIdentify } from "../usecases/UIdentify";
import { USpawner } from "../usecases/USpawner";
import { UTransfer } from "../usecases/UTransfer";
import { RESystem } from "./RESystem";
import { SCommandContext } from "./SCommandContext";
import { SEffectContext, SEffectIncidentType, SEffectSubject } from "./SEffectContext";



export class SEffect {
    private _fact: SEffectorFact;
    private _data: DEffect;
    private _targetModifier: SEffectModifier;
    private _hitType: DEffectHitType;
    private _successRate: number;   // 0~100

    constructor(fact: SEffectorFact, effect: DEffect) {
        this._fact = fact;
        this._data = effect;
        this._hitType = effect.hitType;
        this._successRate = effect.successRate;

        this._targetModifier = new SEffectModifier(fact.subject(), effect.qualifyings);
    }

    public fact(): SEffectorFact {
        return this._fact;
    }

    public subject(): LEntity {
        return this._fact.subject();
    }

    public data(): DEffect {
        return this._data;
    }
    
    public targetModifier(): SEffectModifier {
        return this._targetModifier;
    }

    
        
    public isCertainHit(): boolean {
        return this._hitType == DEffectHitType.Certain;
    }

    public isPhysical(): boolean {
        return this._hitType == DEffectHitType.Physical;
    }

    public isMagical(): boolean {
        return this._hitType == DEffectHitType.Magical;
    }

    // 0.0~1.0
    // クラスの特徴などで [追加能力値:命中+x] が無いと 0 になり全く命中しなくなる。
    // Game_Action.prototype.itemHit
    public hitRate(): number {
        const successRate = this._successRate;
        if (this.isPhysical()) {
            const subject = this.subject();
            const hit = (subject) ? subject.xparamOrDefault(REBasics.xparams.hit, 1.0) : 1.0;
            return successRate * 0.01 * hit;
        } else {
            return successRate * 0.01;
        }
    }

    // Game_Action.prototype.itemEva
    public evaRate(target: LEntity): number {
        if (this.isPhysical()) {
            return target.xparam(REBasics.xparams.eva);
        } else if (this.isMagical()) {
            return target.xparam(REBasics.xparams.mev);
        } else {
            return 0;
        }
    }

    // Game_Action.prototype.itemCri
    public criRate(target: LEntity): number {
        const subject = this.subject();
        const cri = (subject) ? subject.xparam(REBasics.xparams.cri) : 1.0;

        return this._data.critical
            ? cri * (1 - target.xparam(REBasics.xparams.cev))
            : 0;
    }

    // Game_Action.prototype.lukEffectRate
    public lukEffectRate(target: LEntity): number {
        const subject = this.subject();
        const subject_luk = subject ? subject.actualParam(REBasics.params.luk) : 0.0;
        const target_luk = target.actualParam(REBasics.params.luk);
        return Math.max(1.0 + (subject_luk - target_luk) * 0.001, 0.0);
    }
}

export interface SSubEffect {
    subTargetKey: DSubEffectTargetKey;
    effect: SEffect;
}

// 攻撃側
export class SEffectorFact {
    private _subject: LEntity;
    private _subjectEffects: DEffectSet;
    private _subjectBattlerBehavior: LBattlerBehavior | undefined;

    // 適用側 (攻撃側) の関係者。
    // 攻撃発動Unit だけではなく、装備品(武器・防具・装飾品)、合成印など、ダメージ計算式やバフに影響するすべての Entity。
    //
    // 矢弾や魔法弾を打った場合、その Projectile Entity も effectors に含まれる。
    // なお、魔法反射や吹き飛ばし移動は Command 側で処理する。EffectContext はあくまでパラメータの変化に関係する処理のみを行う。
    private _effectors: LEntity[] = [];

    // 以下、Behavior 持ち回りで編集される要素
    //private _subjectActualParams: number[];
    private _effects: SEffect[] = [];
    private _subEffects: SSubEffect[] = [];
    private _selfModifier: SEffectModifier;
    private _incidentType: SEffectIncidentType;
    private _incidentEntityKind: DEntityKindId; // 効果の発生元がアイテムの場合はその種類
    private _item: LEntity | undefined;

    private _direction: number;

    private _genericEffectRate: number;

    public constructor(subject: LEntity, effects: DEffectSet, incidentType: SEffectIncidentType, dir: number) {
        this._subject = subject;
        this._subjectEffects = effects;
        this._subjectBattlerBehavior = subject.findEntityBehavior(LBattlerBehavior);
        this._incidentType = incidentType;
        this._incidentEntityKind = 0;
        this._direction = dir;
        this._genericEffectRate = 1.0;

        for (const i of effects.effects) {
            this._effects.push(new SEffect(this, i));
        }
        for (const i of effects.subEffects) {
            const e = new SEffect(this, i.effect);
            this._subEffects.push({
                subTargetKey: i.key,
                effect: e,
            });
        }
        this._selfModifier = new SEffectModifier(subject, effects.selfEffect.qualifyings);
        
        this._subject.iterateBehaviors2(b => {
            b.onCollectEffector(this._subject, this);
            return true;
        });
    }

    public withIncidentEntityKind(value: DEntityKindId): this {
        this._incidentEntityKind = value;

        // この種類を扱うのは得意？
        if (this._incidentEntityKind > 0) {
            this._genericEffectRate = this._subject.traitsPi(REBasics.traits.EffectProficiency, this._incidentEntityKind);
        }
        else {
            this._incidentEntityKind = 1.0;
        }

        return this;
    }

    public withItem(item: LEntity): this {
        this._item = item;
        return this;
    }

    public subject(): LEntity {
        return this._subject;
    }

    public subjectBehavior(): LBattlerBehavior | undefined {
        return this._subjectBattlerBehavior;
    }

    public subEffects(): SSubEffect[] {
        return this._subEffects;
    }

    public incidentType(): SEffectIncidentType {
        return this._incidentType;
    }

    public incidentEntityKind(): DEntityKindId {
        return this._incidentEntityKind;
    }

    public item(): LEntity | undefined {
        return this._item;
    }

    public direction(): number {
        return this._direction;
    }

    public selfModifier(): SEffectModifier {
        return this._selfModifier;
    }

    //--------------------
    // onCollectEffector から使うもの

    public addEffector(entity: LEntity) {
        this._effectors.push(entity);
    }

    //--------------------
    // apply から使うもの

    public genericEffectRate(): number {
        return this._genericEffectRate;
    }

    public selectEffect(entity: LEntity): SEffect {
        for (let i = this._effects.length - 1; i >= 0; i--) {
            const data = this._effects[i].data();
            if (UEffect.meetsCondition(entity, data)) {
                return this._effects[i];
            }
        }
        throw new Error("Unreachable.");
    }
}



export enum SParameterEffectApplyType {
    None,
    Damage,
    Recover,
}

// DParameterEffect とよく似ているが、こちらは動的なデータとして扱うものの集合。
// 例えば通常の武器は isDrain=falseでも、回復印が付いていたら isDrain=true にするなど、
// 関連する情報を統合した最終的な Effect として作り上げるために使う。
export class SParameterEffect {
    paramId: DParameterId;
    qualifying: DParameterQualifying;
    
    elementId: number;  // (Index of DSystem.elements)

    formula: string;

    /** IDataSkill.damage.type  */
    applyType: SParameterEffectApplyType;

    isDrain: boolean;

    /** 分散度 */
    variance: number;

    fixedDamage: number | undefined;

    private _valid: boolean;

    public constructor(data: DParameterQualifying) {
        this.qualifying = data;
        switch (data.applyType) {
            case DParameterEffectApplyType.Damage:
                this.applyType = SParameterEffectApplyType.Damage;
                this.isDrain = false;
                break;
            case DParameterEffectApplyType.Recover:
                this.applyType = SParameterEffectApplyType.Recover;
                this.isDrain = false;
                break;
            case DParameterEffectApplyType.Drain:
                this.applyType = SParameterEffectApplyType.Damage;
                this.isDrain = true;
                break;
            default:
                throw new Error();
        }
        this.paramId = data.parameterId;
        this.elementId = data.elementId;
        this.formula = data.formula;
        this.variance = data.variance;
        this._valid = true;
    }

    isRecover(): boolean {
        return this.applyType == SParameterEffectApplyType.Recover;
    }

    public isValid(): boolean {
        return this._valid;
    }

    public evalConditions(target: LEntity): void {
        if (target.params().hasParam(this.paramId)) {
            this._valid = this.meetsConditions(target);
        }
        else {
            this._valid = false;
        }
    }

    public meetsConditions(target: LEntity): boolean {
        if (this.qualifying.conditionFormula) {
            const a = RESystem.formulaOperandA as any;
            a.wrap(target);
            try {
                const r = eval(this.qualifying.conditionFormula);
                return r;
            }
            catch (e) {
                console.error(e);
                return false;
            }
        }
        else {
            return true;
        }
    }
}



export class SEffectModifier {
    private _data: DQualifyings;
    private _parameterEffects2: SParameterEffect[];

    public constructor(subject: LEntity, q: DQualifyings) {
        this._data = q;


        // subject の現在値を初期パラメータとする。
        // 装備品 Behavior はここへ値を加算したりする。
        //this._subjectActualParams = [];
        this._parameterEffects2 = [];
        for (const p of q.parameterQualifyings) {
            const paramEffect = new SParameterEffect(p);
            this._parameterEffects2.push(paramEffect);

            // Check fixed damage.
            const trait = subject.traitsWithId(REBasics.traits.FixedDamage, p.parameterId).backOrUndefined();
            if (trait) {
                paramEffect.fixedDamage = trait.value;
            }
        }

        // for (let i = 0; i < REData.parameters.length; i++) {
        //     //this._subjectActualParams[i] = this._subjectBattlerBehavior ? this._subjectBattlerBehavior.actualParam(i) : 0;
        //     this._parameterEffects[i] = undefined;
        // }

        // // Effect 展開
        // q.parameterQualifyings.forEach(x => {
        //     this._parameterEffects[x.parameterId] = new SParameterEffect(x);
        // });
    }
    
    // public parameterEffect(paramId: DParameterId): SParameterEffect | undefined {
    //     return this._parameterEffects[paramId];
    // }
    
    public hasParamDamage(): boolean {
        //return this._parameterEffects.findIndex(x => x && x.applyType != SParameterEffectApplyType.None) >= 0;
        return this._parameterEffects2.findIndex(x => x && x.applyType != SParameterEffectApplyType.None) >= 0;
    }

    public parameterEffects2(): readonly SParameterEffect[] {
        return this._parameterEffects2;
    }
    
    public otherEffectQualifyings(): DOtherEffectQualifying[] {
        return this._data.otherEffectQualifyings;
    }

    public effectBehaviors(): DEffectBehaviorId[] {
        return this._data.effectBehaviors;
    }
 
     public specialEffectQualifyings(): IDataEffect[] {
         return this._data.specialEffectQualifyings;
     }

     public buffQualifying(): DParamBuff[] {
        return this._data.buffQualifying;
    }
}

/**
 * 成否判定後、実際にパラメータやステートに変化を与える
 */
export class SEffectApplyer {
    private _effect: SEffect;
    private _rand: LRandom;

    public constructor(effect: SEffect, rand: LRandom) {
        this._effect = effect;
        this._rand = rand;
    }

    public apply(cctx: SCommandContext, modifier: SEffectModifier, target: LEntity): void {
        const result =  target._effectResult;
        
        for (const paramEffect of modifier.parameterEffects2()) {
            paramEffect.evalConditions(target);
        }
    
        // Damage
        //for (let i = 0; i < REData.parameters.length; i++) {
            //const pe = modifier.parameterEffect(i);
        for (const pe of modifier.parameterEffects2())
            if (pe && pe.applyType != SParameterEffectApplyType.None) {
                if (pe.isValid()) {
                    const value = this.makeDamageValue(pe, target, result.critical);
                    this.executeDamage(pe, target, value, result);
                }
            }
       // }

        // Effect
        for (const effect of modifier.specialEffectQualifyings()) {
            this.applyItemEffect(cctx, target, effect, result);
        }
        for (const buff of modifier.buffQualifying()) {
            target.addBuff(buff);
        }
        for (const effect of modifier.otherEffectQualifyings()) {
            this.applyOtherEffect(cctx, target, effect, result);
        }
        for (const id of modifier.effectBehaviors()) {
            const b = RESystem.effectBehaviorManager.get(id);
            b.onApplyTargetEffect(cctx, id, this._effect.fact().subject(), modifier, target);
        }
        this.applyItemUserEffect(target);
    }

    
    // Game_Action.prototype.makeDamageValue
    private makeDamageValue(paramEffect: SParameterEffect, target: LEntity, critical: boolean): number {
        // Check fixed damage
        if (!paramEffect.isRecover() && paramEffect.fixedDamage) {
            return paramEffect.fixedDamage;
        }


        const baseValue = this.evalDamageFormula(paramEffect, target);
        let value = baseValue * this.calcElementRate(paramEffect, target);
        if (this._effect.isPhysical()) {
            value *= target.sparam(REBasics.sparams.pdr);
        }
        if (this._effect.isMagical()) {
            value *= target.sparam(REBasics.sparams.mdr);
        }
        if (baseValue < 0) {
            value *= target.sparam(REBasics.sparams.rec);
        }
        if (critical) {
            value = this.applyCritical(value);
        }
        value = this.applyVariance(value, paramEffect.variance);
        value = this.applyGuard(value, target);
        value = this.applyProficiency(value);
        value = Math.round(value);
        return value;
    }

    // Game_Action.prototype.evalDamageFormula
    private evalDamageFormula(paramEffect: SParameterEffect, target: LEntity): number {
        try {
            // const a = this._effect.subject(); // eslint-disable-line no-unused-vars
            // const b = target; // eslint-disable-line no-unused-vars
            // const c = this._effect.fact().item(); // eslint-disable-line no-unused-vars

            const a = RESystem.formulaOperandA;
            const b = RESystem.formulaOperandB;
            const c = RESystem.formulaOperandC;
            a.wrap(this._effect.subject());
            b.wrap(target);
            c.wrap(this._effect.fact().item());


            // UnitTest から実行される場合に備えて undefined チェック
            const v = (typeof $gameVariables == "undefined") ? undefined : $gameVariables._data; // eslint-disable-line no-unused-vars
            const sign = paramEffect.isRecover() ? -1 : 1;
            let value = Math.max(eval(paramEffect.formula), 0);// * sign;
            value = Math.max(value, 1); // 最低1にしてみる
            value *= sign;

            // if (paramEffect.isRecover()) {

            // }
            // else {

            // }

            return isNaN(value) ? 0 : value;
        } catch (e) {
            return 0;
        }
    }
    
    // Game_Action.prototype.calcElementRate
    private calcElementRate(paramEffect: SParameterEffect, target: LEntity): number {
        if (paramEffect.elementId < 0) {
            const subjectBehavior = this._effect.subject();
            const attackElements = subjectBehavior ? subjectBehavior.attackElements() : [];
            return this.elementsMaxRate(target, attackElements);
        } else {
            return target.elementRate(paramEffect.elementId);
        }
    }
    
    // Game_Action.prototype.elementsMaxRate
    private elementsMaxRate(target: LEntity, elements: number[]): number {
        if (elements.length > 0) {
            const rates = elements.map(elementId => target.elementRate(elementId));
            return Math.max(...rates);
        } else {
            return 1;
        }
    }
    
    // Game_Action.prototype.applyCritical
    private applyCritical(damage: number): number {
        return damage * 3;
    }
    
    // Game_Action.prototype.applyVariance
    private applyVariance(damage: number, variance: number): number {
        const amp = Math.floor(Math.max((Math.abs(damage) * variance) / 100, 0));
        const v = this._rand.nextIntWithMax(amp + 1) + this._rand.nextIntWithMax(amp + 1) - amp;
        return damage >= 0 ? damage + v : damage - v;
    }
    
    // Game_Action.prototype.applyGuard
    private applyGuard(damage: number, target: LEntity): number {
        //const targetBehavior = this._effectorFact();
        const isGuard = false;//(targetBehavior) ? targetBehavior.isGuard() : false;
        // TODO: guard

        return damage / (damage > 0 && isGuard ? 2 * target.sparam(REBasics.sparams.grd) : 1);
    }

    private applyProficiency(damage: number): number {
        return damage * this._effect.fact().genericEffectRate();
    }
    
    
    // Game_Action.prototype.executeDamage
    // Game_Action.prototype.executeHpDamage
    private executeDamage(paramEffect: SParameterEffect, target: LEntity, value: number, result: LEffectResult): void {
        //const b = target.findBehavior(LBattlerBehavior);
        //assert(b);

        //b.gainActualParam(DBasics.params.hp, -value);



        if (value === 0) {
            result.critical = false;
        }

        if (paramEffect.isDrain) {
            value = Math.min(target.actualParam(paramEffect.paramId), value);
        }
        result.makeSuccess();

        if (!paramEffect.qualifying.silent) {
            const paramResult = new LParamEffectResult(paramEffect.paramId, paramEffect.qualifying);
            paramResult.damage = value;
            paramResult.drain = paramEffect.isDrain;
            result.paramEffects2.push(paramResult);
        }

        if (paramEffect.qualifying.applyTarget == DParameterApplyTarget.Current) {

            target.gainActualParam(paramEffect.paramId, -value);
            if (value > 0) {
                // TODO:
                //target.onDamage(value);
            }
            this.gainDrainedParam(paramEffect, value);
        }
        else if (paramEffect.qualifying.applyTarget == DParameterApplyTarget.Maximum) {
            target.params().params()[paramEffect.paramId]?.gainIdealParamPlus(-value);
        }
        else {
            throw new Error("Not implemented.");
        }


        //console.log("damage", paramEffect.paramId, value);
        if (paramEffect.paramId == REBasics.params.hp) {
            result.hpAffected = true;
        }
    }
    
    // Game_Action.prototype.gainDrainedHp
    public gainDrainedParam(paramEffect: SParameterEffect, value: number): void {
        if (paramEffect.isDrain) {
            let gainTarget = this._effect.subject();
            // TODO:
            //if (this._reflectionTarget) {
            //    gainTarget = this._reflectionTarget;
            //}
            if (gainTarget) {
                gainTarget.gainActualParam(paramEffect.paramId, value);
            }
        }
    }

    // Game_Action.prototype.applyItemEffect
    public applyItemEffect(cctx: SCommandContext, target: LEntity, effect: IDataEffect, result: LEffectResult): void {
        switch (effect.code) {
            case DItemEffect.EFFECT_RECOVER_HP:
                throw new Error("Not implemented.");
                //this.itemEffectRecoverHp(target, effect);
                break;
            case DItemEffect.EFFECT_RECOVER_MP:
                throw new Error("Not implemented.");
                //this.itemEffectRecoverMp(target, effect);
                break;
            case DItemEffect.EFFECT_GAIN_TP:
                throw new Error("Not implemented.");
                //this.itemEffectGainTp(target, effect);
                break;
            case DItemEffect.EFFECT_ADD_STATE:
                this.itemEffectAddState(target, effect, result);
                break;
            case DItemEffect.EFFECT_REMOVE_STATE:
                throw new Error("Not implemented.");
                //this.itemEffectRemoveState(target, effect);
                break;
            case DItemEffect.EFFECT_ADD_BUFF:
                throw new Error("Not implemented.");
                //this.itemEffectAddBuff(target, effect);
                break;
            case DItemEffect.EFFECT_ADD_DEBUFF:
                throw new Error("Not implemented.");
                //this.itemEffectAddDebuff(target, effect);
                break;
            case DItemEffect.EFFECT_REMOVE_BUFF:
                throw new Error("Not implemented.");
                //this.itemEffectRemoveBuff(target, effect);
                break;
            case DItemEffect.EFFECT_REMOVE_DEBUFF:
                throw new Error("Not implemented.");
                //this.itemEffectRemoveDebuff(target, effect);
                break;
            case DItemEffect.EFFECT_SPECIAL:
                this.itemEffectSpecial(cctx, target, effect, result);
                break;
            case DItemEffect.EFFECT_GROW:
                throw new Error("Not implemented.");
                //this.itemEffectGrow(target, effect);
                break;
            case DItemEffect.EFFECT_LEARN_SKILL:
                throw new Error("Not implemented.");
                //this.itemEffectLearnSkill(target, effect);
                break;
            case DItemEffect.EFFECT_COMMON_EVENT:
                throw new Error("Not implemented.");
                //this.itemEffectCommonEvent(target, effect);
                break;
        }
    }
    
    // Game_Action.prototype.applyItemEffect
    public applyOtherEffect(cctx: SCommandContext, targetEntity: LEntity, effect: DOtherEffectQualifying, result: LEffectResult): void {
        switch (effect.key) {
            case "kSystemEffect_ふきとばし":
                const subject = this._effect.subject();
                LProjectableBehavior.startMoveAsProjectile(cctx, targetEntity, new SEffectSubject(subject), this._effect.fact().direction(), 10);
                break;
            case "kSystemEffect_変化":
                const entityData = cctx.random().select(USpawner.getEnemiesFromSpawnTable(targetEntity.floorId));
                //const entityData = REData.getEntity("kキュアリーフ");
                targetEntity.setupInstance(entityData.id);
                REGame.scheduler.resetEntity(targetEntity);
                break;
            case "kSystemEffect_脱出":
                cctx.postSequel(targetEntity, REBasics.sequels.escape);
                UTransfer.exitLand(cctx, targetEntity, LandExitResult.Escape);
                break;
            case "kSystemEffect_識別":
                UIdentify.identify(cctx, targetEntity, true);
                break;
            default:
                throw new Error("Not implemented.");
        }
    }
    
    // Game_Action.prototype.applyItemUserEffect
    private applyItemUserEffect(target: LEntity): void {
        // TODO:
        //const value = Math.floor(this.item().tpGain * this.subject().tcr);
        //this.subject().gainSilentTp(value);
    }

    // Game_Action.prototype.itemEffectAddState
    private itemEffectAddState(target: LEntity, effect: IDataEffect, result: LEffectResult): void {
        if (effect.dataId === 0) {
            // ID=0 は "通常攻撃" という特殊な状態付加となる。
            // RESystem としては処理不要。
        } else {
            this.itemEffectAddNormalState(target, effect, result);
        }
    }

    // Game_Action.prototype.itemEffectAddNormalState
    private itemEffectAddNormalState(target: LEntity, effect: IDataEffect, result: LEffectResult): void {
        let chance = effect.value1;
        if (!this._effect.isCertainHit()) {
            chance *= target.stateRate(effect.dataId);
            chance *= this._effect.lukEffectRate(target);
        }

        if (this._rand.nextIntWithMax(100) < (chance * 100)) {
            target.addState(effect.dataId);
            target.refreshConditions();
            result.makeSuccess();
        }
    }
    
    // Game_Action.prototype.itemEffectSpecial
    private itemEffectSpecial(cctx: SCommandContext, target: LEntity, effect: IDataEffect, result: LEffectResult) {
        if (effect.dataId === DItemEffect.SPECIAL_EFFECT_ESCAPE) {
            cctx.postDestroy(target);
            result.makeSuccess();
        }
    }
}

