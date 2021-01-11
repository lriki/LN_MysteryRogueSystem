import { assert } from "ts/Common";
import { DClass } from "ts/data/DClass";
import { DStateId } from "ts/data/DState";
import { DTraits } from "ts/data/DTraits";
import { ParameterDataId, REData } from "ts/data/REData";
import { REGame } from "../REGame";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { REGame_Entity } from "../REGame_Entity";
import { REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { SEffectorFact } from "ts/system/REEffectContext";
import { RESystem } from "ts/system/RESystem";
import { DBasics } from "ts/data/DBasics";

export class LBattlerBehavior extends LBehavior {
    
    // 以下 param の index は ParameterDataId.
    // RMMZ の param index とは異なるが、mhp,mmp,atk,def,mat,mdf,agi,luk のインデックスとは一致する。
    _actualParams: number[] = [];       // 現在値
    _idealParamPlus: number[] = [];      // 成長アイテム使用による上限加算値 -> Game_BattlerBase._paramPlus
    _buffs: number[] = [];              // バフ適用レベル (正負の整数値) -> Game_BattlerBase._buffs

    constructor() {
        super();
        this._actualParams[RESystem.parameters.hp] = 1;
        this._actualParams[RESystem.parameters.mp] = 1;
        this._actualParams[RESystem.parameters.tp] = 1;
        this._actualParams[RESystem.parameters.atk] = 1;
        this._actualParams[RESystem.parameters.def] = 1;
        this._actualParams[RESystem.parameters.mat] = 1;
        this._actualParams[RESystem.parameters.mdf] = 1;
        this._actualParams[RESystem.parameters.agi] = 1;
        this._actualParams[RESystem.parameters.luk] = 1;

        for (let [key, value] of Object.entries(RESystem.parameters)) {
            this._actualParams[value] = 1;
            this._idealParamPlus[value] = 0;
            this._buffs[value] = 0;
          }
    }

    // Game_BattlerBase.prototype.clearParamPlus
    clearParamPlus(): void {
        for (let i = 0; i < this._idealParamPlus.length; i++) {
            this._idealParamPlus[i] = 0;
        }
    };

    actualParam(paramId: ParameterDataId): number {
        return this._actualParams[paramId] ?? 0;
    }

    setActualParam(paramId: ParameterDataId, value: number): void {
        this._actualParams[paramId] = value;
        this.refresh();
    }
    
    gainActualParam(paramId: ParameterDataId, value: number): void {
        this.setActualParam(paramId, this.actualParam(paramId) + value);

        this.ownerEntity()._effectResult.parameterDamags[RESystem.parameters.hp] = -value;
    }

    // 上限値。
    // システム上、HP,MP 等のほか、攻撃力、満腹度など様々なパラメータの減少が発生するため、
    // RMMZ のような _hp, _mp, _tp といったフィールドは用意せず、すべて同じように扱う。
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
    }

    // Game_BattlerBase.prototype.isStateAffected
    isStateAffected(stateId: DStateId): boolean {
        const entity = this.ownerEntity();
        return entity.isStateAffected(stateId);
    }
    
    // Game_BattlerBase.prototype.isDeathStateAffected
    isDeathStateAffected(): boolean {
        return this.isStateAffected(DBasics.states.dead);
    }

    // Game_BattlerBase.prototype.refresh
    // Game_Battler.prototype.refresh
    refresh() {
        //for (const stateId of this.stateResistSet()) {
        //    this.eraseState(stateId);
        //}

        const hp = this.actualParam(RESystem.parameters.hp);

        // TODO: 全パラメータ
        // 再帰防止のため、setActualParam() ではなく直接フィールドへ設定する
        const mhp = this.idealParam(RESystem.parameters.hp);
        const mmp = this.idealParam(RESystem.parameters.mp);
        const mtp = this.idealParam(RESystem.parameters.tp);
        this._actualParams[RESystem.parameters.hp] = this.actualParam(RESystem.parameters.hp).clamp(0, mhp);
        this._actualParams[RESystem.parameters.mp] = this.actualParam(RESystem.parameters.mp).clamp(0, mmp);
        this._actualParams[RESystem.parameters.tp] = this.actualParam(RESystem.parameters.tp).clamp(0, mtp);
    
        const entity = this.ownerEntity();
        if (this.actualParam(RESystem.parameters.hp) === 0) {
            console.log("!!!DEAD!!!");
            entity.addState(DBasics.states.dead);
        } else {
            entity.removeState(DBasics.states.dead);
        }
    
        

        //context.postSequel(entity, RESystem.sequels.CollapseSequel);

        //context.postDestroy(entity);
    }

    // Game_BattlerBase.prototype.isDead
    public isDead(): boolean {
        return this.isDeathStateAffected();
    };
    
    // Game_BattlerBase.prototype.isAlive
    public isAlive(): boolean {
        return !this.isDeathStateAffected();
    };

    //------------------------------------------------------------
    
    onCollectEffector(owner: REGame_Entity, data: SEffectorFact): void {
        for (let i = 0; i < REData.parameters.length; i++) {
            data.setActualParam(i, this.actualParam(i));
        }
    }
    
    
    onTurnEnd(context: RECommandContext): REResponse {
        const entity = this.ownerEntity();
        if (this.isDeathStateAffected()) {
            context.postSequel(entity, RESystem.sequels.CollapseSequel);
            
            if (entity.isUnique()) {
                context.postTransferFloor(entity, REGame.map.land().exitEMMZMapId);
            }
            else {
    
                context.postDestroy(entity);
            }
        }
        
        return REResponse.Pass;
    }
}


