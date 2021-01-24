import { BatchDrawCall } from "pixi.js";
import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DItemEffect } from "ts/data/DItemEffect";
import { DEffect, DEffectHitType, DEffectScope, DParameterEffect, DParameterEffectApplyType } from "ts/data/DSkill";
import { ParameterEffectType } from "ts/data/DSystem";
import { DParameterId, REData } from "ts/data/REData";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RESystem } from "./RESystem";
import { SEffectResult, SParamEffectResult } from "./SEffectResult";


enum SParameterEffectApplyType {
    None,
    Damage,
    Recover,
}



// DParameterEffect とよく似ているが、こちらは動的なデータとして扱うものの集合。
// 例えば通常の武器は isDrain=falseでも、回復印が付いていたら isDrain=true にするなど、
// 関連する情報を統合した最終的な Effect として作り上げるために使う。
export class SParameterEffect {
    paramId: DParameterId;
    
    elementId: number;  // (Index of DSystem.elements)

    formula: string;

    /** IDataSkill.damage.type  */
    applyType: SParameterEffectApplyType;

    isDrain: boolean;

    /** 分散度 */
    variance: number;

    public constructor(data: DParameterEffect) {
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
    }

    isRecover(): boolean {
        return this.applyType == SParameterEffectApplyType.Recover;
    }
}

// 攻撃側
export class SEffectorFact {
    private _context: REEffectContext;
    private _subject: REGame_Entity;
    private _subjectEffect: DEffect;
    private _subjectBattlerBehavior: LBattlerBehavior | undefined;

    // 適用側 (攻撃側) の関係者。
    // 攻撃発動Unit だけではなく、装備品(武器・防具・装飾品)、合成印など、ダメージ計算式やバフに影響するすべての Entity。
    //
    // 矢弾や魔法弾を打った場合、その Projectile Entity も effectors に含まれる。
    // なお、魔法反射や吹き飛ばし移動は Command 側で処理する。EffectContext はあくまでパラメータの変化に関係する処理のみを行う。
    private _effectors: REGame_Entity[] = [];

    // 以下、Behavior 持ち回りで編集される要素
    private _actualParams: number[];
    private _parameterEffects: (SParameterEffect | undefined)[];  // Index of DParameterDataId
    private _hitType: DEffectHitType;
    private _successRate: number;       // 0~100

    public constructor(context: REEffectContext, subject: REGame_Entity, effect: DEffect) {
        this._context = context;
        this._subject = subject;
        this._subjectEffect = effect;
        this._subjectBattlerBehavior = subject.findBehavior(LBattlerBehavior);

        // subject の現在値を初期パラメータとする。
        // 装備品 Behavior はここへ値を加算したりする。
        this._actualParams = [];
        this._parameterEffects = [];
        for (let i = 0; i < REData.parameters.length; i++) {
            this._actualParams[i] = this._subjectBattlerBehavior ? this._subjectBattlerBehavior.actualParam(i) : 0;
            this._parameterEffects[i] = undefined;
        }

        this._hitType = effect.hitType;
        this._successRate = effect.successRate;

        // Effect 展開
        this._subjectEffect.parameterEffects.forEach(x => {
            this._parameterEffects[x.parameterId] = new SParameterEffect(x);
        });
        
        this._subject.basicBehaviors().forEach(x => {
            x.onCollectEffector(this._subject, this);
        });
    }

    public subject(): REGame_Entity {
        return this._subject;
    }

    public subjectBehavior(): LBattlerBehavior | undefined {
        return this._subjectBattlerBehavior;
    }

    public subjectEffect(): DEffect {
        return this._subjectEffect;
    }


    //--------------------
    // onCollectEffector から使うもの

    public addEffector(entity: REGame_Entity) {
        this._effectors.push(entity);
    }

    //--------------------
    // apply から使うもの

    public actualParams(paramId: DParameterId): number {
        return this._actualParams[paramId];
    }

