import { assert, MRSerializable } from "ts/mr/Common";
import { DBuffLevelOp, DBuffMode, DBuffType, DParamBuff, LStateLevelType } from "ts/mr/data/DEffect";
import { DParameter, DParameterType } from "ts/mr/data/DParameter";
import { MRData } from "ts/mr/data/MRData";
import { DParameterId } from "../data/DCommon";
import { MRBasics } from "../data/MRBasics";
import { LEntity } from "./entity/LEntity";
import { LEntityId } from "./LObject";
import { MRLively } from "./MRLively";

interface LParamBuff {
    //mode: DBuffMode,
    level: number;
    turn: number;
}

/**
 * パラメータひとつ分の情報を保持するクラス。
 * 
 * コアスクリプトでは Level, Exp, HP, MP, TP は Param ではない。
 * MaxHP, MaxMP は Param である。
 * 例えば「HP の param」は MaxHP のことである。
 * 
 * パラメータの仕様
 * ----------
 * 
 * -9999 ...  -10                  0                        11                 20            ... 9999
 * +          +....................+------------------------+..................+                 +
 * | . . . .  |                    |                        |                  |     . . . . . . |
 * +          +....................+------------------------+..................+                 +
 *            |<-- --IdealMin -----|-- IdealMax(Base+Effort) -->|
 *                                                              |- Rate&Buff ->|
 *            |<--- ActualMinValue |--------- ActualMaxValue ----------------->|
 *                                                          |<---- Damage -----|
 *                                 |<---- ActualValue ----->|
 * |<---- MinLimit                 |                                                MaxLimit --->|
 * 
 * 
 * ### MinLimit, MaxLimit (下限値, 上限値)
 * システム上とりえる最小値、最大値。
 * ユニットがどれほど成長・弱体化しても、この範囲を超えることは無い。
 * 
 * ### IdealMinValue, IdealMaxValue (基本値の下限値, 基本値の上限値)
 * ユニットのレベルによって変化する値の範囲。
 * IdealMaxValue は、コアスクリプトの paramBasePlus() に該当する。
 * - Base: アクターの場合、レベルによって変化する値。エネミーの場合はエディタで入力された値。
 * - Plus: 装備による追加値 + 成長アイテムによる永続的な追加値。
 * 
 * IdealMinValue は一般的には 0 であるが、装備の「つよさ」の最小値はその武器の攻撃力をマイナスにしたものとなる。
 * 
 * ### ActualMinValue, ActualMaxValue (実際の下限値, 実際の上限値)
 * ActualMaxValue は コアスクリプトの param() に該当する。IdealMaxValue に対して、Trait等によるボーナスやバフを適用したもの。
 * ActualMinValue は今のところ、IdealMinValue と同じ値である。
 * 
 * ### ActualValue
 * ActualMaxValue から Damage を減算したもの。
 * ダメージ計算に用いたり、ステータス画面に表示したりするもの。
 * 
 * Refresh タイミング
 * ----------
 * コアスクリプトでは setHP() などで値が変わると、refresh() が呼ばれる。
 * 対して MRシステムでは、EffectContext による一連の処理が終わったタイミングで refresh() が呼ばれる。
 * この refresh 時にステートの付け外しが行われるが、その時にも IdealMaxValue の評価などが毎回行われるため、非常に処理に時間がかかる。
 * 
 * ダメージ値は減算方式
 * ----------
 * 現在値は、最大値からダメージ値を減算することで求める。
 * 本システムは atk,def などのすべての基本パラメータは HP と同じように0~最大値の間で変化が起こるようになっているが、
 * 増分計算だと装備品の有無やモンスターの特技、能力の成長アイテムなどで変わるときにその前後の変化量から現在値を調整する処理が必要になり複雑になる。
 * 
 * 例えば、HP最大時に薬草アイテムを使って、増えた分の HP だけ現在値を増やす処理。
 * 原作薬草だと 2 増えるが、最大 HP がバフを受けている場合、もっと大きく増える。
 * 最大 HP が増えた時は、HP を全快させるのが自然だろう。
 * しかしそのような処理にすると、例えばちからの最大値だけ増やすアイテムを使った時に、ちからを全快できたりする。
 * 個々のパラメータごとに処理を変えるか、あるいは Effect 側に回復の有無を設定するか… いずれにしても設定が増えることになってしまう。
 * 
 * MRシステムはツクール標準と比べて、パラメータシステムがかなり複雑となっている。
 * 加算方式の場合、ただでさえ問題調査が難しくなりがちな副作用に起因した問題が、さらに増えることが予想される。
 * 
 * 減算方式のデメリットは、最大HPが減ったときに、現在のダメージ量が新しい最大HPを上回る場合があること。
 * これについては値 0 になることを許可するか、 1 になるように補正する。
 */
