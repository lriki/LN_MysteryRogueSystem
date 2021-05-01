import { DActionId } from "ts/data/DAction";
import { RE_Data_Actor } from "ts/data/DActor";
import { DBasics } from "ts/data/DBasics";
import { DClass } from "ts/data/DClass";
import { DParameterId } from "ts/data/predefineds/DBasicParameters";
import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { LBattlerBehavior } from "./LBattlerBehavior";

/**
 */
export class LActorBehavior extends LBattlerBehavior {
    _actorId: number = 0;
    _classId: number = 0;
    _level: number = 0;
    _exp: number[] = [];

    public constructor() {
        super();
    }

    // Game_Actor.prototype.setup
    public setup(actorId: number): void {
        this._actorId = actorId;
    }


    
    public get level(): number {
        return this._level;
    }



    onAttached(): void {
        const actor = REData.actors[this._actorId];
        this._classId = actor.classId;

        //this._name = actor.name;
        //this._nickname = actor.nickname;
        //this._profile = actor.profile;
        this._level = actor.initialLevel;
        this.initExp();
        //this.initSkills();
        //this.initEquips(actor.equips);
        this.clearParamPlus();
        this.recoverAll();
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

    // Game_Actor.prototype.nextLevelExp
    public nextLevelExp(): number {
        return this.expForLevel(this._level + 1);
    };

    // Game_Actor.prototype.actor
    actor(): RE_Data_Actor {
        return REData.actors[this._actorId];
    }

    // Game_Actor.prototype.currentClass
    currentClass(): DClass {
        return REData.classes[this._classId];
    }

    // Game_Actor.prototype.maxLevel
    private maxLevel() {
        return this.actor().maxLevel;
    };

    // Game_Actor.prototype.isMaxLevel
    private isMaxLevel() {
        return this._level >= this.maxLevel();
    };
        
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

    // Game_Actor.prototype.changeExp
    private changeExp(exp: number): void {
        console.log("changeExp", exp);

        this._exp[this._classId] = Math.max(exp, 0);
        const lastLevel = this._level;
        //const lastSkills = this.skills();
        while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
            this.levelUp();
        }
        while (this.currentExp() < this.currentLevelExp()) {
            this.levelDown();
        }
        //if (show && this._level > lastLevel) {
        //    this.displayLevelUp(this.findNewSkills(lastSkills));
        //}
        this.refresh();
    }

    // Game_Actor.prototype.levelUp
    private levelUp(): void {
        console.log("levelUp");
        this._level++;
        this.ownerEntity()._effectResult.levelup = true;
        //for (const learning of this.currentClass().learnings) {
        //    if (learning.level === this._level) {
        //        this.learnSkill(learning.skillId);
        //    }
        //}
    }

    // Game_Actor.prototype.levelDown
    private levelDown(): void {
        this._level--;
    }
    
    // Game_Actor.prototype.gainExp
    gainExp(exp: number): void {
        const newExp = this.currentExp() + Math.round(exp * this.finalExpRate());
        this.changeExp(newExp);
    }

    // Game_Actor.prototype.finalExpRate
    private finalExpRate(): number {
        return 1;
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

    // Game_Actor.prototype.paramBase 
    idealParamBase(paramId: DParameterId): number {
        const p = this.currentClass().params[paramId];
        return p ? p[this._level] : 0;
    }

    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EatActionId);
        actions.push(DBasics.actions.WaveActionId);
        return actions;
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.name)
            return this.actor().name;
        else
            super.onQueryProperty(propertyId);
    }

    onCollectTraits(result: IDataTrait[]): void {
        super.onCollectTraits(result);
        for (const t of this.actor().traits){
            result.push(t);
        }
        for (const t of this.currentClass().traits){
            result.push(t);
        }
    }
    
}