    public parameterEffect(paramId: DParameterId): SParameterEffect | undefined {
        return this._parameterEffects[paramId];
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

    public hasParamDamage(): boolean {
        return this._parameterEffects.findIndex(x => x && x.applyType != SParameterEffectApplyType.None) >= 0;
    }

    // 0.0~1.0
    // クラスの特徴などで [追加能力値:命中+x] が無いと 0 になり全く命中しなくなる。
    // Game_Action.prototype.itemHit
    public hitRate(): number {
        const successRate = this._successRate;
        if (this.isPhysical()) {
            const subjectBehavior = this.subjectBehavior();
            const hit = (subjectBehavior) ? subjectBehavior.xparam(DBasics.xparams.hit) : 1.0;
            return successRate * 0.01 * hit;
        } else {
            return successRate * 0.01;
        }
    }

    // Game_Action.prototype.itemEva
    public evaRate(target: LBattlerBehavior): number {
        if (this.isPhysical()) {
            return target.xparam(DBasics.xparams.eva);
        } else if (this.isMagical()) {
            return target.xparam(DBasics.xparams.mev);
        } else {
            return 0;
        }
    }

    // Game_Action.prototype.itemCri
    public criRate(target: LBattlerBehavior): number {
        const subjectBehavior = this.subjectBehavior();
        const cri = (subjectBehavior) ? subjectBehavior.xparam(DBasics.xparams.cri) : 1.0;

        return this._subjectEffect.critical
            ? cri * (1 - target.xparam(DBasics.xparams.cev))
            : 0;
    };

    // Game_Action.prototype.lukEffectRate
    public lukEffectRate(target: LBattlerBehavior): number {
        const subjectBehavior = this.subjectBehavior();
        const subject_luk = subjectBehavior ? subjectBehavior.actualParam(RESystem.parameters.luk) : 0.0;
        const target_luk = target.actualParam(RESystem.parameters.luk);
        return Math.max(1.0 + (subject_luk - target_luk) * 0.001, 0.0);
    };

    /*
    public hasAnyValidParameterEffects(): boolean {
        let count = 0;
        for (let i = 0; i < REData.parameters.length; i++) {
            const e = this._parameterEffects[i];
            if (e.applyType != SParameterEffectApplyType.None) {

            }
        }

    }
    */

    /**
     * 
     * @param paramId 
     * @param elementId Index of DSystem.elements
     * @param critical 
     * 
     * 複数のパラメータへのダメージを同時に指定することはできるが、
     * ひとつのパラメータへ複数の element や type を使ってダメージを指定することはできない。
     * 
     * critical は、ターゲットへヒットしたときにクリティカル判定を行うかどうか。
     * 前方3方向など複数攻撃対象がいるばあいは個別にクリティカルが発生することになる。
     * 攻撃の発生元での会心判定は Action として行うこと。
     */
    addParameterEffect(paramId: DParameterId, elementId: number, type: ParameterEffectType, variance: number, critical: boolean) {
        
    }

}


/**
 * ダメージや状態異常、バフの適用など、パラメータ操作に関わる一連の処理を行う。
 * 
 * - インスタンスは1度のコマンドチェーンで複数個作られることもある。(3方向同時攻撃など)
 *   複数対象への攻撃中、途中でパラメータ変動を伴うフィードバックを受ける可能性もあるため、
 *   複数のダメージ適用でひとつのインスタンスを使いまわすのは禁止。
 *   また LLVM の Pass のように、関係者で REEffectContext を持ちまわって加工しながら Effect を積んでいく使い方になるが、
 *   状態異常をダメージに変換するようなエネミーを設計するときには Effector 側が積んだ Effect を変更することになる。
 *   そのためインスタンスは別にしないと、同時攻撃で他の攻撃対象に影響が出てしまうことがある。
 * - インスタンスは Command に乗せて持ち回り、コマンドチェーン内で必ず Apply する。外には出ない。(そうしないと Attr に保存するような事態になるので)
 * 
 * 戦闘不能について
 * ----------
 * ツクールの仕様にできるだけ寄せてみる。ツクールの仕様は…
 * - 戦闘不能ステートID は Game_Battler.deathStateId() で取得 (1)
 * - Game_Battler.refresh() で、HP が 0 であれば deathState が追加される。
 * - Game_BattlerBase.addNewState() で、で、deathState が追加されたら die() が呼ばれ HP 0 になる。
 * - Game_Battler.removeState() で、deathState が取り除かれたら revivie() が呼ばれ HP 1 になる。
 * - refresh() はダメージ適用や装備変更など様々なタイミングで呼び出される。
 *   - Game_Action.apply() > executeHpDamage() > Game_Battler.gainHp() > setHp() > refresh() 等。
 * 
 * 
 * 
 * [2020/11/11] 複数ターゲットへの攻撃をひとつの EffectContext にまとめるべき？
 * ----------
 * 分けた場合、1つの対象への処理が終わったすぐ後に、フィードバックの処理を始めることができる。
 * 例えば、3体まとめて攻撃するとき、1体目に攻撃したときに反撃をもらい倒れてしまったとき、後続を攻撃するか、といった具合。
 * …でもこのケースだと EffectContext の中で戦闘不能を判断できるか。やる・やらないは別として。
 * 
 * とにかく一度に複数対象へのダメージ適用を「中断」する可能性があるか？ということ。
 * そうかんがえると「ほとんど無い」
 * EffectContext 自体が複数対象へのダメージ適用をサポートしたとしても、
 * もしそのような中断がやりたければひとつずつインスタンス作って addTarget すればいいだけなので、まとめる方向で作ってよさそう。
 */
export class REEffectContext {

