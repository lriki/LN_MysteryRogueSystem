import { assert } from "ts/Common";
import { DParameterId } from "ts/data/DParameter";
import { LEntity } from "./LEntity";


export class LParam {
    private _dataId: DParameterId;
    private _actualParamDamge: number;       // ダメージ値
    private _idealParamPlus: number;      // 成長アイテム使用による上限加算値 -> Game_BattlerBase._paramPlus
    private _buff: number;              // バフ適用レベル (正負の整数値) -> Game_BattlerBase._buffs

    constructor(id: DParameterId) {
        this._dataId = id;
        this._actualParamDamge = 0;
        this._idealParamPlus = 0;
        this._buff = 0;
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

    public setActualDamgeParam(value: number): void {
        this._actualParamDamge = value;
    }

    public gainActualParam(value: number): void {
        this._actualParamDamge -= value;
    }

    public idealParamPlus(): number {
        return this._idealParamPlus;
    }

    public buff(): number {
        return this._buff;
    }

    public clearDamage(): void {
        this._actualParamDamge = 0;
    }

    public clearParamPlus(): void {
        this._idealParamPlus = 0;
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

    public refresh(owner: LEntity): void {
        // min/max clamp.
        // 再帰防止のため、setActualParam() ではなく直接フィールドへ設定する
        for (const param of this._params) {
            if (param) {
                const max = owner.idealParam(param.parameterId());
                param.setActualDamgeParam(param.actualParamDamge().clamp(0, max));
            }
        }
    }
    
}

