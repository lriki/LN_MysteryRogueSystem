import { DStateId } from "ts/data/DState";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { REGame } from "ts/objects/REGame";
import { LGenericRMMZStateBehavior } from "ts/objects/states/LGenericRMMZStateBehavior";
import { LState } from "ts/objects/states/LState";
import { SBehaviorFactory } from "./internal";

export class SStateFactory {

    public static newState(stateId: DStateId): LState {
        const state = new LState();
        state.setup(stateId);

        const behavior = new LGenericRMMZStateBehavior();
        REGame.world._registerBehavior(behavior);
        
        //const behabiors: LStateTraitBehavior[] = [behavior];
        const behabiors: LBehavior[] = [behavior];
        for (const behaviorName of state.stateData().behaviors) {
            const b = SBehaviorFactory.createBehavior(behaviorName);// as LStateTraitBehavior;
            if (!b) throw new Error(`Behavior "${behaviorName}" specified in state "${stateId}:${state.stateData().displayName}" is invalid.`);
            behabiors.push(b);
        }

        for (const b of behabiors) {
            b.setParent(state);
        }
        
        state._stateBehabiors = behabiors.map(x => x.id());

        return state;
    }
}