    private _effectorFact: SEffectorFact;

    // 経験値など、報酬に関わるフィードバックを得る人。
    // 基本は effectors と同じだが、反射や投げ返しを行ったときは経験値を得る人が変わるため、その対応のために必要となる。
    private _awarder: REGame_Entity[] = [];

    // 被適用側 (防御側) の関係者。AttackCommand を受け取ったときなど、ダメージ計算したい直前に構築する。
    // effectors と同じく、装備品なども含まれる。（サビなど修正値ダウンしたり、ひびが入ったり、燃えたりといった処理のため）
    private _effectees: REGame_Entity[] = [];

    
    //private _targetEntity: REGame_Entity;
    //private _targetBattlerBehavior: LBattlerBehavior;

    // 実際の攻撃対象選択ではなく、戦闘不能を有効対象とするか、などを判断するために参照する。
    private _scope: DEffectScope = 0;

    constructor(subject: REGame_Entity, scope: DEffectScope, effect: DEffect) {
        this._effectorFact = new SEffectorFact(this, subject, effect);
        this._scope = scope;
        //this._targetEntity = target;
        //this._targetBattlerBehavior = target.getBehavior(LBattlerBehavior);
    }
    
    // Game_Action.prototype.apply
    apply(target: REGame_Entity): SEffectResult {
        const targetBattlerBehavior = target.findBehavior(LBattlerBehavior);
        const result = target._effectResult;
        result.clear();

        if (targetBattlerBehavior) {
            result.used = this.testApply(targetBattlerBehavior);
            result.missed = result.used && Math.random() >= this._effectorFact.hitRate();
            result.evaded = !result.missed && Math.random() < this._effectorFact.evaRate(targetBattlerBehavior);
            result.physical = this._effectorFact.isPhysical();
            //result.hpAffected = true;
    
            if (result.isHit()) {
                if (this._effectorFact.hasParamDamage()) {
                    result.critical = Math.random() < this._effectorFact.criRate(targetBattlerBehavior);
                }
                
                // Damage
                for (let i = 0; i < REData.parameters.length; i++) {
                    const pe = this._effectorFact.parameterEffect(i);
                    if (pe && pe.applyType != SParameterEffectApplyType.None) {
                        const value = this.makeDamageValue(pe, targetBattlerBehavior, result.critical);
                        this.executeDamage(pe, targetBattlerBehavior, value, result);
                    }
                }
    
                // Effect
                for (const effect of this._effectorFact.subjectEffect().specialEffects) {
                    this.applyItemEffect(targetBattlerBehavior, effect, result);
                }
                this.applyItemUserEffect(targetBattlerBehavior);
            }
            //this.updateLastTarget(target);
        }
        else {
            assert(0);
        }

        return result;
    }

    
    // Game_Action.prototype.testApply
    private testApply(target: LBattlerBehavior): boolean {
        // NOTE: コアスクリプトではバトル中かどうかで成否判定が変わったりするが、
        // 本システムでは常に戦闘中のようにふるまう。
        return this.testLifeAndDeath(target);
    };

