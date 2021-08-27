import { assert } from "ts/Common";
import { DBuffMode, DBuffOp, DParamBuff, LStateLevelType } from "ts/data/DEffect";
import { DParameterId } from "ts/data/DParameter";
import { REData } from "ts/data/REData";
import { LEntity } from "./LEntity";

interface LParamBuff {
    //mode: DBuffMode,
    level: number;
    turn: number;
}

export class LParam {
    private _dataId: DParameterId;
    private _actualParamDamge: number;       // ダメージ値
    private _idealParamPlus: number;      // 成長アイテム使用による上限加算値 -> Game_BattlerBase._paramPlus
    private _buff: number;              // バフ適用レベル (正負の整数値) -> Game_BattlerBase._buffs
    private _initialActualValue: number;      // 初期値。未識別状態の使用回数を表すのに使う。
    private _addBuff: LParamBuff;
    private _mulBuff: LParamBuff;

    constructor(id: DParameterId) {
        this._dataId = id;
        this._actualParamDamge = 0;
        this._idealParamPlus = 0;
        this._buff = 0;
        this._initialActualValue = 0;
        this._addBuff = { level: 0, turn: 0, };
        this._mulBuff = { level: 0, turn: 0, };
    }

    public clone(): LParam {
        const i = new LParam(this._dataId);
        i._actualParamDamge = this._actualParamDamge;
        i._idealParamPlus = this._idealParamPlus;
        i._buff = this._buff;
        return i;
    }

    public reset(): void {
        this._actualParamDamge = 0;
        this._idealParamPlus = 0;
        this._buff = 0;
    }

    public parameterId(): DParameterId {
        return this._dataId;
    }

    public actualParamDamge(): number {
        return this._actualParamDamge;
    }
    
    public getAddBuff(): LParamBuff {
        return this._addBuff;
    }

    public getMulBuff(): LParamBuff {
        return this._mulBuff;
    }

    public setActualDamgeParam(value: number): void {
        this._actualParamDamge = value;
    }

    public gainActualParam(value: number): void {
        this._actualParamDamge -= value;
    }

    public idealParamPlus(): number {
        return this._idealParamPlus;
    }

    public setIdealParamPlus(value: number): void {
        this._idealParamPlus = value;
    }

    public buff(): number {
        return this._buff;
    }

    public buffPlus(): number {
        return this._addBuff.level * REData.parameters[this._dataId].addBuffCoe;
    }

    public buffRate(): number {
        return this._mulBuff.level * REData.parameters[this._dataId].mulBuffCore + 1.0;
    }

    public clearDamage(): void {
        this._actualParamDamge = 0;
    }

    public clearParamPlus(): void {
        this._idealParamPlus = 0;
    }

    public resetInitialActualValue(value: number): void {
        this._initialActualValue = value;
    }

    public initialActualValue(): number {
        return this._initialActualValue;
    }

    public addBuff(buff: DParamBuff): void {
        const b = (buff.op == DBuffOp.Add) ? this._addBuff : this._mulBuff;

        switch (buff.levelType) {
            case LStateLevelType.AbsoluteValue:
                b.level = buff.level;
                break;
            case LStateLevelType.RelativeValue:
                b.level += buff.level;
                break;
            default:
                throw new Error("Unreachable.");
        }

        b.turn = buff.turn;
    }

    public removeBuff(): void {
        this._addBuff.level = 0;
        this._addBuff.turn = 0;
        this._mulBuff.level = 0;
        this._mulBuff.turn = 0;
    }

    public updateBuffs(owner: LEntity): void {
        if (this._addBuff.turn > 0) {
            this._addBuff.turn--;
            if (this._addBuff.turn <= 0) {
                this._addBuff.level = 0;
                owner._effectResult.pushRemovedBuff(this.parameterId());
            }
        }
        if (this._mulBuff.turn > 0) {
            this._mulBuff.turn--;
            if (this._mulBuff.turn <= 0) {
                this._mulBuff.level = 0;
                owner._effectResult.pushRemovedBuff(this.parameterId());
            }
        }
    }
}

export class LParamSet {
    // 以下 param の index は ParameterDataId.
    // RMMZ の param index とは異なるが、mhp,mmp,atk,def,mat,mdf,agi,luk のインデックスとは一致する。
    //
    // 現在値は、最大値からダメージ値を減算することで求める。
    // 本システムは atk,def などのすべての基本パラメータは HP と同じように0~最大値の間で変化が起こるようになっているが、
    // 増分計算だと装備品の有無やモンスターの特技などで変わるときにその前後の変化量から現在値を調整する処理が必要になり複雑になる。
    //_actualParamDamges: number[] = [];       // ダメージ値
    //_idealParamPlus: number[] = [];      // 成長アイテム使用による上限加算値 -> Game_BattlerBase._paramPlus
    //_buffs: number[] = [];              // バフ適用レベル (正負の整数値) -> Game_BattlerBase._buffs
    private _params: (LParam | undefined)[];

    constructor() {
        this._params = [];
    }

    public copyTo(other: LParamSet): void {
        other._params = this._params.map(x => x ? x.clone() : undefined);
    }

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
        this._params.forEach(x => x?.clearParamPlus());
    }

    public params(): (LParam | undefined)[] {
        return this._params;
    }
    
    public param(paramId: DParameterId): LParam | undefined {
        return this._params[paramId];
    }
    
    public getParam(paramId: DParameterId): LParam {
        const param = this._params[paramId];
        assert(param);
        return param;
    }

    public updateBuffs(owner: LEntity): void {
        for (const param of this._params) {
            if (param) param.updateBuffs(owner);
        }
    }

    public refresh(owner: LEntity): void {
        // min/max clamp.
        // 再帰防止のため、setActualParam() ではなく直接フィールドへ設定する
        for (const param of this._params) {
            if (param) {
                const ideal = owner.idealParam(param.parameterId());
                let actual = (ideal - param.actualParamDamge());

                const min = REData.parameters[param.parameterId()].minValue;
                if (actual < min) {
                    actual = min;
                }
                if (actual > ideal) {
                    actual = ideal;
                }

                if (ideal < 0)
                    param.setActualDamgeParam(actual - ideal);
                else
                    param.setActualDamgeParam(ideal - actual);
            }
        }
    }
    
}

