import { assert } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { LStateTraitBehavior } from "ts/objects/states/LStateTraitBehavior"
import { LStateTrait_Nap } from "ts/objects/states/LStateTrait_Nap";
import { DBasics } from "./DBasics";
import { DStateTraitId } from "./DStateTrait";

type DStateTraitBehaviorFactory = () => LStateTraitBehavior;

export class DBehaviorFactory {

    private static _stateTraitFactories: DStateTraitBehaviorFactory[];

    public static setup() {
        this._stateTraitFactories = [];
        this.registerStateTrait(DBasics.stateTraits.nap, () => new LStateTrait_Nap());
    }

    public static createStateTraitBehavior(id: DStateTraitId): LStateTraitBehavior {
        const f = this._stateTraitFactories[id];
        assert(f);
        const behavior = f();
        REGame.world._registerBehavior(behavior);
        return behavior;
    }

    private static registerStateTrait(id: DStateTraitId, factory: DStateTraitBehaviorFactory) {
        this._stateTraitFactories[id] = factory;
    }
};

