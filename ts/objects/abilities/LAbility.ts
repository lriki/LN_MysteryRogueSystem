import { DAbilityId } from "ts/data/DAbility";
import { LBehavior } from "../behaviors/LBehavior";
import { LEntityId, LObject, LObjectType } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LKnockbackBehavior } from "./LKnockbackBehavior";


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
export class LAbility extends LObject {
    private _abilityId: DAbilityId = 0;
    private _ownerEntityId: LEntityId = { index: 0, key: 0 };
    private _behabiors: LBehavior[] = [];

    public constructor() {
        super(LObjectType.Ability);
    }

    public setup(abilityId: DAbilityId, owner: LEntity): void {
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
