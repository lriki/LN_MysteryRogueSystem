import { LBehavior } from "../behaviors/LBehavior";
import { LState } from "./LState";

/**
 * LStateBehavior
 * 
 * 
 */
export class LStateTraitBehavior extends LBehavior {
    //_ownerState: LState | undefined;    // シリアライズしない

    
    
    //public ownerState(): LState {
    //    assert(this._ownerState);
    //    return this._ownerState;
    //}
    
    public removeThisState(): void {
        this.ownerAs(LState)?.removeThisState();
    }
}
