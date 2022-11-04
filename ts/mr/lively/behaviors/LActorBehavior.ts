import { assert, MRSerializable } from "ts/mr/Common";
import { DActor } from "ts/mr/data/DActor";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DClass } from "ts/mr/data/DClass";
import { DParameterId } from "ts/mr/data/DCommon";
import { DActionId, DSkillId } from "ts/mr/data/DCommon";
import { MRData } from "ts/mr/data/MRData";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";
import { LBattlerBehavior } from "./LBattlerBehavior";

/**
 */
@MRSerializable
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
        const b = MRLively.world.spawn(LActorBehavior);
        throw new Error("Not implemented.");    // TODO: base の LBattlerBehavior のコピー
        b._classId = this._classId;
        return b;
    }
    
    public constructor() {
        super();
    }

    onAttached(self: LEntity): void {
        super.onAttached(self);
        this._classId = self.data.classId;

        //this._name = actor.name;
        //this._nickname = actor.nickname;
        //this._profile = actor.profile;
        this.initSkills();
        const a1= self.getActualParam(MRBasics.params.level);
        const b1= self.getActualParam(MRBasics.params.exp);
        //this.initEquips(actor.equips);
        //this.paramSet().clearParamPlus();
        self.recoverAll();

    }

    public get rmmzActorId(): number {
        return this.ownerEntity().data.actorData().rmmzActorId;
    }

    // Game_Actor.prototype.actor
    actor(): DActor {
        const entity = this.ownerEntity().data;
        assert(entity.actor);
        return entity.actor;
    }

    // Game_Actor.prototype.currentClass
    currentClass(): DClass {
        return MRData.classes[this._classId];
    }

        
    // Game_Actor.prototype.initSkills
    initSkills(): void {
        const level = this.ownerEntity().getActualParam(MRBasics.params.level);
        this._skills = [];
        for (const learning of this.currentClass().learnings) {
            if (learning.level <= level) {
                this.learnSkill(learning.skillId);
            }
        }
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
        const level = this.ownerEntity().getActualParam(MRBasics.params.level);
        const p = this.currentClass().params[MRData.parameters[paramId].battlerParamId];
        const v = (p ? p[level] : 0);
        assert(v !== undefined);
        return base + v;
    }

    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(MRBasics.actions.ShootActionId);
        actions.push(MRBasics.actions.EatActionId);
        actions.push(MRBasics.actions.WaveActionId);
        return actions;
    }

    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        super.onCollectTraits(self, result);
        for (const t of self.data.selfTraits){
            result.push(t);
        }
        for (const t of this.currentClass().traits){
            result.push(t);
        }
    }
    
}



