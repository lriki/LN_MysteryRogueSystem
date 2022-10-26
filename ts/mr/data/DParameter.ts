import { DParameterId } from "./DCommon";
import { DValuePoint } from "./DEffect";
import { DFactionType } from "./DFaction";
import { DFlavorEffect, IFlavorEffectProps } from "./DFlavorEffect";

export type DXParamId = number;
export type DSParamId = number;

export enum DParameterType {
    Normal = 0,
    Dependent = 1,
}

export enum DParamMessageValueSource {
    Relative,
    Absolute,
}

export interface DParamMessage {
    condition: string;  // value=新しい値, old=古い値, min=最小値, max=最大値
    message: string;
}

export enum DValueAddition {
    /** 増減なし・効果なし */
    None = 0,

    /** 増加・回復 */
    Gain = 1,

    /** 減少・ダメージ */
    Loss = 2,
}

/**
 * 発動する FlavorEffect と、その発動条件のセット
 */
export class DParameterFlavorEffect {
    /** 発動条件となる対象勢力 */
    public looksFaction: DFactionType;

    /** 発動条件となる適用対象 */
    public point: DValuePoint;

    /** 発動条件となる値の増減 */
    public addition: DValueAddition;

    /** 発動条件式 (value=新しい値, old=古い値, min=最小値, max=最大値)。 undefined の場合は式を評価せず、true とみなす。 */
    public conditionFormula: string | undefined;

    /** 発動する効果 */
    public flavorEffect: DFlavorEffect;

    public constructor(options?: IParameterFlavorEffect) {
        options = options || { flavorEffect: {} };
        this.looksFaction = options.looksFaction ?? DFactionType.Neutral;
        this.point = options.point ?? DValuePoint.Current;
        this.addition = options.addition ?? DValueAddition.Gain;
        this.conditionFormula = options.conditionFormula;
        this.flavorEffect = new DFlavorEffect(options.flavorEffect);
    }
}

/**
 * Unit(Battler) が持つパラメータ
 * 
 * Property との違いは、戦闘ダメージなどに関係するものを集めたものである、という点。すべて number で表される。
 * 
 * 拡張パラメータ
 * ----------
 * 拡張パラメータはレベルアップに伴い成長することは '無い'。
 * 最低限必要なのは "満腹度"。
 * 
 * サバイバル的な拡張を想定すると、
 * - 水分
 * - 疲労度
 * 
 * あとこれらのターン経過による増減量を決めるためのパラメータ。
 * 
 * - ハラヘリ速度 (SParam) ※SParam は非ダメ側のパラメータと考えるのが良い。ターン経過で World から受ける満腹度へのダメージを抑える、と考える。
 * - HP 回復速度 (SParam)
 * 
 * 
 * [2022/9/2] SecondaryParameter
 * ----------
 * DependentParameter 検討中に見つかった問題解決。
 * DependentParameter は当初、DParameter とは別のデータ構造として作った。
 * しかし運用を始めた時に、2つの異なるデータとして分けなければならないのが面倒だと感じた。というより、間違えやすい。
 * 
 * 例えば
 * - 特定のパラメータに対する攻撃をガードする
 * - 特定のパラメータに対する攻撃を固定ダメージ化する
 * - 特定のパラメータに対する攻撃によって、ステートの解除判定を行う
 * - 特定のパラメータに対するバフ
 * - メッセージその他…
 * 
 * データとしては別物であるが、運用上は同じものとして扱いたい。
 * そうしないと、どのパラメータがどのパラメータに依存しているのか、というのを把握するのが難しくなる。
 * 
 * 
 * 
 * 
 * [2021/5/17] パラメータは誰が持つ？(特に拡張パラメータ)
 * ----------
 * HPと満腹度。
 * Entity に持たせるか、BattlerBehavior と SurvivorBehavior に分けて持たせるか。
 * 
 * ひとまずは BattlerBehavior でいいかな… 明確に分ける理由が無い。メモリ使用量くらい。
 * 拡張パラメータも含め、すべてのパラメータは "ダメージ計算処理" が適用される仕組みになるので、
 * その辺が共通化できる BattlerBehavior に持たせるのが都合いいかも。
 * 
 * 
 * 
 * [2021/5/16] 
 * ----------
 * エディタからの任意パラメータ追加はいったん見送ろう。
 * まだシステムがばっちり固まってるわけじゃないので、仕様が決めきれない。
 * 
 * 一応のアイデアとしては、パラメータが 0 になったら何かステートを付加して、ペナルティはそっちで付ける、とか。
 * 
 * 
 */
export class DParameter {
    /*
    [2022/10/17] 依存関係パラメータ
    ----------
    ### DParameter とは別クラス (DDependentParameter) で実装する方法はどうしてリジェクトしたの？
    ダメージ計算や結果表示の際に、DParameter とほぼ同等だけど別の処理を新たに作らなければならないのが大変だったため。
    依存関係パラメータは見た目上、通常パラメータと同じように抽象化して使いたい。
    そのため、DDependentParameter 固有の事情をより上位のレイヤーで気にしなければならないのは NG.

    ### 制限事項
    - 依存関係パラメータは、ダメージ値を持たない。常に idealValue を使う。
    */

    /** ID (0 is Invalid). */
    readonly id: DParameterId;

    /** Name */
    readonly key: string;

    readonly code: string;

    type: DParameterType;

    displayName: string;

    displayNameMaximum: string;

    /** RMMZ 標準パラメータであるか。敵味方にかかわらず、すべての Battler はこのパラメータインスタンスを持つ。0 は HP. -1 が無効値。 */
    battlerParamId: number;

