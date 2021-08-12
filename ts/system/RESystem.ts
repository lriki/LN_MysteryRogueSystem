import { REData } from "ts/data/REData";
import { BlockLayerKind } from "../objects/LBlockLayer";
import { SIntegration } from "./SIntegration";
import { BasicSequels } from "ts/data/predefineds/DBasicSequels";
import { BasicSkills } from "ts/data/predefineds/DBasicSkills";
import { BasicItems } from "ts/data/predefineds/DBasicItems";
import { EntityProperties, EntityProperty } from "ts/data/predefineds/DBasicProperties";
import { SSequelContext } from "./SSequelContext";
import { SCommandContext } from "./SCommandContext";
import { SScheduler } from "./SScheduler";
import { SMinimapData } from "./SMinimapData";
import { SMapManager } from "./SMapManager";
import { SDialogContext } from "./SDialogContext";
import { SGroundRules } from "./SGroundRules";

export class RESystem {
    static propertyData:EntityProperty[] = [
        { id: 0, defaultValue: undefined },
        { id: 1, defaultValue: 0 },  // itemId
        { id: 2, defaultValue: 1 },  // idleSequel
        { id: 3, defaultValue: [] },  // equipmentSlots
    ];

    static properties: EntityProperties = {
        itemId: 1,
        idleSequel: 2,
        equipmentSlots: 3,
    };

    // System
    static sequelContext: SSequelContext;
    static commandContext: SCommandContext;
    static dialogContext: SDialogContext;
    static integration: SIntegration;
    static scheduler: SScheduler;
    static minimapData: SMinimapData;
    static mapManager: SMapManager;
    static groundRules: SGroundRules;
    static requestedPlayback: boolean = false;

    // Database
    static sequels: BasicSequels;
    static skills: BasicSkills;
    static items: BasicItems;
    
    

    //static skillBehaviors: LSkillBehavior[];
}




//declare var $RE_system : RESystem;
