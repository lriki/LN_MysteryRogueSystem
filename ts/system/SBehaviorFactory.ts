import { LEntity } from "../objects/LEntity";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { LStaffItemBehavior } from "ts/objects/behaviors/LStaffItemBehavior";
import { REGame } from "ts/objects/REGame";
import { LDebugMoveRightState } from "ts/objects/states/DebugMoveRightState";
import { LStateTrait_Nap } from "ts/objects/states/LStateTrait_Nap";
import { LKnockbackBehavior } from "ts/objects/abilities/LKnockbackBehavior";
import { LCommonBehavior } from "ts/objects/behaviors/LCommonBehavior";
import { REGame_DecisionBehavior } from "ts/objects/behaviors/REDecisionBehavior";

interface SBehaviorFactoryEntry {
    fullName: string;
    friendlyName: string;
    create: () => LBehavior;
};

export class SBehaviorFactory {
    public static _behaviorEntries: SBehaviorFactoryEntry[] = [
        { fullName: "LCommonBehavior", friendlyName: "__Common", create: () => new LCommonBehavior() },
        { fullName: "REGame_DecisionBehavior", friendlyName: "__Decision", create: () => new REGame_DecisionBehavior() },
        { fullName: "LKnockbackBehavior", friendlyName: "Knockback", create: () => new LKnockbackBehavior() },
    ];
    
    public static attachBehaviors(entity: LEntity, names: string[]): void {
        names.forEach(name => {
            entity._addBehavior(this.createBehavior(name));
        });
    }
    
    public static createBehavior(name: string): LBehavior {
        const b = this.createBehaviorInstance(name);
        if (!b) throw new Error();
        REGame.world._registerBehavior(b);
        return b;
    }

    public static createBehaviorInstance(name: string): LBehavior | undefined {
        const e = this._behaviorEntries.find(x => x.fullName == name || x.friendlyName == name);
        if (e) {
            return e.create();
        }
        else {
            switch (name) {
                case "Staff":
                    return new LStaffItemBehavior();
                case "DebugMoveRight":
                    return new LDebugMoveRightState();
                case "Nap":
                    return new LStateTrait_Nap();
                default:
                    return undefined;
            }
        }
    }
}

