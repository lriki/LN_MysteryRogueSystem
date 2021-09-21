import { SIntegration } from "./SIntegration";
import { BasicSequels } from "ts/re/data/predefineds/DBasicSequels";
import { BasicSkills } from "ts/re/data/predefineds/DBasicSkills";
import { BasicItems } from "ts/re/data/predefineds/DBasicItems";
import { EntityProperties, EntityProperty } from "ts/re/data/predefineds/DBasicProperties";
import { SSequelContext } from "./SSequelContext";
import { SCommandContext } from "./SCommandContext";
import { SScheduler } from "./SScheduler";
import { SMinimapData } from "./SMinimapData";
import { SMapManager } from "./SMapManager";
import { SDialogContext } from "./SDialogContext";
import { SGroundRules } from "./SGroundRules";
import { RESystemExtension } from "./RESystemExtension";
import { STurnContext } from "./STurnContext";

export class RESystem {
    static propertyData:EntityProperty[] = [
        { id: 0, defaultValue: undefined },
        { id: 1, defaultValue: 0 },  // itemId
        { id: 2, defaultValue: 1 },  // idleSequel
        { id: 3, defaultValue: [] },  // equipmentSlots
    ];

    static properties: EntityProperties = {
        itemId: 1,
        equipmentSlots: 3,
    };

    // System
    static ext: RESystemExtension = new RESystemExtension();
    static sequelContext: SSequelContext;
    static commandContext: SCommandContext;
    static dialogContext: SDialogContext;
    static turnContext: STurnContext;
    static integration: SIntegration;
    static scheduler: SScheduler;
    static minimapData: SMinimapData;
    static mapManager: SMapManager;
    static groundRules: SGroundRules;
    static requestedPlayback: boolean = false;
    static unittest: boolean = false;

    // Database
    static skills: BasicSkills;
    static items: BasicItems;
    
    

    //static skillBehaviors: LSkillBehavior[];
}




//declare var $RE_system : RESystem;