    /** 拡張パラメータの時の、初期値 */
    initialIdealValue: number;

    /** 初期値。undefined の場合、Ideal.
     * Level なら 1, Exp なら 0, HP なら Ideal など。 */
    initialValue: number | undefined;

    minEffortLimit: number;
    maxEffortLimit: number;

    minLimit: number;
    maxLimit: number;

    /** [全回復] の対象とするか */
    recoverTarget: boolean;

    magnification: number = 1;


    addBuffCoe: number;
    mulBuffCore: number;

    // selfDamageMessage: string;      // "ダメージを受けた"
    // targetDamageMessage: string;    // "ダメージを与えた"
    // selfDamageRecovery: string;      // "%1の%2が %3 回復した！"
    // targetDamageRecovery: string;    // "ダメージを与えた"
    /** @deprecated */
    selfGainMessage: string | undefined;
    /** @deprecated */
    selfLossMessage: string | undefined;
    /** @deprecated */
    targetGainMessage: string | undefined;
    /** @deprecated */
    targetLossMessage: string | undefined;

    messageValueSource: DParamMessageValueSource;

    /** @deprecated */
    friendlySideMessages: DParamMessage[] = [];
    /** @deprecated */
    opponentSideMessages: DParamMessage[] = [];

    // Friendly, Hostile に登録されたものが無い場合、 Natual にフォールバックする。
    // Natual に登録済みのものを再生したくない場合、FlavorEffect が空である DParameterFlavorEffect を登録する。
    //private _parameterFlavorEffects: (DParameterFlavorEffect | undefined)[][] = [];
    parameterFlavorEffects: DParameterFlavorEffect[] = [];

    // ダメージ禁止。つまり、 setParamActual を禁止する。
    allowDamage: boolean = true;


    public static makeBuiltin(id: DParameterId, code: string, displayName: string, displayNameMaximun: string, battlerParamId: number, initialIdealValue: number, minLimit: number, maxLimit: number, recoverTarget: boolean) {
        const p = new DParameter(id, code, displayName);
        p.displayNameMaximum = displayNameMaximun;
        p.battlerParamId = battlerParamId;
        p.initialIdealValue = initialIdealValue;
        p.minLimit = minLimit;
        p.maxLimit = maxLimit;
        p.recoverTarget = recoverTarget;
        return p;
    }

    public constructor(id: DParameterId, key: string, displayName: string) {
        this.id = id;
        this.key = key;
        this.code = key;
        this.type = DParameterType.Normal;
        this.displayName = displayName;
        this.displayNameMaximum = displayName;
        this.battlerParamId = -1;
        this.initialIdealValue = 100;
        this.minEffortLimit = 0;
        this.maxEffortLimit = Infinity;
        this.minLimit = 0;
        this.maxLimit = Infinity;
        this.addBuffCoe = 100;
        this.mulBuffCore = 0.25;
        this.messageValueSource = DParamMessageValueSource.Relative;
        this.recoverTarget = true;
        // this.selfDamageMessage = DTextManager.actorDamage;
        // this.targetDamageMessage = DTextManager.enemyDamage;
        // this.selfDamageRecovery = DTextManager.actorRecovery;
        // this.targetDamageRecovery = DTextManager.enemyRecovery;

        this.parameterFlavorEffects = [];
        // this._parameterFlavorEffects[DFuctionType.Neutral] = [];
        // this._parameterFlavorEffects[DFuctionType.Friendly] = [];
        // this._parameterFlavorEffects[DFuctionType.Hostile] = [];
    }

    public makeDisplayValue(value: number): number {
        return value * this.magnification;
    }

    public getParameterFlavorEffectByLooksFaction(value: DFactionType): DParameterFlavorEffect[] {
        const effects = this.parameterFlavorEffects.filter(e => e.looksFaction === value);
        return effects;
    }

    // public flavorEffects(factionType: DFuctionType): DParameterFlavorEffect[] {
    //     return this._parameterFlavorEffects[factionType];
    // }

    // public addFlavorEffects(factionType: DFuctionType, value: DParameterFlavorEffect): void {
    //     this._parameterFlavorEffects[factionType].push(value);
    // }

    // public clearFlavorEffects(factionType: DFuctionType): void {
    //     this._parameterFlavorEffects[factionType] = [];
    // }

    public addFlavorEffect(options: IParameterFlavorEffect): DParameterFlavorEffect {
        const data = new DParameterFlavorEffect(options);
        this.parameterFlavorEffects.push(data);
        return data;
    }

    public addTextFlavorEffect(
        looksFaction: DFactionType,
        applyTarget: DValuePoint,
        addition: DValueAddition,
        text: string,
    ): DParameterFlavorEffect {
        const p = new DParameterFlavorEffect();
        p.flavorEffect = new DFlavorEffect();
        p.flavorEffect.text = [text];
        p.looksFaction = looksFaction;
        p.point = applyTarget;
        p.addition = addition;
        this.parameterFlavorEffects.push(p);
        return p;
    }
}

export interface IParameterProps {
    /** パラメータの識別子です。ダメージ計算式での "a.atk" のように、. に続けて指定できる、パラメータの名前です。英数字とする必要があります。 */
    //key: string;

    /** パラメータの表示名です。 GUI に表示する名前です。 */
    name?: string;

    flavorEffects?: IParameterFlavorEffect[];
}

export interface IParameterFlavorEffect {
    looksFaction?: DFactionType,
    point?: DValuePoint,
    addition?: DValueAddition,
    conditionFormula?: string,
    flavorEffect: IFlavorEffectProps,
}

