import { assert } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { RE_Data_Actor } from "ts/re/data/DActor";
import { REBasics } from "ts/re/data/REBasics";
import { DClass } from "ts/re/data/DClass";
import { DParameterId } from "ts/re/data/DParameter";
import { DSkillId } from "ts/re/data/DCommon";
import { REData } from "ts/re/data/REData";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBattlerBehavior } from "./LBattlerBehavior";

/**
 */
export class LActorBehavior extends LBattlerBehavior {

    /*
    レベルの扱いや増減について
    ----------
    
    ### レベルをパラメータとするべきか？
    Actor の場合は経験値と密接な関係がある。仲間モンスターが経験値を得るようなシステムの場合も同様。
    - 経験値の増減によるレベルアップ
    - 敵スキルによるレベルダウン及び経験値ダウン
    - アイテムによるレベルの増減 (しあわせ草, 不幸の草)
    - アイテムによる経験値の増減 (しあわせの杖)
    - イベントによるレベルの増減

    必ずしも経験値とレベルが結びつかないこともある点に注意。
    敵モンスターは経験値の計算は行わず、経験値を得るような効果が発生したら、即レベルを上げる。

    ### 経験値をパラメータとするべきか？
    これもしないほうがいいかも。


    */

    _classId: number = 0;
    // _level: number = 0;
    // _exp: number[] = [];
    _skills: DSkillId[] = [];

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LActorBehavior);
        throw new Error("Not implemented.");    // TODO: base の LBattlerBehavior のコピー
        b._classId = this._classId;
        return b
    }
    
    public constructor() {
        super();
    }

    private resetLevel(self: LEntity): void {
        self.setActualParam(REBasics.params.level, this.actor().initialLevel);
    }
    
    public level(): number {
        const self = this.ownerEntity();
        return self.actualParam(REBasics.params.level);
    }

    // public level(): number {
    //     return this._level;
    // }

    public setLevel(value: number): void {
        const self = this.ownerEntity();
        self.setActualParam(REBasics.params.level, value);
        this.initExp();
    }



    onAttached(self: LEntity): void {
        super.onAttached(self);
        this._classId = self.data().classId;

        //this._name = actor.name;
        //this._nickname = actor.nickname;
        //this._profile = actor.profile;
        this.resetLevel(self);
        this.initExp();
        this.initSkills();
        const a1= self.actualParam(REBasics.params.level);
        const b1= self.actualParam(REBasics.params.exp);
        //this.initEquips(actor.equips);
        this.paramSet().clearParamPlus();
        const a2 = self.actualParam(REBasics.params.level);
        const b2= self.actualParam(REBasics.params.exp);
        this.recoverAll();
        

        const a = self.actualParam(REBasics.params.level);
        const b= self.actualParam(REBasics.params.exp);

    }


    // Game_Actor.prototype.initExp
    initExp() {
        this.setExp(this.ownerEntity(), this.currentLevelExp());
    }
    
    private setExp(self: LEntity, value: number): void {
        self.setActualParam(REBasics.params.exp, value);
    }

    // Game_Actor.prototype.currentExp
    currentExp(): number {
        const self = this.ownerEntity();
        return self.actualParam(REBasics.params.exp);
    }
    
    // Game_Actor.prototype.currentLevelExp
    currentLevelExp(): number {
        return this.expForLevel(this.level());
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
        return this.expForLevel(this.level() + 1);
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
        return this.level() >= this.maxLevel();
    };
        
    // Game_Actor.prototype.initSkills
    initSkills(): void {
        this._skills = [];
        for (const learning of this.currentClass().learnings) {
            if (learning.level <= this.level()) {
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
        const self = this.ownerEntity();
        this.setExp(self, Math.max(exp, 0));
        this.refreshLevel();
    }

    // Game_Actor.prototype.levelUp
    private levelUp(): void {
        this.setLevel(this.level() + 1);
        this.ownerEntity()._effectResult.levelup = true;
        //for (const learning of this.currentClass().learnings) {
        //    if (learning.level === this._level) {
        //        this.learnSkill(learning.skillId);
        //    }
        //}
    }

    // Game_Actor.prototype.levelDown
    private levelDown(): void {
        this.setLevel(this.level() - 1);
        this.ownerEntity()._effectResult.leveldown = true;
    }

    // 現在 Exp に Level をあわせる
    private refreshLevel(): void {

        //const lastLevel = this._level;
        //const lastSkills = this.skills();

        while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
            this.levelUp();
        }
        while (this.currentExp() < this.currentLevelExp()) {
            const a = this.currentExp();
            const b = this.currentLevelExp();
            this.levelDown();
        }
    }
    
    changeLevel(value: number, keepExpWhenDown: boolean): void {
        const level = this.level();
        if (value > level) {          // LevelUp
            this.changeExp(this.expForLevel(value));
        }
        else if (value < level) {     // LevelDown
            if (keepExpWhenDown) {
                this.changeExp(this.expForLevel(value + 1) - 1);
            }
            else {
                this.changeExp(this.expForLevel(value));
            }
        }
    }


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
    private learnSkill(skillId: DSkillId): void {
        if (!this.isLearnedSkill(skillId)) {
            this._skills.push(skillId);
            this._skills.sort((a, b) => a - b);
        }
    }

    // Game_Actor.prototype.isLearnedSkill
    private isLearnedSkill(skillId: DSkillId): boolean {
        return this._skills.includes(skillId);
    };

    // Game_Actor.prototype.paramBase 
    onQueryIdealParamBase(paramId: DParameterId, base: number): number {
        const p = this.currentClass().params[REData.parameters[paramId].battlerParamId];
        return base + (p ? p[this.level()] : 0);
    }

    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(REBasics.actions.ShootingActionId);
        actions.push(REBasics.actions.EatActionId);
        actions.push(REBasics.actions.WaveActionId);
        return actions;
    }

    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        super.onCollectTraits(self, result);
        for (const t of self.data().selfTraits){
            result.push(t);
        }
        for (const t of this.currentClass().traits){
            result.push(t);
        }
    }
    
}



