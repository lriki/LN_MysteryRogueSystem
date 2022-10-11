import { SIntegration } from "./SIntegration";
import { BasicSequels } from "ts/mr/data/predefineds/DBasicSequels";
import { BasicItems } from "ts/mr/data/predefineds/DBasicItems";
import { EntityProperties, EntityProperty } from "ts/mr/data/predefineds/DBasicProperties";
import { SSequelContext } from "./SSequelContext";
import { SCommandContext } from "./SCommandContext";
import { SScheduler } from "./scheduling/SScheduler";
import { SMinimapData } from "./SMinimapData";
import { SMapManager } from "./SMapManager";
import { SDialogContext } from "./SDialogContext";
import { SGroundRules } from "./SGroundRules";
import { MRSystemExtension } from "./MRSystemExtension";
import { STurnContext } from "./STurnContext";
import { SSpecialEffectManager } from "./effects/SSpecialEffectManager";
import { SFormulaOperand } from "./SFormulaOperand";
import { LEntityId } from "../lively/LObject";

export class MRSystem {
    static propertyData:EntityProperty[] = [
        { id: 0, defaultValue: undefined },
        { id: 1, defaultValue: 0 },  // itemId
        { id: 2, defaultValue: 1 },  // idleSequel
        { id: 3, defaultValue: [] },  // equipmentSlots
    ];

    static properties: EntityProperties = {
        equipmentSlots: 3,
    };

    // System
    static ext: MRSystemExtension = new MRSystemExtension();
    static sequelContext: SSequelContext;
    static commandContext: SCommandContext;
    static dialogContext: SDialogContext;
    static turnContext: STurnContext;
    static integration: SIntegration;
    static scheduler: SScheduler;
    static minimapData: SMinimapData;
    static mapManager: SMapManager;
    static groundRules: SGroundRules;
    static effectBehaviorManager: SSpecialEffectManager;
    static requestedPlayback: boolean = false;
    static unittest: boolean = false;

    static requestedRestartFloorItem: LEntityId = LEntityId.makeEmpty();
    static floorStartSaveContents: string | undefined;

    // Database
    static items: BasicItems;
    
    static formulaOperandA: SFormulaOperand;
    static formulaOperandB: SFormulaOperand;
    static formulaOperandC: SFormulaOperand;

    //static skillBehaviors: LSkillBehavior[];
}


