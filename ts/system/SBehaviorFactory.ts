import { LEntity } from "../objects/LEntity";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { LStaffItemBehavior } from "ts/objects/behaviors/LStaffItemBehavior";
import { REGame } from "ts/objects/REGame";
import { LDebugMoveRightState } from "ts/objects/states/DebugMoveRightState";

export class SBehaviorFactory {
    public static attachBehaviors(entity: LEntity, names: string[]): void {
        names.forEach(name => {
            entity.addBasicBehavior(this.createBehavior(name));
        });
    }
    
    public static createBehavior(name: string): LBehavior {
        const b = this.createBehaviorInternal(name);
        REGame.world._registerBehavior(b);
        return b;
    }

    public static createBehaviorInternal(name: string): LBehavior {
        switch (name) {
            case "Staff":
                return new LStaffItemBehavior();
            //case "DebugMoveRight":
            //    return new LDebugMoveRightState();
            default:
                throw new Error();
        }
    }
}

