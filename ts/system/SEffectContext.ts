import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DItemEffect } from "ts/data/DItemEffect";
import { REData } from "ts/data/REData";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { LEntity } from "ts/objects/LEntity";
import { Helpers } from "./Helpers";
import { LEffectResult, LParamEffectResult } from "../objects/LEffectResult";
import { DParameterId } from "ts/data/DParameter";
import { LEnemyBehavior } from "ts/objects/behaviors/LEnemyBehavior";
import { SCommandContext } from "./SCommandContext";
import { REGame } from "ts/objects/REGame";
import { STextManager } from "./STextManager";
import { DTraits } from "ts/data/DTraits";
import { DEmittor, DEffectHitType, DRmmzEffectScope, DParameterEffectApplyType, DParameterQualifying, DOtherEffectQualifying, DEffect } from "ts/data/DEffect";
import { UAction } from "../usecases/UAction";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { USpawner } from "ts/usecases/USpawner";


enum SParameterEffectApplyType {
    None,
    Damage,
    Recover,
}

export enum SEffectIncidentType {
    /** 直接攻撃 (ヤリなど、隣接していない場合もあり得る) */
    DirectAttack,

    /** 間接攻撃 (矢など) */
    IndirectAttack,
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

    public constructor(data: DParameterQualifying) {
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

export class SEffectSubject {
    private _entity: LEntity;

    constructor(entity: LEntity) {
        this._entity = entity;
    }

    public entity(): LEntity {
        return this._entity;
    }
}

// 攻撃側
export class SEffectorFact {
    private _subject: LEntity;
    private _subjectEffect: DEffect;
    private _subjectBattlerBehavior: LBattlerBehavior | undefined;

    // 適用側 (攻撃側) の関係者。
    // 攻撃発動Unit だけではなく、装備品(武器・防具・装飾品)、合成印など、ダメージ計算式やバフに影響するすべての Entity。
    //
    // 矢弾や魔法弾を打った場合、その Projectile Entity も effectors に含まれる。
    // なお、魔法反射や吹き飛ばし移動は Command 側で処理する。EffectContext はあくまでパラメータの変化に関係する処理のみを行う。
    private _effectors: LEntity[] = [];

    // 以下、Behavior 持ち回りで編集される要素
    //private _subjectActualParams: number[];
    private _parameterEffects: (SParameterEffect | undefined)[];  // Index of DParameterDataId
    private _hitType: DEffectHitType;
    private _successRate: number;       // 0~100
    private _incidentType: SEffectIncidentType;

    private _direction: number;

    public constructor(subject: LEntity, effect: DEffect, incidentType: SEffectIncidentType, dir: number) {
        this._subject = subject;
        this._subjectEffect = effect;
        this._subjectBattlerBehavior = subject.findBehavior(LBattlerBehavior);
        this._incidentType = incidentType;
        this._direction = dir;

        // subject の現在値を初期パラメータとする。
        // 装備品 Behavior はここへ値を加算したりする。
        //this._subjectActualParams = [];
        this._parameterEffects = [];
        for (let i = 0; i < REData.parameters.length; i++) {
            //this._subjectActualParams[i] = this._subjectBattlerBehavior ? this._subjectBattlerBehavior.actualParam(i) : 0;
            this._parameterEffects[i] = undefined;
        }

        this._hitType = effect.hitType;
        this._successRate = effect.successRate;

        // Effect 展開
        this._subjectEffect.parameterQualifyings.forEach(x => {
            this._parameterEffects[x.parameterId] = new SParameterEffect(x);
        });
        
        this._subject.basicBehaviors().forEach(x => {
            x.onCollectEffector(this._subject, this);
        });
    }

    public subject(): LEntity {
        return this._subject;
    }

    public subjectBehavior(): LBattlerBehavior | undefined {
        return this._subjectBattlerBehavior;
    }

    public subjectEffect(): DEffect {
        return this._subjectEffect;
    }

    public incidentType(): SEffectIncidentType {
        return this._incidentType;
    }

    public direction(): number {
        return this._direction;
    }

    //--------------------
    // onCollectEffector から使うもの

    public addEffector(entity: LEntity) {
        this._effectors.push(entity);
    }

    //--------------------
    // apply から使うもの

   // public actualParams(paramId: DParameterId): number {
    //    return this._subjectActualParams[paramId];
    //}

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
            //console.log("successRate", successRate);
            //console.log("subjectBehavior", subjectBehavior);
            //console.log("hit", hit);
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
        const subject_luk = subjectBehavior ? subjectBehavior.actualParam(DBasics.params.luk) : 0.0;
        const target_luk = target.actualParam(DBasics.params.luk);
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
export class SEffectContext {

    private _effectorFact: SEffectorFact;

    // 経験値など、報酬に関わるフィードバックを得る人。
    // 基本は effectors と同じだが、反射や投げ返しを行ったときは経験値を得る人が変わるため、その対応のために必要となる。
    //private _awarder: LEntity[] = [];

    // 被適用側 (防御側) の関係者。AttackCommand を受け取ったときなど、ダメージ計算したい直前に構築する。
    // effectors と同じく、装備品なども含まれる。（サビなど修正値ダウンしたり、ひびが入ったり、燃えたりといった処理のため）
    //private _effectees: LEntity[] = [];

    
    //private _targetEntity: REGame_Entity;
    //private _targetBattlerBehavior: LBattlerBehavior;


    constructor(subject: SEffectorFact) {
        this._effectorFact = subject;
    }

    public effectorFact(): SEffectorFact {
        return this._effectorFact;
    }

    public applyWithWorth(commandContext: SCommandContext, targets: LEntity[]): void {
        let deadCount = 0;
        let totalExp = 0;
        for (const target of targets) {
            const result = this.apply(commandContext, target);
            
            result.showResultMessages(commandContext, target);

            const battler = target.findBehavior(LBattlerBehavior);
            if (battler) {  // apply() で changeInstance() することがあるので、getBehavior ではなく findBehavior でチェック
                if (battler.isDead()) {
                    deadCount++;
                    if (battler instanceof LEnemyBehavior) {
                        totalExp += battler.exp();
                    }
                }
            }
        }
        

        if (deadCount > 0) {
            const awarder = this._effectorFact.subjectBehavior();
            if (awarder) {
                awarder.gainExp(totalExp)
            }
        }
    }
    
    // Game_Action.prototype.apply
    private apply(commandContext: SCommandContext, target: LEntity): LEffectResult {
        const targetBattlerBehavior = target.findBehavior(LBattlerBehavior);
        const result = target._effectResult;
        result.clear();

        if (targetBattlerBehavior) {

            result.used = this.testApply(targetBattlerBehavior);


            // 命中判定
            this.judgeHits(targetBattlerBehavior, result);
            
            result.physical = this._effectorFact.isPhysical();

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
                for (const effect of this._effectorFact.subjectEffect().specialEffectQualifyings) {
                    this.applyItemEffect(targetBattlerBehavior, effect, result);
                }
                for (const effect of this._effectorFact.subjectEffect().otherEffectQualifyings) {
                    this.applyOtherEffect(commandContext, target, targetBattlerBehavior, effect, result);
                }
                this.applyItemUserEffect(targetBattlerBehavior);
            }
            //this.updateLastTarget(target);
        }
        else {
            assert(0);
        }


        const focusedEntity = REGame.camera.focusedEntity();
        const friendlySubject = focusedEntity ? Helpers.isFriend(this._effectorFact.subject(), focusedEntity) : false;
        if (friendlySubject) {  // subject は味方
            result.focusedFriendly = Helpers.isFriend(this._effectorFact.subject(), target);
        }
        else { // subject は味方以外 (敵・NPC)
            result.focusedFriendly = true;  // 敵 vs 敵のときは、味方用のメッセージを表示したい ("ダメージを受けた！")
        }

        return result;
    }

    private judgeHits(target: LBattlerBehavior, result: LEffectResult): void {
        const subject = this._effectorFact.subjectBehavior();

        if (subject) {
            if (this._effectorFact.incidentType() == SEffectIncidentType.DirectAttack) {
                if (subject.traits(DTraits.CertainDirectAttack).length > 0) {
                    // 直接攻撃必中
                    result.missed = false;
                    result.evaded = false;
                    return;
                }
            }
        }
        else {
            // 罠Entityなど。
        }

        const hitRate = this._effectorFact.hitRate();       // 攻撃側命中率
        const evaRate = this._effectorFact.evaRate(target); // 受け側回避率

        result.missed = result.used && Math.random() >= hitRate;
        result.evaded = !result.missed && Math.random() < evaRate;
    }

    
    // Game_Action.prototype.testApply
    private testApply(target: LBattlerBehavior): boolean {
        // NOTE: コアスクリプトではバトル中かどうかで成否判定が変わったりするが、
        // 本システムでは常に戦闘中のようにふるまう。
        return this.testLifeAndDeath(target);
    };

    // Game_Action.prototype.testLifeAndDeath
    private testLifeAndDeath(targetBattlerBehavior: LBattlerBehavior): boolean {
        /*
        const itemScope = this._effectorFact.rmmzEffectScope()
        if (UAction.isForOpponent(itemScope) || UAction.isForAliveFriend(itemScope)) {
            return targetBattlerBehavior.isAlive();
        } else if (UAction.isForDeadFriend(itemScope)) {
            return targetBattlerBehavior.isDead();
        } else {
            return true;
        }
        */
        return true;
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
            // UnitTest から実行される場合に備えて undefined チェック
            const v = (typeof $gameVariables == "undefined") ? undefined : $gameVariables._data; // eslint-disable-line no-unused-vars
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
        const v = Helpers.randomInt(amp + 1) + Helpers.randomInt(amp + 1) - amp;
        return damage >= 0 ? damage + v : damage - v;
    };
    
    // Game_Action.prototype.applyGuard
    private applyGuard(damage: number, target: LBattlerBehavior): number {
        return damage / (damage > 0 && target.isGuard() ? 2 * target.sparam(DBasics.sparams.grd) : 1);
    };




    

    // Game_Action.prototype.executeDamage
    // Game_Action.prototype.executeHpDamage
    private executeDamage(paramEffect: SParameterEffect, target: LBattlerBehavior, value: number, result: LEffectResult): void {
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

        const paramResult = new LParamEffectResult();
        paramResult.damage = value;
        paramResult.drain = paramEffect.isDrain;
        result.paramEffects[paramEffect.paramId] = paramResult;

        target.gainActualParam(paramEffect.paramId, -value);
        if (value > 0) {
            // TODO:
            //target.onDamage(value);
        }
        this.gainDrainedParam(paramEffect, value);

        //console.log("damage", paramEffect.paramId, value);
        if (paramEffect.paramId == DBasics.params.hp) {
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
    public applyItemEffect(target: LBattlerBehavior, effect: IDataEffect, result: LEffectResult): void {
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
    
    // Game_Action.prototype.applyItemEffect
    public applyOtherEffect(commandContext: SCommandContext, targetEntity: LEntity, target: LBattlerBehavior, effect: DOtherEffectQualifying, result: LEffectResult): void {
        switch (effect.key) {
            case "kSystemEffect_ふきとばし":
                const subject = this._effectorFact.subject();
                LProjectableBehavior.startMoveAsProjectile(commandContext, targetEntity, new SEffectSubject(subject), this._effectorFact.direction(), 10);
                break;
            case "kSystemEffect_変化":
                const entityData = commandContext.random().select(USpawner.getEnemiesFromSpawnTable(targetEntity.floorId));
                //const entityData = REData.getEntity("kキュアリーフ");
                targetEntity.setupInstance(entityData.id);
                break;
            default:
                throw new Error("Not implemented.");
        }
    }
    
    // Game_Action.prototype.applyItemUserEffect
    private applyItemUserEffect(target: LBattlerBehavior): void {
        // TODO:
        //const value = Math.floor(this.item().tpGain * this.subject().tcr);
        //this.subject().gainSilentTp(value);
    }

    // Game_Action.prototype.itemEffectAddState
    private itemEffectAddState(target: LBattlerBehavior, effect: IDataEffect, result: LEffectResult): void {
        if (effect.dataId === 0) {
            // ID=0 は "通常攻撃" という特殊な状態付加となる。
            // RESystem としては処理不要。
        } else {
            this.itemEffectAddNormalState(target, effect, result);
        }
    }

    // Game_Action.prototype.itemEffectAddNormalState
    private itemEffectAddNormalState(target: LBattlerBehavior, effect: IDataEffect, result: LEffectResult): void {
        let chance = effect.value1;
        if (!this._effectorFact.isCertainHit()) {
            chance *= target.stateRate(effect.dataId);
            chance *= this._effectorFact.lukEffectRate(target);
        }
        if (Math.random() < chance) {
            target.ownerEntity().addState(effect.dataId);
            result.makeSuccess();
        }
    }
}
