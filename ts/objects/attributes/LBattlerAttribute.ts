import { DClass } from "ts/data/DClass";
import { DParameterEffect } from "ts/data/DSkill";
import { DTraits } from "ts/data/DTraits";
import { ParameterDataId, REData } from "ts/data/REData";
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

    // Game_BattlerBase.prototype.clearParamPlus
    clearParamPlus(): void {
        this._idealParamPlus = [0, 0, 0, 0, 0, 0, 0, 0];
    };

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
/**
 */
export class LActorAttribute extends LBattlerAttribute {
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
        this.initSkills();
        this.initEquips(actor.equips);
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
        this._skills = [];
        for (const learning of this.currentClass().learnings) {
            if (learning.level <= this._level) {
                this.learnSkill(learning.skillId);
            }
        }
    }

    // Game_Actor.prototype.initEquips
    initEquips(equips: ): void {
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
    }

    // Game_Actor.prototype.learnSkill
    learnSkill(skillId: number): void {
        if (!this.isLearnedSkill(skillId)) {
            this._skills.push(skillId);
            this._skills.sort((a, b) => a - b);
        }
    }

    // Game_Actor.prototype.isLearnedSkill
    isLearnedSkill(skillId: number): boolean {
        return this._skills.includes(skillId);
    };
}

