import { REData } from "ts/data/REData";
import { BlockLayerKind } from "../objects/LBlockLayer";
import { SIntegration } from "./SIntegration";
import { BasicSequels } from "ts/data/predefineds/DBasicSequels";
import { BasicSkills } from "ts/data/predefineds/DBasicSkills";
import { BasicItems } from "ts/data/predefineds/DBasicItems";
import { BasicBehaviors } from "ts/data/predefineds/DBasicBehaviors";
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
        { id: 2, defaultValue: "null" },  // name
        { id: 3, defaultValue: 1 },  // idleSequel
        { id: 4, defaultValue: [] },  // equipmentSlots
    ];

    static properties: EntityProperties = {
        itemId: 1,
        name: 2,
        idleSequel: 3,
        equipmentSlots: 4,
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

    // Database
    static behaviors: BasicBehaviors;
    static sequels: BasicSequels;
    static skills: BasicSkills;
    static items: BasicItems;
    
    

    //static skillBehaviors: LSkillBehavior[];
}




//declare var $RE_system : RESystem;