@MRSerializable
export class LParam {
    public readonly parameterId: DParameterId;
    private _damageValue: number;       // ダメージ値。 Dependent の場合は値を持たない（常に 0）
    private _effortValue: number;      // 成長アイテム使用による上限加算値 -> Game_BattlerBase._paramPlus
    private _buff: number;              // バフ適用レベル (正負の整数値) -> Game_BattlerBase._buffs
    private _initialActualValue: number;      // 初期値。未識別状態の使用回数を表すのに使う。
    private _constantBuff: LParamBuff;
    private _ratioBuff: LParamBuff;
    private _damageValueChanged: boolean;

    constructor(id: DParameterId) {
        this.parameterId = id;
        this._damageValue = 0;
        this._effortValue = 0;
        this._buff = 0;
        this._initialActualValue = 0;
        this._constantBuff = { level: 0, turn: 0, };
        this._ratioBuff = { level: 0, turn: 0, };
        this._damageValueChanged = false;
        this.reset();
    }

    public reset(): void {
        const data = this.data;
        if (this.isAllowDamage) {
            this._damageValue = data.initialIdealValue - (data.initialValue ?? 0);
        }
        else {
            this._damageValue = 0;
        }
        this._effortValue = 0;
        this._buff = 0;
    }

    public clone(): LParam {
        const i = new LParam(this.parameterId);
        i._damageValue = this._damageValue;
        i._effortValue = this._effortValue;
        i._buff = this._buff;
        i._initialActualValue = this._initialActualValue;
        i._constantBuff = { ...this._constantBuff };
        i._ratioBuff = { ...this._ratioBuff };
        i._damageValueChanged = this._damageValueChanged;
        return i;
    }

    public get data(): DParameter {
        return MRData.parameters[this.parameterId];
    }

    public get isDependent(): boolean {
        return this.data.type == DParameterType.Dependent;
    }

    public get isAllowDamage(): boolean {
        const data = this.data;
        return data.allowDamage && data.type != DParameterType.Dependent;
    }

    //--------------------------------------------------------------------------
    // Limit range
    
    // Game_BattlerBase.prototype.paramMin
    public getMinLimit(): number {
        return this.data.minLimit;
    }

    // Game_BattlerBase.prototype.paramMax
    public getMaxLimit(): number {
        return this.data.maxLimit;
    }

    //--------------------------------------------------------------------------
    // Effort value

    public effortValue(): number {
        return this._effortValue;
    }

    public setEffortValue(value: number): void {
        const data = this.data;
        this._effortValue = Math.round(value.clamp(data.minEffortLimit, data.maxEffortLimit));
    }

    public gainEffortValue(value: number): void {
        const data = this.data;
        this._effortValue = Math.round((this._effortValue + value).clamp(data.minEffortLimit, data.maxEffortLimit));
    }
    
    public clearEffortValue(): void {
        this._effortValue = 0;
    }

    //--------------------------------------------------------------------------
    // Ideal range

    public getIdealMinValue(self: LEntity): number {
        // TODO: 装備の強さからとる。強化値の分だけマイナスにできる。
        return this.data.minLimit;
    }

    // idealParamBasePlus
    public getIdealMaxValue(self: LEntity): number {
        const base = this.getIdealMaxBase(self);
        const plus = this.getIdealMaxPlus(self);
        return base + plus;
    }