/**
 */
export class LActorBehavior extends LBattlerBehavior {
    _actorId: number = 0;
    _classId: number = 0;
    _level: number = 0;
    _exp: number[] = [];

    // Game_Actor.prototype.setup
    setup(actorId: number): void {
        const actor = REData.actors[actorId];
        const cls = REData.classes[actor.classId];
        
        this._actorId = actorId;
        //this._name = actor.name;
        //this._nickname = actor.nickname;
        //this._profile = actor.profile;
        this._classId = actor.classId;
        this._level = actor.initialLevel;
        this.initExp();
        //this.initSkills();
        //this.initEquips(actor.equips);
        this.clearParamPlus();
        //this.recoverAll();
    }

    // Game_Actor.prototype.initExp
    initExp() {
        this._exp[this._classId] = this.currentLevelExp();
    }
    
    // Game_Actor.prototype.currentExp
    currentExp(): number {
        return this._exp[this._classId];
    }
    
    // Game_Actor.prototype.currentLevelExp
    currentLevelExp(): number {
        return this.expForLevel(this._level);
    }
    
    // Game_Actor.prototype.expForLevel
    expForLevel(level: number): number {
        const c = this.currentClass();
        const basis = c.expParams[0];
        const extra = c.expParams[1];
        const acc_a = c.expParams[2];
        const acc_b = c.expParams[3];
        return Math.round(
            (basis * Math.pow(level - 1, 0.9 + acc_a / 250) * level * (level + 1)) /
                (6 + Math.pow(level, 2) / 50 / acc_b) +
                (level - 1) * extra
        );
    }

    // Game_Actor.prototype.currentClass
    currentClass(): DClass {
        return REData.classes[this._classId];
    }
    
    // Game_Actor.prototype.initSkills
    initSkills(): void {
        throw new Error("Not implemented.");
        /*
        this._skills = [];
        for (const learning of this.currentClass().learnings) {
            if (learning.level <= this._level) {
                this.learnSkill(learning.skillId);
            }
        }
        */
    }

    // Game_Actor.prototype.initEquips
    initEquips(equips: number[]): void {
        throw new Error("Not implemented.");
        /*
        const slots = this.equipSlots();
        const maxSlots = slots.length;
        this._equips = [];
        for (let i = 0; i < maxSlots; i++) {
            this._equips[i] = new Game_Item();
        }
        for (let j = 0; j < equips.length; j++) {
            if (j < maxSlots) {
                this._equips[j].setEquip(slots[j] === 1, equips[j]);
            }
        }
        this.releaseUnequippableItems(true);
        this.refresh();
        */
    }

    // Game_Actor.prototype.learnSkill
    learnSkill(skillId: number): void {
        throw new Error("Not implemented.");
        /*
        if (!this.isLearnedSkill(skillId)) {
            this._skills.push(skillId);
            this._skills.sort((a, b) => a - b);
        }
        */
    }

    // Game_Actor.prototype.isLearnedSkill
    isLearnedSkill(skillId: number): boolean {
        throw new Error("Not implemented.");
        /*
        return this._skills.includes(skillId);
        */
    };
}


