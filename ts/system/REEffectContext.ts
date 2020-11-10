import { ParameterEffectType } from "ts/data/DSystem";
import { ParameterDataId } from "ts/data/REData";
import { REGame_Entity } from "ts/RE/REGame_Entity";


// 攻撃側
export class SEffectorFact {
    _subject: REGame_Entity;
    _participants: REGame_Entity[] = [];


    constructor(subject: REGame_Entity) {
        this._subject = subject;

        this._subject.basicBehaviors().forEach(x => {
            x.onCollectEffector(this);
        });
    }

    addParticipant(entity: REGame_Entity) {
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
 */
export class REEffectContext {
    // 適用側 (攻撃側) の関係者。
    // 攻撃発動Unit だけではなく、装備品(武器・防具・装飾品)、合成印など、ダメージ計算式やバフに影響するすべての Entity。
    //
    // 矢弾や魔法弾を打った場合、その Projectile Entity も effectors に含まれる。
    // なお、魔法反射や吹き飛ばし移動は Command 側で処理する。EffectContext はあくまでパラメータの変化に関係する処理のみを行う。
    private _effectors: REGame_Entity[] = [];

    // 経験値など、報酬に関わるフィードバックを得る人。
    // 基本は effectors と同じだが、反射や投げ返しを行ったときは経験値を得る人が変わるため、その対応のために必要となる。
    private _awarder: REGame_Entity[] = [];

    // 被適用側 (防御側) の関係者。AttackCommand を受け取ったときなど、ダメージ計算したい直前に構築する。
    // effectors と同じく、装備品なども含まれる。（サビなど修正値ダウンしたり、ひびが入ったり、燃えたりといった処理のため）
    private _effectees: REGame_Entity[] = [];

    
    

    buildEffectors() {

    }

}

export class REffectResult {
    private _parameterValues: number[] = [];    // REData.parameters の要素数分の配列。それぞれのパラメータをどれだけ変動させるか。負値はダメージ。
}

