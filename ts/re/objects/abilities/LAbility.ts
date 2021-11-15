import { DAbilityId } from "ts/re/data/DAbility";
import { LBehavior } from "../behaviors/LBehavior";
import { LBehaviorId, LObject, LObjectId, LObjectType } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { SBehaviorFactory } from "ts/re/system/SBehaviorFactory";
import { assert, RESerializable } from "ts/re/Common";

export type LAbilityId = LObjectId;

/**
 * Ability は Entity の各種行動や与・被Effect 時に追加の様々な効果を与えるもの。
 * 
 * 振舞いは State と非常によく似ているが、Ability は合成印や新種道具の効果を表すものであり、
 * アイテムの詳細説明ウィンドウの効果欄に列挙されたりする。
 * 
 * 
 * [2021/2/20] Ability は Entity にはしないの？
 * ----------
 * State と同じだけど、いったんしない方向で行ってみる。
 * Entity にすればいろいろな応用が利きそうだけど現状はする・しないに対して明確な理由は出し切れない。
 * とりあえず YAGNI で。
 * 
 * あと Entity としたとき、Behavior から ownerEntity をとるときにちょっと細工する必要があるのが不自然かも。
 * 
 */
@RESerializable
export class LAbility extends LObject {
    private _abilityId: DAbilityId = 0;
    //private _ownerEntityId: LEntityId = { index: 0, key: 0 };
    private _behabiorIds: LBehaviorId[] = [];

    public constructor() {
        super(LObjectType.Ability);
    }

    public clone(newOwner: LEntity): LAbility {
        const ability = new LAbility();
        REGame.world._registerObject(ability);
        ability._abilityId = this._abilityId;

        for (const i of this.behabiors()) {
            const i2 = i.clone(newOwner);
            ability._behabiorIds.push(i2.id());
            i2.setParent(this);
        }
        
        return ability;
    }

    public id(): LAbilityId {
        return this.__objectId();
    }

    public setup(abilityId: DAbilityId/*, owner: LEntity*/): void {
        this._abilityId = abilityId;
        //this.setParent(owner);
        REGame.world._registerObject(this);

        // TODO: test
        //this._behabiorIds = [new LKnockbackBehavior()];
        const b = SBehaviorFactory.createBehavior("LKnockbackBehavior");
        assert(b);
        this.addBehavior(b);
    }
    
    public abilityId(): DAbilityId {
        return this._abilityId;
    }

    private addBehavior(behavior: LBehavior): void {
        assert(behavior.hasId());
        this._behabiorIds.push(behavior.id());
    }
    
    public behabiors(): LBehavior[] {
        return this._behabiorIds.map(id => REGame.world.behavior(id));
    }

    public iterateBehaviors(func: (b: LBehavior) => boolean): boolean {
        for (const id of this._behabiorIds) {
            if (!func(REGame.world.behavior(id))) return false;
        }
        return true;
    }

    public onAttached(self: LEntity): void {
        this.behabiors().forEach(b => {
            b.setParent(this);
            b.onAttached(self);
        });
    }

    public onDetached(self: LEntity): void {
        this.behabiors().forEach(b => {
            b.onDetached(self);
            b.destroy();
        });
    }
    
    onRemoveChild(entity: LEntity): void {}
}
