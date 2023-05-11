import { assert } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DSpecialEffectId } from "ts/mr/data/DCommon";
import { SSpecialEffect } from "./effects/SSpecialEffect";
import { SGoldStealSpecialEffect } from "./effects/SGoldStealSpecialEffect";
import { SItemStealSpecialEffect } from "./effects/SItemStealSpecialEffect";
import { SLevelDownSpecialEffect } from "./effects/SLevelDownSpecialEffect";
import { SWarpSpecialEffect } from "./effects/SWrapSpecialEffect";
import { SStumbleSpecialEffect } from "./effects/SStumbleSpecialEffect";
import { STransferToNextFloorSpecialEffect } from "./effects/STransferToNextFloorSpecialEffect";
import { STransferToLowerFloorSpecialEffect } from "./effects/STransferToLowerFloorSpecialEffect";
import { STrapProliferationSpecialEffect } from "./effects/STrapProliferationSpecialEffect";
import { SDispelEquipmentsSpecialEffect } from "./effects/SDispelEquipmentsSpecialEffect";
import { SChangeInstanceSpecialEffect } from "./effects/SChangeInstanceSpecialEffect";
import { SRestartFloorSpecialEffect } from "./effects/SRestartFloorSpecialEffect";
import { SClarificationSpecialEffect } from "./effects/SClarificationSpecialEffect";
import { SDivisionSpecialEffect } from "./effects/SDivisionSpecialEffect";
import { SRemoveStatesByIntentionsSpecialEffect } from "./effects/SRemoveStatesByIntentionsSpecialEffect";
import { SPerformeSkillSpecialEffect } from "./effects/SPerformeSkillSpecialEffect";
import { SRemoveStateSpecialEffect } from "./effects/SRemoveStateSpecialEffect";
import { SAddStateSpecialEffect } from "./effects/SAddStateSpecialEffect";
import { SGainCapacitySpecialEffect } from "./effects/SGainCapacitySpecialEffect";
import { SSuckOutSpecialEffect } from "./effects/SSuckOutSpecialEffect";

export class SSpecialEffectManager {
    private behaviors: (SSpecialEffect | undefined)[] = [];    // Index is DSkillBehaviorId

    public constructor() {
        this.setupBuiltins();
    }

    public register(specialEffectId: DSpecialEffectId, behavior: SSpecialEffect) {
        this.behaviors[specialEffectId] = behavior;
    }

    public find(specialEffectId: DSpecialEffectId): SSpecialEffect | undefined {
        return this.behaviors[specialEffectId];
    }

    public get(specialEffectId: DSpecialEffectId): SSpecialEffect {
        const b = this.find(specialEffectId);
        assert(b);
        return b;
    }

    private setupBuiltins(): void {
        this.register(MRBasics.effectBehaviors.itemSteal, new SItemStealSpecialEffect());
        this.register(MRBasics.effectBehaviors.goldSteal, new SGoldStealSpecialEffect());
        this.register(MRBasics.effectBehaviors.levelDown, new SLevelDownSpecialEffect());
        this.register(MRBasics.effectBehaviors.randomWarp, new SWarpSpecialEffect());
        this.register(MRBasics.effectBehaviors.stumble, new SStumbleSpecialEffect());
        this.register(MRBasics.effectBehaviors.transferToNextFloor, new STransferToNextFloorSpecialEffect());
        this.register(MRBasics.effectBehaviors.transferToLowerFloor, new STransferToLowerFloorSpecialEffect());
        this.register(MRBasics.effectBehaviors.trapProliferation, new STrapProliferationSpecialEffect());
        this.register(MRBasics.effectBehaviors.dispelEquipments, new SDispelEquipmentsSpecialEffect());
        this.register(MRBasics.effectBehaviors.changeInstance, new SChangeInstanceSpecialEffect());
        this.register(MRBasics.effectBehaviors.restartFloor, new SRestartFloorSpecialEffect());
        this.register(MRBasics.effectBehaviors.clarification, new SClarificationSpecialEffect());
        this.register(MRBasics.effectBehaviors.division, new SDivisionSpecialEffect());
        this.register(MRBasics.effectBehaviors.addState, new SAddStateSpecialEffect());
        this.register(MRBasics.effectBehaviors.removeState, new SRemoveStateSpecialEffect());
        this.register(MRBasics.effectBehaviors.removeStatesByIntentions, new SRemoveStatesByIntentionsSpecialEffect());
        this.register(MRBasics.effectBehaviors.performeSkill, new SPerformeSkillSpecialEffect());
        this.register(MRBasics.effectBehaviors.gainCapacity, new SGainCapacitySpecialEffect());
        this.register(MRBasics.effectBehaviors.suckOut, new SSuckOutSpecialEffect());
    }
}
