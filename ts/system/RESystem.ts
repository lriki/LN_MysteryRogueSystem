import { REData } from "ts/data/REData";
import { LSkillBehavior } from "../objects/skills/SkillBehavior";
import { BlockLayerKind } from "../objects/LBlock";
import { REIntegration } from "./REIntegration";
import { DBasicParameters } from "ts/data/predefineds/DBasicParameters";
import { BasicSequels } from "ts/data/predefineds/DBasicSequels";
import { BasicSkills } from "ts/data/predefineds/DBasicSkills";
import { BasicItems } from "ts/data/predefineds/DBasicItems";
import { BasicAttributes, BasicBehaviors } from "ts/data/predefineds/DBasicBehaviors";
import { EntityProperties, EntityProperty } from "ts/data/predefineds/DBasicProperties";
import { SSequelContext } from "./SSequelContext";
import { SCommandContext } from "./SCommandContext";
import { REDialogContext } from "./REDialog";
import { SScheduler } from "./SScheduler";
import { SMinimapData } from "./SMinimapData";
import { SMapManager } from "./SMapManager";

export class RESystem {
    static propertyData:EntityProperty[] = [
        { id: 0, defaultValue: undefined },
        { id: 1, defaultValue: BlockLayerKind.Ground },  // homeLayer
        { id: 2, defaultValue: 0 },  // itemId
        { id: 3, defaultValue: "null" },  // name
        { id: 4, defaultValue: 1 },  // idleSequel
        { id: 5, defaultValue: [] },  // equipmentSlots
    ];

    static properties: EntityProperties = {
        homeLayer: 1,
        itemId: 2,
        name: 3,
        idleSequel: 4,
        equipmentSlots: 5,
    };

    // System
    static sequelContext: SSequelContext;
    static commandContext: SCommandContext;
    static dialogContext: REDialogContext;
    static integration: REIntegration;
    static scheduler: SScheduler;
    static minimapData: SMinimapData;
    static mapManager: SMapManager;

    // Database
    static attributes: BasicAttributes;
    static behaviors: BasicBehaviors;
    static sequels: BasicSequels;
    static skills: BasicSkills;
    static items: BasicItems;
    
    

    static skillBehaviors: LSkillBehavior[];



    static createAttribute(dataId: number) {
        const i = REData._attributeFactories[dataId]();
        i.dataId = dataId;
        return i;
    }
}




//declare var $RE_system : RESystem;
