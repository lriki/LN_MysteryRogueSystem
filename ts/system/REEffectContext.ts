import { assert } from "ts/Common";
import { DEffect } from "ts/data/DSkill";
import { ParameterEffectType } from "ts/data/DSystem";
import { ParameterDataId, REData } from "ts/data/REData";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RESystem } from "./RESystem";
import { SActionResult } from "./SActionResult";


// 攻撃側
export class SEffectorFact {
    _subject: REGame_Entity;
    _effect: DEffect;
    _participants: REGame_Entity[] = [];
    _actualParams: number[] = [];


    constructor(subject: REGame_Entity, effect: DEffect) {
        this._subject = subject;
        this._effect = effect;

        this._subject.basicBehaviors().forEach(x => {
            x.onCollectEffector(this._subject, this);
        });
    }

    setActualParam(paramId: ParameterDataId, value: number): void {
        this._actualParams[paramId] = value;
    }

    actualParams(paramId: ParameterDataId): number {
        return this._actualParams[paramId];
    }

    addParticipant(entity: REGame_Entity) {
        assert(entity != this._subject);
        this._participants.push(entity);
    }

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
    addParameterEffect(paramId: ParameterDataId, elementId: number, type: ParameterEffectType, variance: number, critical: boolean) {
        
    }

}

// ターゲット側
export class SEffecteeResult {

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
    // 適用側 (攻撃側) の関係者。
    // 攻撃発動Unit だけではなく、装備品(武器・防具・装飾品)、合成印など、ダメージ計算式やバフに影響するすべての Entity。
    //
    // 矢弾や魔法弾を打った場合、その Projectile Entity も effectors に含まれる。
    // なお、魔法反射や吹き飛ばし移動は Command 側で処理する。EffectContext はあくまでパラメータの変化に関係する処理のみを行う。
    private _effectors: SEffectorFact[] = [];

    // 経験値など、報酬に関わるフィードバックを得る人。
    // 基本は effectors と同じだが、反射や投げ返しを行ったときは経験値を得る人が変わるため、その対応のために必要となる。
    private _awarder: REGame_Entity[] = [];

    // 被適用側 (防御側) の関係者。AttackCommand を受け取ったときなど、ダメージ計算したい直前に構築する。
    // effectors と同じく、装備品なども含まれる。（サビなど修正値ダウンしたり、ひびが入ったり、燃えたりといった処理のため）
    private _effectees: REGame_Entity[] = [];

    
    addEffector(effector: SEffectorFact) {
        this._effectors.push(effector);
    }
    
    // Game_Action.prototype.apply
    apply(target: REGame_Entity): SActionResult {
        const result = new SActionResult();

        const value = 10000;
        this.executeDamage(target, value);

        return result;
    }

    // Game_Action.prototype.executeDamage
    private executeDamage(target: REGame_Entity, value: number): void {
        const b = target.findBehavior(LBattlerBehavior);
        assert(b);

        b.gainActualParam(RESystem.parameters.hp, -value);

    };
}

export class REffectResult {
    private _parameterValues: number[] = [];    // REData.parameters の要素数分の配列。それぞれのパラメータをどれだけ変動させるか。負値はダメージ。
}

