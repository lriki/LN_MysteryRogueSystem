import { DParameterEffect } from "ts/data/DSkill";
import { DTraits } from "ts/data/DTraits";
import { ParameterDataId } from "ts/data/REData";
import { REGame_Attribute } from "ts/RE/REGame_Attribute";
import { RESystem } from "ts/system/RESystem";

/**
 * LBattlerAttribute
 * 
 * Trait を考慮した最大HPの変動などは、UI 表示など読み取り用途で、EffectContext を使わない場合も使用することがある。
 * 
 */
export class LBattlerAttribute extends REGame_Attribute {
    // 以下 param の index は ParameterDataId. RMMZ の param index とは異なるが、mhp,mmp,atk,def,mat,mdf,agi,luk のインデックスとは一致する。
    _actualParams: number[] = [];       // 現在値
    _idealParamPlus: number[] = [];      // 成長アイテム使用による上限加算値 -> Game_BattlerBase._paramPlus
    _buffs: number[] = [];              // バフ適用レベル (正負の整数値) -> Game_BattlerBase._buffs

    setActualParam(paramId: ParameterDataId, value: number): void {
        this._actualParams[paramId] = value;
    }

    actualParam(paramId: ParameterDataId): number {
        return this._actualParams[paramId] ?? 0;
    }

    // Game_BattlerBase.prototype.param
    idealParam(paramId: ParameterDataId): number {
        const value =
            this.idealParamBasePlus(paramId) *
            this.idealParamRate(paramId) *
            this.paramBuffRate(paramId);
        const maxValue = this.paramMax(paramId);
        const minValue = this.paramMin(paramId);
        return Math.round(value.clamp(minValue, maxValue));
    };

    // Game_BattlerBase.prototype.paramBase
    idealParamBase(paramId: ParameterDataId): number {
        return 0;
    }

    // Game_BattlerBase.prototype.paramPlus
    idealParamPlus(paramId: ParameterDataId): number {
        return this._idealParamPlus[paramId];
    }

    // Game_BattlerBase.prototype.paramBasePlus
    idealParamBasePlus(paramId: ParameterDataId): number {
        return Math.max(0, this.idealParamBase(paramId) + this.idealParamPlus(paramId));
    };
    
    // Game_BattlerBase.prototype.paramRate
    idealParamRate(paramId: ParameterDataId): number {
        return this.traitsPi(DTraits.TRAIT_PARAM, paramId);
    };

    // Game_BattlerBase.prototype.paramBuffRate
    paramBuffRate(paramId: ParameterDataId): number {
        return this._buffs[paramId] * 0.25 + 1.0;
    };
    
    // Game_BattlerBase.prototype.paramMin
    paramMin(paramId: ParameterDataId): number {
        return 0;
    };
    
    // Game_BattlerBase.prototype.paramMax
    paramMax(paramId: ParameterDataId): number {
        return Infinity;
    };

    // Game_BattlerBase.prototype.allTraits
    allTraits(): IDataTrait[] {
        return [];
    };

    // Game_BattlerBase.prototype.traitsWithId
    traitsWithId(code: number, id: number): IDataTrait[] {
        return this.allTraits().filter(
            trait => trait.code === code && trait.dataId === id
        );
    };

    // Game_BattlerBase.prototype.traitsPi
    traitsPi(code: number, id: number): number {
        return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1);
    };

    // Game_BattlerBase.prototype.refresh
    refresh() {
        //for (const stateId of this.stateResistSet()) {
        //    this.eraseState(stateId);
        //}

        const mhp = this.idealParam(RESystem.parameters.hp);
        const mmp = this.idealParam(RESystem.parameters.mp);
        const mtp = this.idealParam(RESystem.parameters.tp);
        this.setActualParam(RESystem.parameters.hp, this.actualParam(RESystem.parameters.hp).clamp(0, mhp));
        this.setActualParam(RESystem.parameters.mp, this.actualParam(RESystem.parameters.mp).clamp(0, mmp));
        this.setActualParam(RESystem.parameters.tp, this.actualParam(RESystem.parameters.tp).clamp(0, mtp));
    };
}
