import { assert } from "ts/Common";
import { DEffect, DEffectHitType, DEffectScope, DParameterEffectApplyType } from "ts/data/DSkill";
import { ParameterEffectType } from "ts/data/DSystem";
import { DParameterId, REData } from "ts/data/REData";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RESystem } from "./RESystem";
import { SEffectResult } from "./SEffectResult";


enum SParameterEffectApplyType {
    None,
    Damage,
    Recover,
}

// 追加能力値。加算で計算する。
enum DXParameter {
    // HIT rate
    hit = 0,

    // EVAsion rate
    eva = 1,

    // CRItical rate
    cri = 2,

    // Critical EVasion rate
    cev = 3,

    // Magic EVasion rate
    mev = 4,

    // Magic ReFlection rate
    mrf = 5,

    // CouNTer attack rate
    cnt = 6,

    // Hp ReGeneration rate
    hrg = 7,

    // Mp ReGeneration rate
    mrg = 8,

    // Tp ReGeneration rate
    trg = 9,
}

// 特殊能力値。乗算で計算する。
enum DSParameter {
    // TarGet Rate
    tgr = 0,

    // GuaRD effect rate
    grd = 1,

    // RECovery effect rate
    rec = 2,

    // PHArmacology
    pha = 3,

    // Mp Cost Rate
    mcr = 4,

    // Tp Charge Rate
    tcr = 5,

    // Physical Damage Rate
    pdr = 6,

    // Magic Damage Rate
    mdr = 7,

    // Floor Damage Rate
    fdr = 8,

    // EXperience Rate
    exr = 9,
}

// DParameterEffect とよく似ているが、こちらは動的なデータとして扱うものの集合。
// 例えば通常の武器は isDrain=falseでも、回復印が付いていたら isDrain=true にするなど、
// 関連する情報を統合した最終的な Effect として作り上げるために使う。
interface SParameterEffect {
    
    elementId: number;  // (Index of DSystem.elements)

    formula: string;

    /** IDataSkill.damage.type  */
    applyType: SParameterEffectApplyType;

    isDrain: boolean;

    /** 分散度 */
    variance: number;
}

// 攻撃側
export class SEffectorFact {
    private _context: REEffectContext;
    private _subject: REGame_Entity;
    private _subjectEffect: DEffect;
    private _subjectBattlerBehavior: LBattlerBehavior;

    // 適用側 (攻撃側) の関係者。
    // 攻撃発動Unit だけではなく、装備品(武器・防具・装飾品)、合成印など、ダメージ計算式やバフに影響するすべての Entity。
    //
    // 矢弾や魔法弾を打った場合、その Projectile Entity も effectors に含まれる。
    // なお、魔法反射や吹き飛ばし移動は Command 側で処理する。EffectContext はあくまでパラメータの変化に関係する処理のみを行う。
    private _effectors: REGame_Entity[] = [];

    // 以下、Behavior 持ち回りで編集される要素
    private _actualParams: number[];
    private _parameterEffects: SParameterEffect[];  // Index of DParameterDataId
    private _hitType: DEffectHitType;
    private _successRate: number;       // 0~100

    public constructor(context: REEffectContext, subject: REGame_Entity, effect: DEffect) {
        this._context = context;
        this._subject = subject;
        this._subjectEffect = effect;
        this._subjectBattlerBehavior = subject.getBehavior(LBattlerBehavior);

        // subject の現在値を初期パラメータとする。
        // 装備品 Behavior はここへ値を加算したりする。
        this._actualParams = [];
        this._parameterEffects = [];
        for (let i = 0; i < REData.parameters.length; i++) {
            this._actualParams[i] = this._subjectBattlerBehavior.actualParam(i);
            this._parameterEffects[i] = {
                elementId: 0,
                formula: "",
                applyType: SParameterEffectApplyType.None,
                isDrain: false,
                variance: 0,
            };
        }

        this._hitType = effect.hitType;
        this._successRate = effect.successRate;

        // Effect 展開
        this._subjectEffect.parameterEffects.forEach(x => {
            const d = this._parameterEffects[x.parameterId];
            if (x.applyType != DParameterEffectApplyType.None) {
                switch (x.applyType) {
                    case DParameterEffectApplyType.Damage:
                        d.applyType = SParameterEffectApplyType.Damage;
                        d.isDrain = false;
                        break;
                    case DParameterEffectApplyType.Recover:
                        d.applyType = SParameterEffectApplyType.Recover;
                        d.isDrain = false;
                        break;
                    case DParameterEffectApplyType.Drain:
                        d.applyType = SParameterEffectApplyType.Damage;
                        d.isDrain = true;
                        break;
                    default:
                        throw new Error();
                }
                d.elementId = x.elementId;
                d.formula = x.formula;
                d.variance = x.variance;
            }
        });
        
        this._subject.basicBehaviors().forEach(x => {
            x.onCollectEffector(this._subject, this);
        });
    }

