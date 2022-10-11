import { MRSerializable } from "ts/mr/Common";
import { DParameterId } from "ts/mr/data/DCommon";
import { LBehavior, LBehaviorGroup } from "../internal";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";


/**
 * パラメータの定数加算
 */
@MRSerializable
export class LParamBehavior extends LBehavior {
    private _values: (number | undefined)[];   // Index of DParamId

    public constructor() {
        super();
        this._values = [];
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LParamBehavior);
        b._values = this._values.slice();
        return b;
    }

    public setParamBase(paramId: DParameterId, value: number): void {
        this._values[paramId] = value;
    }

    behaviorGroup(): LBehaviorGroup {
        return LBehaviorGroup.SpecialAbility;
    }

    onQueryIdealParamBase(paramId: DParameterId, base: number): number {
        const param = this._values[paramId];
        return base + ((param === undefined) ? 0 : param);
    }
}

