
import { assert } from "ts/Common";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { DecisionPhase, LBehavior } from "../behaviors/LBehavior";
import { LState } from "./LState";

/**
 * LStateBehavior
 * 
 * 
 */
export class LStateTraitBehavior extends LBehavior {
    _ownerState: LState | undefined;    // シリアライズしない

    
    
    public ownerState(): LState {
        assert(this._ownerState);
        return this._ownerState;
    }
    
    public removeThisState(): void {
        this.ownerState().removeThisState();
    }
}
