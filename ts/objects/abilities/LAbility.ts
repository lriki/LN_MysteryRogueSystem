import { DAbilityId } from "ts/data/DAbility";
import { LBehavior } from "../behaviors/LBehavior";
import { LBehaviorBase } from "../LBehaviorBase";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { LKnockbackBehavior } from "./LKnockbackBehavior";


/**
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
export class LAbility extends LBehaviorBase {
    private _abilityId: DAbilityId = 0;
    private _ownerEntityId: LEntityId = { index: 0, key: 0 };
    private _behabiors: LBehavior[] = [];

    public setup(abilityId: DAbilityId, owner: REGame_Entity): void {
        this._abilityId = abilityId;
        this._ownerEntityId = owner.id();

        // TODO: test
        this._behabiors = [new LKnockbackBehavior()];
    }
    
    public abilityId(): DAbilityId {
        return this._abilityId;
    }
    
    public behabiors(): LBehavior[] {
        return this._behabiors;
    }

    public onAttached(): void {
        this._behabiors.forEach(b => {
            b._ownerEntityId = this._ownerEntityId;
            b.onAttached();
        });
    }

    public onDetached(): void {
        this._behabiors.forEach(b => {
            b.onDetached();
            REGame.world._unregisterBehavior(b);
        });
    }
}