    // 現在のレベルやクラスに応じた基礎値。
    // 例えば FP だと常に 100. バフやアイテムによる最大 FP 上昇量は含まない。
    // Game_BattlerBase.prototype.paramBase
    private getIdealMaxBase(self: LEntity): number {
        const data = this.data;
        const battlerParam = data.battlerParamId;
        if (battlerParam >= 0) {
            return self.getIdealParamBase(this.parameterId);
        }
        else {
            return data.initialIdealValue;
        }
    }
    
    private getIdealMaxPlus(self: LEntity): number {
        const p1 = this.effortValue();
        const p2 = self.queryIdealParameterPlus(this.parameterId);
        return p1 + p2;
    }

    //--------------------------------------------------------------------------
    // Actual range

    public getActualMin(self: LEntity): number {
        return this.getIdealMinValue(self);
    }

    // Game_BattlerBase.prototype.param
    public getActualMax(self: LEntity): number {
        const a1 = this.getIdealMaxValue(self);
        const a2 = this.idealParamRate(self);
        const a3 =  this.paramBuffRate(self);
        const a4 = this.buffPlus();
        const value =
            a1 *
            a2 *
            a3 +
            a4;
        const minLimit = this.getMinLimit();
        const maxLimit = this.getMaxLimit();
        return Math.round(value.clamp(minLimit, maxLimit));
    }

    // Game_BattlerBase.prototype.paramRate
    private idealParamRate(self: LEntity): number {
        return self.traitsPi(MRBasics.traits.TRAIT_PARAM, this.parameterId);
    }

    // Game_BattlerBase.prototype.paramBuffRate
    // バフ適用レベル (正負の整数値。正規化されたレートではない点に注意)
    private paramBuffRate(self: LEntity): number {
        return (this.buff() * 0.25 + 1.0) * this.buffRate();
    }

    public actualParamDamge(): number {
        if (this.data.type == DParameterType.Dependent) {
            assert(this._damageValue === 0);   // Dependent に対してダメージ値を持たせるのは禁止。一応変な値が入っていないかチェックしておく。
        }
        return this._damageValue;
    }

    public get isDamageValueChanged(): boolean {
        return this._damageValueChanged;
    }

    public clearDamageValueChanged(): void {
        this._damageValueChanged = false;
    }
    

    // ActualVale の clamp はいろいろな条件があるので、set 時点では行わない。
    // そのため一時的に 上限・下限を超えた値を持つことになる。
    public setActualDamgeParam(value: number): void {
        assert(this.isAllowDamage);  // Normal のみ許可。Dependent に対してダメージ値を持たせるのは禁止。
        if (this._damageValue !== value) {
            this._damageValue = value;
            this._damageValueChanged = true;
        }
    }

    public gainActualParam(value: number): void {
        assert(this.isAllowDamage);  // Normal のみ許可。Dependent に対してダメージ値を持たせるのは禁止。
        if (value !== 0) {
            this._damageValue -= value;
            this._damageValueChanged = true;
        }
    }


    //--------------------------------------------------------------------------
    // Buff
    
    public getConstantBuff(): LParamBuff {
        return this._constantBuff;
    }

    public getRatioBuff(): LParamBuff {
        return this._ratioBuff;
    }

    public buff(): number {
        return this._buff;
    }

    public buffPlus(): number {
        return this._constantBuff.level * MRData.parameters[this.parameterId].addBuffCoe;
    }

    public buffRate(): number {
        return this._ratioBuff.level * MRData.parameters[this.parameterId].mulBuffCore + 1.0;
    }

    public clearDamage(owner: LEntity): void {
        const data = this.data;
        if (data.initialValue === undefined) {
            this._damageValue = 0;
        }
        else {
            owner.setParamCurrentValue(this.parameterId, data.initialValue);
        }
    }
    //--------------------------------------------------------------------------


    public resetInitialActualValue(value: number): void {
        this._initialActualValue = value;
    }

    public initialActualValue(): number {
        return this._initialActualValue;
    }

    public addBuff(buff: DParamBuff): void {
        const b = (buff.type == DBuffType.Add) ? this._constantBuff : this._ratioBuff;

        switch (buff.levelType) {
            case DBuffLevelOp.Set:
                b.level = buff.level;
                break;
            case DBuffLevelOp.Add:
                b.level += buff.level;
                break;
            default:
                throw new Error("Unreachable.");
        }

        b.turn = buff.turn;
    }