    // Game_Action.prototype.testLifeAndDeath
    private testLifeAndDeath(targetBattlerBehavior: LBattlerBehavior) {
        if (this.isForOpponent() || this.isForAliveFriend()) {
            return targetBattlerBehavior.isAlive();
        } else if (this.isForDeadFriend()) {
            return targetBattlerBehavior.isDead();
        } else {
            return true;
        }
    }
    
    // Game_Action.prototype.checkItemScope
    private checkItemScope(list: DEffectScope[]) {
        return list.includes(this._scope);
    };

    // Game_Action.prototype.isForOpponent
    private isForOpponent(): boolean {
        return this.checkItemScope([
            DEffectScope.Opponent_Single,
            DEffectScope.Opponent_All,
            DEffectScope.Opponent_Random_1,
            DEffectScope.Opponent_Random_2,
            DEffectScope.Opponent_Random_3,
            DEffectScope.Opponent_Random_4,
            DEffectScope.Everyone]);
    }

    // Game_Action.prototype.isForAliveFriend
    private isForAliveFriend(): boolean {
        return this.checkItemScope([
            DEffectScope.Friend_Single_Alive,
            DEffectScope.Friend_All_Alive,
            DEffectScope.User,
            DEffectScope.Everyone]);
    }

    // Game_Action.prototype.isForDeadFriend
    private isForDeadFriend(): boolean {
        return this.checkItemScope([
            DEffectScope.Friend_Single_Dead,
            DEffectScope.Friend_All_Dead]);
    }

    // Game_Action.prototype.makeDamageValue
    private makeDamageValue(paramEffect: SParameterEffect, target: LBattlerBehavior, critical: boolean): number {
        const baseValue = this.evalDamageFormula(paramEffect, target);
        let value = baseValue * this.calcElementRate(paramEffect, target);
        if (this._effectorFact.isPhysical()) {
            value *= target.sparam(DBasics.sparams.pdr);
        }
        if (this._effectorFact.isMagical()) {
            value *= target.sparam(DBasics.sparams.mdr);
        }
        if (baseValue < 0) {
            value *= target.sparam(DBasics.sparams.rec);
        }
        if (critical) {
            value = this.applyCritical(value);
        }
        value = this.applyVariance(value, paramEffect.variance);
        value = this.applyGuard(value, target);
        value = Math.round(value);
        return value;
    }

    // Game_Action.prototype.evalDamageFormula
    private evalDamageFormula(paramEffect: SParameterEffect, target: LBattlerBehavior): number {
        try {
            const a = this._effectorFact.subjectBehavior(); // eslint-disable-line no-unused-vars
            const b = target; // eslint-disable-line no-unused-vars
            const v = $gameVariables._data; // eslint-disable-line no-unused-vars
            const sign = paramEffect.isRecover() ? -1 : 1;
            const value = Math.max(eval(paramEffect.formula), 0) * sign;
            return isNaN(value) ? 0 : value;
        } catch (e) {
            return 0;
        }
    };
    
    // Game_Action.prototype.calcElementRate
    private calcElementRate(paramEffect: SParameterEffect, target: LBattlerBehavior): number {
        if (paramEffect.elementId < 0) {
            const subjectBehavior = this._effectorFact.subjectBehavior();
            const attackElements = subjectBehavior ? subjectBehavior.attackElements() : [];
            return this.elementsMaxRate(target, attackElements);
        } else {
            return target.elementRate(paramEffect.elementId);
        }
    };
    
