import { DStateId } from "ts/mr/data/DState";
import { LBehavior } from "ts/mr/lively/behaviors/LBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { LGenericRMMZStateBehavior } from "ts/mr/lively/states/LGenericRMMZStateBehavior";
import { LState } from "ts/mr/lively/states/LState";
import { assert } from "../Common";
import { SBehaviorManager } from "./internal";

export class SStateFactory {

    public static newState(stateId: DStateId): LState {
        const state = new LState();
        state.setup(stateId);

        const behavior = new LGenericRMMZStateBehavior();
        MRLively.world._registerObject(behavior);
        
        //const behabiors: LStateTraitBehavior[] = [behavior];
        const behabiors: LBehavior[] = [behavior];
        for (const behavior of state.stateEffect().behaviors) {
            assert(!behavior.props);  // 未サポート
            const b = SBehaviorManager.createBehavior(behavior.data.fullName);// as LStateTraitBehavior;
            if (!b) throw new Error(`Behavior "${behavior.data.fullName}" specified in state "${stateId}:${state.stateData().displayName}" is invalid.`);
            behabiors.push(b);
        }

        for (const b of behabiors) {
            b.setParent(state);
        }
        
        state._stateBehabiors = behabiors.map(x => x.id());

        return state;
    }
}
