import { DSkill, DSkillDataId } from "ts/data/DSkill";
import { DStateId } from "ts/data/DState";
import { DParameterId, REData } from "ts/data/REData";
import { LSkillBehavior } from "../objects/skills/SkillBehavior";
import { BlockLayerKind } from "../objects/REGame_Block";
import { REIntegration } from "./REIntegration";
import { DItemDataId } from "ts/data/DItem";
import { BasicEntityKinds } from "ts/data/predefineds/DBasicEntityKinds";
import { BasicParameters } from "ts/data/predefineds/DBasicParameters";
import { BasicSequels } from "ts/data/predefineds/DBasicSequels";
import { BasicSkills } from "ts/data/predefineds/DBasicSkills";
import { BasicItems } from "ts/data/predefineds/DBasicItems";
import { BasicAttributes, BasicBehaviors } from "ts/data/predefineds/DBasicBehaviors";
import { EntityProperties, EntityProperty } from "ts/data/predefineds/DBasicProperties";
import { SSequelContext } from "./SSequelContext";
import { RECommandContext } from "./RECommandContext";
import { REDialogContext } from "./REDialog";

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
    static commandContext: RECommandContext;
    static dialogContext: REDialogContext;
    static integration: REIntegration;

    // Database
    static parameters: BasicParameters;
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