    public removeBuff(): void {
        this._constantBuff.level = 0;
        this._constantBuff.turn = 0;
        this._ratioBuff.level = 0;
        this._ratioBuff.turn = 0;
    }

    public updateBuffs(owner: LEntity): void {
        if (this._constantBuff.turn > 0) {
            this._constantBuff.turn--;
            if (this._constantBuff.turn <= 0) {
                this._constantBuff.level = 0;
                owner._effectResult.pushRemovedBuff(this.parameterId);
            }
        }
        if (this._ratioBuff.turn > 0) {
            this._ratioBuff.turn--;
            if (this._ratioBuff.turn <= 0) {
                this._ratioBuff.level = 0;
                owner._effectResult.pushRemovedBuff(this.parameterId);
            }
        }
    }
}

@MRSerializable
export class LParamSet {
    private _params: (LParam | undefined)[];

    constructor() {
        this._params = [];
    }

    //--------------------------------------------------------------------------
    // Limit range
    
    public getMinLimit(parameterId: DParameterId): number {
        const param = this.param(parameterId);
        return param ? param.getMinLimit() : 0;
    }

    public getMaxLimit(parameterId: DParameterId): number {
        const param = this.param(parameterId);
        return param ? param.getMaxLimit() : Infinity;
    }

    //--------------------------------------------------------------------------
    // Ideal range

    public getIdealMinValue(self: LEntity, parameterId: DParameterId): number {
        const param = this.param(parameterId);
        return param ? param.getIdealMinValue(self) : 0;
    }

    public getIdealMaxValue(self: LEntity, parameterId: DParameterId): number {
        const param = this.param(parameterId);
        return param ? param.getIdealMaxValue(self) : 0;
    }
    
    //--------------------------------------------------------------------------
    // Actual range

    public getActualMin(self: LEntity, parameterId: DParameterId): number {
        const param = this.param(parameterId);
        return param ? param.getActualMin(self) : 0;
    }

    public getActualMax(self: LEntity, parameterId: DParameterId): number {
        const param = this.param(parameterId);
        return param ? param.getActualMax(self) : 0;
    }



    //--------------------------------------------------------------------------

    public copyTo(other: LParamSet): void {
        other._params = this._params.map(x => x ? x.clone() : undefined);
    }

    // public self(): LEntity {
    //     assert(this._ownerId && this._ownerId.hasAny());
    //     return REGame.world.entity(this._ownerId);
    // }

    public clear(): void {
        this._params = [];
    }

    public acquireParam(paramId: DParameterId): LParam {
        const param = this._params[paramId];
        if (param) {
            return param;
        }
        else {
            const param = new LParam(paramId);
            this._params[paramId] = param;
            return param;
        }
    }

    public resetAllConditions(): void {
        this._params.forEach(x => x?.reset());
    }

    // Game_BattlerBase.prototype.clearParamPlus
    public clearParamPlus(): void {
        this._params.forEach(x => x?.clearEffortValue());
    }

    public params(): (LParam | undefined)[] {
        return this._params;
    }
    
    public param(paramId: DParameterId): LParam | undefined {
        const param = this._params[paramId];
        //assert(param);
        return param;
    }

    public hasParam(paramId: DParameterId): boolean {
        return this._params[paramId] !== undefined;
    }

    public updateBuffs(self: LEntity): void {
        for (const param of this._params) {
            if (param) param.updateBuffs(self);
        }
    }

    public refresh(self: LEntity): void {
        // min/max clamp.
        // 再帰防止のため、setActualParam() ではなく直接フィールドへ設定する
        for (const param of this._params) {
            if (param && param.isAllowDamage) {
                const ideal = this.getActualMax(self, param.parameterId);
                let actual = (ideal - param.actualParamDamge());

                const minmax = self.queryParamMinMax(param.parameterId);
                if (actual < minmax.min) {
                    actual = minmax.min;
                }
                if (actual > ideal) {
                    actual = ideal;
                }

                if (ideal < 0)
                    param.setActualDamgeParam(actual - ideal);
                else
                    param.setActualDamgeParam(ideal - actual);

                param.clearDamageValueChanged();
            }
        }
    }
    
}

