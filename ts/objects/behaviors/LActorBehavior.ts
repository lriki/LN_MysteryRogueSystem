import { assert } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { RE_Data_Actor } from "ts/data/DActor";
import { DBasics } from "ts/data/DBasics";
import { DClass } from "ts/data/DClass";
import { DParameterId } from "ts/data/DParameter";
import { DSkillDataId } from "ts/data/DSkill";
import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBattlerBehavior } from "./LBattlerBehavior";

/**
 */
export class LActorBehavior extends LBattlerBehavior {
    _classId: number = 0;
    _level: number = 0;
    _exp: number[] = [];
    _skills: DSkillDataId[] = [];

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LActorBehavior);
        throw new Error("Not implemented.");    // TODO: base の LBattlerBehavior のコピー
        b._classId = this._classId;
        b._level = this._level;
        b._exp = this._exp;
        return b
    }
    
    public constructor() {
        super();
    }

    public resetLevel(): void {
        this._level = this.actor().initialLevel;
    }

    
    public get level(): number {
        return this._level;
    }



    onAttached(): void {
        this._classId = this.actor().classId;

        //this._name = actor.name;
        //this._nickname = actor.nickname;
        //this._profile = actor.profile;
        this.resetLevel();
        this.initExp();
        this.initSkills();
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
        const entity = this.ownerEntity().data();
        assert(entity.actor);
        return entity.actor;
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
        this._skills = [];
        for (const learning of this.currentClass().learnings) {
            if (learning.level <= this._level) {
                this.learnSkill(learning.skillId);
            }
        }
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
        
        this.ownerEntity()._effectResult.gainedExp += exp;
    }

    // Game_Actor.prototype.finalExpRate
    private finalExpRate(): number {
        return 1;
    }

    // Game_Actor.prototype.learnSkill
    private learnSkill(skillId: DSkillDataId): void {
        if (!this.isLearnedSkill(skillId)) {
            this._skills.push(skillId);
            this._skills.sort((a, b) => a - b);
        }
    }

    // Game_Actor.prototype.isLearnedSkill
    private isLearnedSkill(skillId: DSkillDataId): boolean {
        return this._skills.includes(skillId);
    };

    // Game_Actor.prototype.paramBase 
    onGetIdealParamBase(paramId: DParameterId): number {
        const p = this.currentClass().params[REData.parameters[paramId].battlerParamId];
        return p ? p[this._level] : 0;
    }

    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.ShootingActionId);
        actions.push(DBasics.actions.EatActionId);
        actions.push(DBasics.actions.WaveActionId);
        return actions;
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



