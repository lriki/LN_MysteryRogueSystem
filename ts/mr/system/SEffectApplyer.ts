import { MRBasics } from "../data/MRBasics";
import { DSpecificEffectId, DEntityKindId, DSkillId, DSubComponentEffectTargetKey, DAttackElementId, DParameterId } from "../data/DCommon";
import { DEffect, DEffectHitType, DEffectSet, DOtherEffectQualifying, DParamBuff, DValuePoint, DParameterEffectApplyType, DParameterQualifying, DSpecialEffectRef } from "../data/DEffect";
import { DItemEffect } from "../data/DItemEffect";
import { LandExitResult, MRData } from "../data/MRData";
import { LProjectileBehavior } from "../lively/behaviors/activities/LProjectileBehavior";
import { LBattlerBehavior } from "../lively/behaviors/LBattlerBehavior";
import { LEffectResult, LParamEffectResult } from "../lively/LEffectResult";
import { LEntity } from "../lively/LEntity";
import { LRandom } from "../lively/LRandom";
import { UIdentify } from "../utility/UIdentify";
import { UTransfer } from "../utility/UTransfer";
import { MRSystem } from "./MRSystem";
import { SCommandContext } from "./SCommandContext";
import { SEffectIncidentType, SEffectSubject } from "./SEffectContext";
import { paramThrowingDistance } from "../PluginParameters";
import { UState } from "../utility/UState";
import { DStateId } from "../data/DState";
import { assert } from "../Common";



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

        this._targetModifier = new SEffectModifier(fact.subject(), effect);
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
            const hit = (subject) ? subject.xparamOrDefault(MRBasics.xparams.hit, 1.0) : 1.0;
            return successRate * 0.01 * hit;
        } else {
            return successRate * 0.01;
        }
    }

    // Game_Action.prototype.itemEva
    public evaRate(target: LEntity): number {
        if (this.isPhysical()) {
            return target.xparam(MRBasics.xparams.eva);
        } else if (this.isMagical()) {
            return target.xparam(MRBasics.xparams.mev);
        } else {
            return 0;
        }
    }

    // Game_Action.prototype.itemCri
    public criRate(target: LEntity): number {
        const subject = this.subject();
        const cri = (subject) ? subject.xparam(MRBasics.xparams.cri) : 1.0;

        return this._data.critical
            ? cri * (1 - target.xparam(MRBasics.xparams.cev))
            : 0;
    }

    // Game_Action.prototype.lukEffectRate
    public lukEffectRate(target: LEntity): number {
        const subject = this.subject();
        const subject_luk = subject ? subject.getActualParam(MRBasics.params.luk) : 0.0;
        const target_luk = target.getActualParam(MRBasics.params.luk);
        return Math.max(1.0 + (subject_luk - target_luk) * 0.001, 0.0);
    }
}

export interface SSubEffect {
    subTargetKey: DSubComponentEffectTargetKey;
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
    private _succeededSelfModifier: SEffectModifier | undefined;
    private _incidentType: SEffectIncidentType;
    private _incidentEntityKind: DEntityKindId; // 効果の発生元がアイテムの場合はその種類
    private _item: LEntity | undefined;

    private _sourceSkill: DSkillId | undefined;

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

        for (const i of effects.effects()) {
            this._effects.push(new SEffect(this, i));
        }
        // for (const i of effects.subEffects) {
        //     const e = new SEffect(this, i.effect);
        //     this._subEffects.push({
        //         subTargetKey: i.key,
        //         effect: e,
        //     });
        // }
        this._selfModifier = new SEffectModifier(subject, effects.selfEffect);
        if (effects.succeededSelfEffect) {
            this._succeededSelfModifier = new SEffectModifier(subject, effects.succeededSelfEffect);
        }
        