    public subject(): REGame_Entity {
        return this._subject;
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
    public hitRate(): number {
        const successRate = this._successRate;
        if (this.isPhysical()) {
            return successRate * 0.01 * this.subject().hit;
        } else {
            return successRate * 0.01;
        }
    }

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

    
    private _targetEntity: REGame_Entity;
    private _targetBattlerBehavior: LBattlerBehavior;

    // 実際の攻撃対象選択ではなく、戦闘不能を有効対象とするか、などを判断するために参照する。
    private _scope: DEffectScope = 0;

    constructor(subject: REGame_Entity, scope: DEffectScope, effect: DEffect, target: REGame_Entity) {
        this._effectorFact = new SEffectorFact(this, subject, effect);
        this._scope = scope;
        this._targetEntity = target;
        this._targetBattlerBehavior = target.getBehavior(LBattlerBehavior);
    }
    
    // Game_Action.prototype.apply
    apply(target: REGame_Entity): SEffectResult {
        


        const result = target._effectResult;
        result.clear();

        result.used = this.testApply(this._targetBattlerBehavior);
        result.missed = result.used && Math.random() >= this.itemHit(target);
        result.evaded = false;
        result.physical = true;
        result.drain = true;
        result.critical = false;
        result.success = true;
        result.hpAffected = true;
        result.success = true;
        const value = 10;
        this.executeDamage(target, value, result);

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
    
Game_Action.prototype.checkDamageType = function(list) {
    return list.includes(this.item().damage.type);
};

Game_Action.prototype.isHpEffect = function() {
    return this.checkDamageType([1, 3, 5]);
};

Game_Action.prototype.isMpEffect = function() {
    return this.checkDamageType([2, 4, 6]);
};

Game_Action.prototype.isDamage = function() {
    return this.checkDamageType([1, 2]);
};

Game_Action.prototype.isRecover = function() {
    return this.checkDamageType([3, 4]);
};

Game_Action.prototype.isDrain = function() {
    return this.checkDamageType([5, 6]);
};

Game_Action.prototype.isHpRecover = function() {
    return this.checkDamageType([3]);
};

Game_Action.prototype.isMpRecover = function() {
    return this.checkDamageType([4]);
};

    // Game_Action.prototype.executeDamage
    private executeDamage(target: REGame_Entity, value: number, result: SEffectResult): void {
        const b = target.findBehavior(LBattlerBehavior);
        assert(b);

        b.gainActualParam(RESystem.parameters.hp, -value);


    }

    // Game_Action.prototype.makeDamageValue
    /*
    makeDamageValue(target: LBattlerBehavior, critical: boolean) {
        const item = this.item();
        const baseValue = this.evalDamageFormula(target);
        let value = baseValue * this.calcElementRate(target);
        if (this.isPhysical()) {
            value *= target.pdr;
        }
        if (this.isMagical()) {
            value *= target.mdr;
        }
        if (baseValue < 0) {
            value *= target.rec;
        }
        if (critical) {
            value = this.applyCritical(value);
        }
        value = this.applyVariance(value, item.damage.variance);
        value = this.applyGuard(value, target);
        value = Math.round(value);
        return value;
    }
    */
}