    // Game_Action.prototype.elementsMaxRate
    private elementsMaxRate(target: LBattlerBehavior, elements: number[]): number {
        if (elements.length > 0) {
            const rates = elements.map(elementId => target.elementRate(elementId));
            return Math.max(...rates);
        } else {
            return 1;
        }
    };
    
    // Game_Action.prototype.applyCritical
    private applyCritical(damage: number): number {
        return damage * 3;
    };
    
    // Game_Action.prototype.applyVariance
    private applyVariance(damage: number, variance: number): number {
        const amp = Math.floor(Math.max((Math.abs(damage) * variance) / 100, 0));
        const v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
        return damage >= 0 ? damage + v : damage - v;
    };
    
    // Game_Action.prototype.applyGuard
    private applyGuard(damage: number, target: LBattlerBehavior): number {
        return damage / (damage > 0 && target.isGuard() ? 2 * target.sparam(DBasics.sparams.grd) : 1);
    };




    

    // Game_Action.prototype.executeDamage
    // Game_Action.prototype.executeHpDamage
    private executeDamage(paramEffect: SParameterEffect, target: LBattlerBehavior, value: number, result: SEffectResult): void {
        //const b = target.findBehavior(LBattlerBehavior);
        //assert(b);

        //b.gainActualParam(RESystem.parameters.hp, -value);


        if (value === 0) {
            result.critical = false;
        }

        if (paramEffect.isDrain) {
            value = Math.min(target.actualParam(paramEffect.paramId), value);
        }
        result.makeSuccess();

        const paramResult = new SParamEffectResult();
        paramResult.damag = value;
        paramResult.drain = paramEffect.isDrain;
        result.paramEffects[paramEffect.paramId] = paramResult;

        target.gainActualParam(paramEffect.paramId, -value);
        if (value > 0) {
            // TODO:
            //target.onDamage(value);
        }
        this.gainDrainedParam(paramEffect, value);

        //console.log("damage", paramEffect.paramId, value);
        if (paramEffect.paramId == RESystem.parameters.hp) {
            result.hpAffected = true;
        }
    }
    
    // Game_Action.prototype.gainDrainedHp
    public gainDrainedParam(paramEffect: SParameterEffect, value: number): void {
        if (paramEffect.isDrain) {
            let gainTarget = this._effectorFact.subjectBehavior();
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
    public applyItemEffect(target: LBattlerBehavior, effect: IDataEffect, result: SEffectResult): void {
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
                throw new Error("Not implemented.");
                //this.itemEffectSpecial(target, effect);
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
    
    // Game_Action.prototype.applyItemUserEffect
    private applyItemUserEffect(target: LBattlerBehavior): void {
        // TODO:
        //const value = Math.floor(this.item().tpGain * this.subject().tcr);
        //this.subject().gainSilentTp(value);
    }

    // Game_Action.prototype.itemEffectAddState
    private itemEffectAddState(target: LBattlerBehavior, effect: IDataEffect, result: SEffectResult): void {
        if (effect.dataId === 0) {
            // ID=0 は "通常攻撃" という特殊な状態付加となる。
            // RESystem としては処理不要。
        } else {
            this.itemEffectAddNormalState(target, effect, result);
        }
    }

    // Game_Action.prototype.itemEffectAddNormalState
    private itemEffectAddNormalState(target: LBattlerBehavior, effect: IDataEffect, result: SEffectResult): void {
        let chance = effect.value1;
        if (!this._effectorFact.isCertainHit()) {
            chance *= target.stateRate(effect.dataId);
            console.log("5555555555 dataId", effect.dataId);
            console.log("5555555555 chance1", chance);
            chance *= this._effectorFact.lukEffectRate(target);
            console.log("5555555555 chance2", chance);
        }
        if (Math.random() < chance) {
            target.ownerEntity().addState(effect.dataId);
            result.makeSuccess();
        }
    }
}
