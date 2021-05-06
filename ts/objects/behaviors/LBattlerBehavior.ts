import { assert } from "ts/Common";
import { DClass } from "ts/data/DClass";
import { DState, DStateId, DStateRestriction } from "ts/data/DState";
import { DTraits } from "ts/data/DTraits";
import { REData } from "ts/data/REData";
import { REGame } from "../REGame";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEffectorFact } from "ts/system/REEffectContext";
import { RESystem } from "ts/system/RESystem";
import { DBasics } from "ts/data/DBasics";
import { DParameterId, DSParamId, DXParamId } from "ts/data/predefineds/DBasicParameters";
import { RE_Data_Actor } from "ts/data/DActor";
import { DActionId } from "ts/data/DAction";
import { LFloorId } from "../LFloorId";

export class LBattlerBehavior extends LBehavior {
    
    // 以下 param の index は ParameterDataId.
    // RMMZ の param index とは異なるが、mhp,mmp,atk,def,mat,mdf,agi,luk のインデックスとは一致する。
    //
    // 現在値は、最大値からダメージ値を減算することで求める。
    // 本システムは atk,def などのすべての基本パラメータは HP と同じように0~最大値の間で変化が起こるようになっているが、
    // 増分計算だと装備品の有無やモンスターの特技などで変わるときにその前後の変化量から現在値を調整する処理が必要になり複雑になる。
    _actualParamDamges: number[] = [];       // ダメージ値
    _idealParamPlus: number[] = [];      // 成長アイテム使用による上限加算値 -> Game_BattlerBase._paramPlus
    _buffs: number[] = [];              // バフ適用レベル (正負の整数値) -> Game_BattlerBase._buffs

    constructor() {
        super();

        for (const param of REData.parameters) {
            this._actualParamDamges[param.id] = 0;
            this._idealParamPlus[param.id] = 0;
            this._buffs[param.id] = 0;
        }
    }

    // Game_BattlerBase.prototype.clearParamPlus
    clearParamPlus(): void {
        for (let i = 0; i < this._idealParamPlus.length; i++) {
            this._idealParamPlus[i] = 0;
        }
    };

    // Game_BattlerBase.prototype.clearStates
    private clearStates(): void {
        this.ownerEntity().removeAllStates();
    };


    actualParam(paramId: DParameterId): number {
        return this.idealParam(paramId) - this._actualParamDamges[paramId];
    }

    setActualDamgeParam(paramId: DParameterId, value: number): void {
        this._actualParamDamges[paramId] = value;
        this.refresh();
    }
    
    gainActualParam(paramId: DParameterId, value: number): void {
        this._actualParamDamges[paramId] -= value;
        this.refresh();
    }

    // 現在の上限値。
    // システム上、HP,MP 等のほか、攻撃力、満腹度など様々なパラメータの減少が発生するため、
    // RMMZ のような _hp, _mp, _tp といったフィールドは用意せず、すべて同じように扱う。
    // Game_BattlerBase.prototype.param
    idealParam(paramId: DParameterId): number {
        const value =
            this.idealParamBasePlus(paramId) *
            this.idealParamRate(paramId) *
            this.paramBuffRate(paramId);
        const maxValue = this.paramMax(paramId);
        const minValue = this.paramMin(paramId);
        return Math.round(value.clamp(minValue, maxValue));
    };

    // Game_BattlerBase.prototype.paramBase
    idealParamBase(paramId: DParameterId): number {
        return 0;
    }

    // Game_BattlerBase.prototype.paramPlus
    idealParamPlus(parameterId: DParameterId): number {
        return this._idealParamPlus[parameterId] + this.ownerEntity().queryIdealParameterPlus(parameterId);
    }

    // Game_BattlerBase.prototype.paramBasePlus
    idealParamBasePlus(paramId: DParameterId): number {
        return Math.max(0, this.idealParamBase(paramId) + this.idealParamPlus(paramId));
    };
    
    // Game_BattlerBase.prototype.paramRate
    idealParamRate(paramId: DParameterId): number {
        return this.traitsPi(DTraits.TRAIT_PARAM, paramId);
    };

    // Game_BattlerBase.prototype.paramBuffRate
    paramBuffRate(paramId: DParameterId): number {
        return this._buffs[paramId] * 0.25 + 1.0;
    };
    
    // バフや成長によるパラメータ上限値の最小値。
    // 現在の上限値を取得したいときは idealParam() を使うこと。
    // Game_BattlerBase.prototype.paramMin
    paramMin(paramId: DParameterId): number {
        return 0;
    };
    
    // バフや成長によるパラメータ上限値の最大値。
    // 現在の上限値を取得したいときは idealParam() を使うこと。
    // Game_BattlerBase.prototype.paramMax
    paramMax(paramId: DParameterId): number {
        return Infinity;
    };

    // Game_BattlerBase.prototype.allTraits
    private allTraits(): IDataTrait[] {
        return this.ownerEntity().collectTraits();
    };

    // Game_BattlerBase.prototype.traits
    private traits(code: number): IDataTrait[] {
        return this.allTraits().filter(trait => trait.code === code);
    };

    // Game_BattlerBase.prototype.traitsWithId
    private traitsWithId(code: number, id: number): IDataTrait[] {
        return this.allTraits().filter(
            trait => trait.code === code && trait.dataId === id
        );
    };

