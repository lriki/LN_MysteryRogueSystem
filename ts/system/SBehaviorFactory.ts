import { REGame_Entity } from "../objects/REGame_Entity";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { LStaffItemBehavior } from "ts/objects/behaviors/LStaffItemBehavior";

export class SBehaviorFactory {
    public static attachBehaviors(entity: REGame_Entity, names: string[]): void {
        names.forEach(name => {
            entity.addBasicBehavior(this.createBehavior(name));
        });
    }

    public static createBehavior(name: string): LBehavior {
        switch (name) {
            case "Staff":
                return new LStaffItemBehavior();
            default:
                throw new Error();
        }
    }
}