        this._subject.iterateBehaviors2(b => {
            b.onCollectEffector(this._subject, this);
            return true;
        });
    }

    public withIncidentEntityKind(value: DEntityKindId): this {
        this._incidentEntityKind = value;

        // この種類を扱うのは得意？
        if (this._incidentEntityKind > 0) {
            this._genericEffectRate = this._subject.traitsPi(MRBasics.traits.EffectProficiency, this._incidentEntityKind);
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

    public withSkill(skill: DSkillId): this {
        this._sourceSkill = skill;
        return this;
    }

    public subject(): LEntity {
        return this._subject;
    }

    public subjectBehavior(): LBattlerBehavior | undefined {
        return this._subjectBattlerBehavior;
    }

    public effectSet(): DEffectSet {
        return this._subjectEffects;
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

    public sourceSkill(): DSkillId | undefined {
        return this._sourceSkill;
    }

    public direction(): number {
        return this._direction;
    }

    public selfModifier(): SEffectModifier {
        return this._selfModifier;
    }

    public succeededSelfModifier(): SEffectModifier | undefined {
        return this._succeededSelfModifier;
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

    public effects(): readonly SEffect[] {
        return this._effects;
    }

    // public selectEffect(entity: LEntity): SEffect {
    //     for (let i = this._effects.length - 1; i >= 0; i--) {
    //         const data = this._effects[i].data();
    //         if (UEffect.meetsCondition(entity, data)) {
    //             return this._effects[i];
    //         }
    //     }
    //     throw new Error("Unreachable.");
    // }
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
    
    elementIds: DAttackElementId[];

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
        this.paramId = data._parameterId;
        this.elementIds = data.elementIds;
        assert(this.elementIds.length > 0);
        this.formula = data.formula;
        this.variance = data.variance;
        this._valid = true;
    }

    isRecover(): boolean {
        return this.applyType == SParameterEffectApplyType.Recover;
    }

    public  get isValid(): boolean {
        return this._valid;
    }

    public set isValid(value: boolean) {
        this._valid = value;
    }

    public evalConditions(target: LEntity): void {
        if (this.qualifying.fallback) {
            this._valid = false;
        }
        else if (target.params.hasParam(this.paramId)) {
            this._valid = this.meetsConditions(target);
        }
        else {
            this._valid = false;
        }
    }

    private meetsConditions(target: LEntity): boolean {
        if (this.qualifying.conditionFormula) {
            const a = MRSystem.formulaOperandA as any;
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
    private _data: DEffect;
    private _parameterEffects2: SParameterEffect[];

    public constructor(subject: LEntity, q: DEffect) {
        this._data = q;


        // subject の現在値を初期パラメータとする。
        // 装備品 Behavior はここへ値を加算したりする。
        //this._subjectActualParams = [];
        this._parameterEffects2 = [];
        for (const p of q.parameterQualifyings) {
            const paramEffect = new SParameterEffect(p);
            this._parameterEffects2.push(paramEffect);

            // Check fixed damage.
            const trait = subject.traitsWithId(MRBasics.traits.FixedDamage, p._parameterId).backOrUndefined();
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

    public effectBehaviors(): DSpecialEffectRef[] {
        return this._data.effectBehaviors;
    }
 
     public specialEffectQualifyings(): IDataEffect[] {
         return this._data.rmmzSpecialEffectQualifyings;
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

        const sourceSkillId = this._effect.fact().sourceSkill();
        if (sourceSkillId) {
            if (target.traitsWithId(MRBasics.traits.SkillGuard, sourceSkillId).length > 0) {
                return;
            }
        }
        
        // 条件に一致する or 条件を持たない Param 効果をアクティブにする
        let fallback = true;
        for (const paramEffect of modifier.parameterEffects2()) {
            paramEffect.evalConditions(target);
            if (paramEffect.isValid) {
                fallback = false;
            }
        }
        if (fallback) {
            // アクティブなものが１つも無いときは fallback を実行
            const p = modifier.parameterEffects2().find(x => x.qualifying.fallback);
            if (p) p.isValid = true;
        }
    
        // Damage
        //for (let i = 0; i < REData.parameters.length; i++) {
            //const pe = modifier.parameterEffect(i);
        for (const paramEffect of modifier.parameterEffects2())
            if (paramEffect && paramEffect.applyType != SParameterEffectApplyType.None) {
                if (paramEffect.isValid) {
                    if (paramEffect.paramId != 0) {
                        const value = this.makeDamageValue(paramEffect, target, result.critical);
                        this.executeDamage(paramEffect, target, value, result);
                    }
                }

                // applyDeathVulnerable
                // Item に対して致死爆発を適用するときなど、 Param を持っていない者に対しても処理したいので、isValid は考慮しない。
                for (const elementId of paramEffect.elementIds) {
                    for (const trait of target.traitsWithId(MRBasics.traits.DeathVulnerableElement, elementId)) {
                        this.addState(target, trait.value, result);
                    }
                }
            }
       // }

        // Effect
        for (const effect of modifier.specialEffectQualifyings()) {
            this.applyItemEffect(cctx, target, effect, result);
        }
        for (const buff of modifier.buffQualifying()) {
            target.addBuff(buff);
            result.makeSuccess();
        }
        for (const effect of modifier.otherEffectQualifyings()) {
            this.applyOtherEffect(cctx, target, effect, result);
        }
        for (const effect of modifier.effectBehaviors()) {
            const b = MRSystem.effectBehaviorManager.get(effect.specialEffectId);
            b.onApplyTargetEffect(cctx, effect, this._effect.fact().subject(),  this._effect.fact().item(), modifier, target, target._effectResult);
        }
        this.applyItemUserEffect(target);

        
        
        target.refreshConditions();

        // 効果適用後の値は refresh() 後でとらないと、min-max clamp されていない。
        for (const paramResult of result.paramEffects2) {
            paramResult.newValue = target.getActualParam(paramResult.paramId);
        }
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
            value *= target.sparam(MRBasics.sparams.pdr);
        }
        if (this._effect.isMagical()) {
            value *= target.sparam(MRBasics.sparams.mdr);
        }
        if (baseValue < 0) {
            value *= this.elemetedRecoverRate(target, paramEffect);
        }
        if (baseValue < 0) {
            value *= target.sparam(MRBasics.sparams.rec);
        }
        if (critical) {
            value = this.applyCritical(value);
        }
        value = this.applyVariance(value, paramEffect.variance);
        value = this.applyGuard(value, target);
        value = this.applyProficiency(value);
        value = this.applyDamageRate(value, paramEffect.paramId, target);
        value = this.applyRaceRate(value, target);
        value = Math.round(value);
        return value;
    }

    private elemetedRecoverRate(target: LEntity, paramEffect: SParameterEffect): number {
        // traitsSum だと、デフォルト値が 0.0 になるため、全ての Battler にひとつの ElementedRecoveryRate を持たせておかないと回復ができなくなる。
        // 命中率と同じではあるが、ちょっとそれは面倒すぎる。

        let rate = 1.0;
        for (const elementId of paramEffect.elementIds) {
            rate *= target.traitsPi(MRBasics.traits.ElementedRecoveryRate, elementId);
        }
        return rate;
    }

    // Game_Action.prototype.evalDamageFormula
    private evalDamageFormula(paramEffect: SParameterEffect, target: LEntity): number {
        try {
            // const a = this._effect.subject(); // eslint-disable-line no-unused-vars
            // const b = target; // eslint-disable-line no-unused-vars
            // const c = this._effect.fact().item(); // eslint-disable-line no-unused-vars

            const a = MRSystem.formulaOperandA;
            const b = MRSystem.formulaOperandB;
            const c = MRSystem.formulaOperandC;
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
        let rate = 1.0;
        for (const elementId of paramEffect.elementIds) {
            if (elementId < 0) {
                const subjectBehavior = this._effect.subject();
                const attackElements = subjectBehavior ? subjectBehavior.attackElements() : [];
                rate *= this.elementsMaxRate(target, attackElements);
            } else {
                rate *= target.elementRate(elementId);
            }
        }
        return rate;
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

        return damage / (damage > 0 && isGuard ? 2 * target.sparam(MRBasics.sparams.grd) : 1);
    }

    private applyProficiency(damage: number): number {
        return damage * this._effect.fact().genericEffectRate();
    }
    
    private applyDamageRate(damage: number, paramId: DParameterId, target: LEntity): number {
        if (damage > 0) {
            return damage * target.traitsPi(MRBasics.traits.ParamDamageRate, paramId)
        }
        // else if (damage < 0) {
        //     target.traitsPi(REBasics.traits.RecoverRate);
        // }
        else {
            return damage;
        }
    }
    
    private getRacePointRate(count: number): number {
        // 最初の印は等倍。以降は 0.1 倍。
        // 原作ではかなり細かく設定されているが、ひとまずはこの仕様で。
        // http://shiren2.lsx3.com/?%B0%F5
        if (count == 0) return 1.0;
        return 0.1;
    }

    private applyRaceRate(damage: number, target: LEntity): number {
        const traits = this._effect.subject().traits(MRBasics.traits.RaceRate);
        if (traits.length > 0) {
            const points: { value: number, count: number }[] = [];

            // value (特効倍率) の大きい順にソートする
            traits.sort((a, b) => {
                return a.value - b.value;
            });

            // Race ごとに、特効割合を計算する
            for (const t of traits) {
                if (points[t.dataId] === undefined) {
                    points[t.dataId] = {
                        value: 0,
                        count: 0,
                    };
                }
                const p = points[t.dataId];
                p.value += t.value * this.getRacePointRate(p.count);    // 印の重ね掛けに対する割合調整
                p.count++;
            }

            // 対象が持つ Race に特効割合を加算していく
            let rate = 0;
            let count = 0;
            for (const raceId of target.queryRaceIds()) {
                if (points[raceId] !== undefined) {
                    rate += points[raceId].value;
                    count++;
                }
            }
            if (count > 0) {
                return rate * damage;
            }
        }
        return damage;
    }

    // Game_Action.prototype.executeDamage
    // Game_Action.prototype.executeHpDamage
    private executeDamage(paramEffect: SParameterEffect, target: LEntity, value: number, result: LEffectResult): void {
        //const b = target.findBehavior(LBattlerBehavior);
        //assert(b);

        //b.gainActualParam(DBasics.params.hp, -value);

        const oldValue = target.getActualParam(paramEffect.paramId);

        if (value === 0) {
            result.critical = false;
        }

        if (paramEffect.isDrain) {
            value = Math.min(oldValue, value);
        }
        result.makeSuccess();

        if (paramEffect.qualifying.applyTarget == DValuePoint.Current) {

            target.gainActualParam(paramEffect.paramId, -value, false);
            if (value > 0) {
                // TODO:
                //target.onDamage(value);
                this.removeStatesByDamage(target, paramEffect.paramId);
            }
            this.gainDrainedParam(paramEffect, value);
        }
        else if (paramEffect.qualifying.applyTarget == DValuePoint.Growth) {
            target.params.params()[paramEffect.paramId]?.gainEffortValue(-value);
        }
        else {
            throw new Error("Not implemented.");
        }

        if (!paramEffect.qualifying.silent) {
            const paramResult = new LParamEffectResult(paramEffect.paramId);
            paramResult.applyTarget = paramEffect.qualifying.applyTarget;
            paramResult.damage = value;
            paramResult.oldValue = oldValue;
            //paramResult.newValue = target.actualParam(paramEffect.paramId);
            paramResult.drain = paramEffect.isDrain;
            result.paramEffects2.push(paramResult);
        }


        //console.log("damage", paramEffect.paramId, value);
        if (paramEffect.paramId == MRBasics.params.hp) {
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
                gainTarget.gainActualParam(paramEffect.paramId, value, false);
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
                this.itemEffectRemoveState(target, effect, result);
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
                LProjectileBehavior.startMoveAsProjectile(cctx, targetEntity, new SEffectSubject(subject), this._effect.fact().direction(), paramThrowingDistance);
                break;
            case "kSystemEffect_脱出":
                cctx.postSequel(targetEntity, MRBasics.sequels.escape);
                UTransfer.exitLand(cctx, targetEntity, LandExitResult.Escape);
                break;
            case "kSystemEffect_識別":
                UIdentify.identify(cctx, targetEntity, true);
                break;
            default:
                throw new Error("Not implemented.");
        }
    }

    // public applyDeathVulnerable(): void {

    // }
    
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
        const stateData = MRData.states[effect.dataId];

        // そもそもステート無効化を持っている場合は追加自体行わない。
        // RMMZ標準では、一度追加した後の refresh で remove している。
        // ただこれだと makeSuccess() が動いてしまうので、いらないメッセージが出てしまう。
        const stateAddable = target.isStateAddable(effect.dataId);
        if (!stateAddable) return;

        if (!UState.meetsApplyConditions(stateData, target)) {
            return;
        }

        let chance = effect.value1;
        if (!this._effect.isCertainHit()) {
            chance *= target.stateRate(effect.dataId);
            chance *= this._effect.lukEffectRate(target);
        }

        if (this._rand.nextIntWithMax(100) < (chance * 100)) {
            this.addState(target, effect.dataId, result);
        }
    }

    private addState(target: LEntity, stateId: DStateId, result: LEffectResult) {
        target.addState(stateId);
        result.makeSuccess();

        const stateData = MRData.states[stateId];
        if (stateData.deadState) {
            result.clearParamEffects();
        }
    }

    private removeStatesByDamage(target: LEntity, paramId: DParameterId) {
        const removeStates: DStateId[] = [];
        target.iterateStates(s => {
            const data = s.stateData();
            for (const r of data.effect.damageRemovels) {
                if (r.paramId == paramId &&
                    this._rand.nextIntWithMax(100) < r.chance) {
                    removeStates.push(s.stateDataId());
                }
            }
        });
        target.removeStates(removeStates);
    }

    // Game_Action.prototype.itemEffectRemoveState 
    private itemEffectRemoveState(target: LEntity, effect: IDataEffect, result: LEffectResult) {
        let chance = effect.value1;
        if (this._rand.nextIntWithMax(100) < (chance * 100)) {
            target.removeState(effect.dataId);
            result.makeSuccess();
        }
    };

    // Game_Action.prototype.itemEffectSpecial
    private itemEffectSpecial(cctx: SCommandContext, target: LEntity, effect: IDataEffect, result: LEffectResult) {
        if (effect.dataId === DItemEffect.SPECIAL_EFFECT_ESCAPE) {
            cctx.postDestroy(target);
            result.makeSuccess();
        }
    }
}