    // Game_BattlerBase.prototype.traitsPi
    private traitsPi(code: number, id: number): number {
        return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1);
    }

    // Game_BattlerBase.prototype.traitsSum
    private traitsSum(code: number, id: number): number {
        return this.traitsWithId(code, id).reduce((r, trait) => r + trait.value, 0);
    }

    // Game_BattlerBase.prototype.traitsSumAll
    private traitsSumAll(code: number): number {
        return this.traits(code).reduce((r, trait) => r + trait.value, 0);
    };
    
    // Game_BattlerBase.prototype.traitsSet
    private traitsSet(code: number): number[] {
        const emptyNumbers: number[] = [];
        return this.traits(code).reduce((r, trait) => r.concat(trait.dataId), emptyNumbers);
    };

    // Game_BattlerBase.prototype.xparam
    public xparam(xparamId: DXParamId): number {
        return this.traitsSum(DTraits.TRAIT_XPARAM, xparamId);
    }
    
    // Game_BattlerBase.prototype.sparam
    public sparam(sparamId: DSParamId): number  {
        return this.traitsPi(DTraits.TRAIT_SPARAM, sparamId);
    }

    // Game_BattlerBase.prototype.elementRate
    public elementRate(elementId: number): number {
        return this.traitsPi(DTraits.TRAIT_ELEMENT_RATE, elementId);
    }

    // ステート有効度
    // Game_BattlerBase.prototype.stateRate
    public stateRate(stateId: DStateId): number {
        return this.traitsPi(DTraits.TRAIT_STATE_RATE, stateId);
    };
    
    // Game_BattlerBase.prototype.attackElements
    public attackElements(): number[] {
        return this.traitsSet(DTraits.TRAIT_ATTACK_ELEMENT);
    }

    // Game_BattlerBase.prototype.isGuard 
    public isGuard(): boolean {
        return false;
    };


    // Game_BattlerBase.prototype.isStateAffected
    isStateAffected(stateId: DStateId): boolean {
        const entity = this.ownerEntity();
        return entity.isStateAffected(stateId);
    }
    
    // Game_BattlerBase.prototype.isDeathStateAffected
    isDeathStateAffected(): boolean {
        return this.isStateAffected(DBasics.states.dead);
    }

    // Game_BattlerBase.prototype.states
    public states(): DState[] {
        return this.ownerEntity().states().map(s => REData.states[s.stateId()]);
    }

    // Game_BattlerBase.prototype.refresh
    // Game_Battler.prototype.refresh
    refresh() {
        //for (const stateId of this.stateResistSet()) {
        //    this.eraseState(stateId);
        //}

        //const hp = this.actualParam(RESystem.parameters.hp);

        //console.log("refresh--------");
        // 再帰防止のため、setActualParam() ではなく直接フィールドへ設定する
        for (const param of REData.parameters) {
            const max = this.idealParam(param.id);
            //console.log("max", max);
            this._actualParamDamges[param.id] = this._actualParamDamges[param.id].clamp(0, max);//this.actualParam(param.id).clamp(0, max);
        }

        // TODO: 全パラメータ
        //const mhp = this.idealParam(RESystem.parameters.hp);
        //const mmp = this.idealParam(RESystem.parameters.mp);
        //const mtp = this.idealParam(RESystem.parameters.tp);
        //this._actualParams[RESystem.parameters.hp] = this.actualParam(RESystem.parameters.hp).clamp(0, mhp);
        //this._actualParams[RESystem.parameters.mp] = this.actualParam(RESystem.parameters.mp).clamp(0, mmp);
        //this._actualParams[RESystem.parameters.tp] = this.actualParam(RESystem.parameters.tp).clamp(0, mtp);
    
        const entity = this.ownerEntity();
        if (this.actualParam(DBasics.params.hp) === 0) {
            console.log("!!!DEAD!!!", this);
            entity.addState(DBasics.states.dead);
            //throw new Error();
        } else {
            entity.removeState(DBasics.states.dead);
        }
    
        

        //context.postSequel(entity, RESystem.sequels.CollapseSequel);

        //context.postDestroy(entity);
    }
    
    // Game_BattlerBase.prototype.recoverAll
    public recoverAll(): void {
        this.clearStates();

        for (let paramId = 0; paramId < REData.parameters.length; paramId++) {
            this._actualParamDamges[paramId] = 0;
        }
        
        this.refresh();
    };

    // Game_BattlerBase.prototype.isDead
    public isDead(): boolean {
        return this.isDeathStateAffected();
    }
    
    // Game_BattlerBase.prototype.isAlive
    public isAlive(): boolean {
        return !this.isDeathStateAffected();
    }



    // Game_BattlerBase.prototype.restriction
    public restriction(): DStateRestriction {
        const restrictions = this.states().map(state => state.restriction);
        return Math.max(0, ...restrictions);
    }
    
    // Game_BattlerBase.prototype.restriction
    public isRestricted(): boolean {
        return this.restriction() > 0;
    }

    // Game_Actor.prototype.attackAnimationId1
    public attackAnimationId(): number {
        return this.bareHandsAnimationId();
    }
    
    // Game_Actor.prototype.bareHandsAnimationId
    public bareHandsAnimationId(): number {
        return 1;
    }

    //------------------------------------------------------------

    
    gainExp(exp: number): void {
    }
    
    onCollectEffector(owner: LEntity, data: SEffectorFact): void {
    }
    
    onRefreshStatus(): void {
        this.refresh();
    }
    
    onTurnEnd(context: SCommandContext): REResponse {
        const entity = this.ownerEntity();
        if (this.isDeathStateAffected()) {
            context.postSequel(entity, RESystem.sequels.CollapseSequel);
            
            if (entity.isUnique()) {
                context.postTransferFloor(entity, LFloorId.makeByRmmzNormalMapId(REGame.map.land2().landData().exitRMMZMapId));
            }
            else {
    
                context.postDestroy(entity);
            }
        }
        
        return REResponse.Pass;
    }



    public get atk(): number {
        return this.actualParam(DBasics.params.atk);
    }
    public get def(): number {
        return this.actualParam(DBasics.params.def);
    }
}

