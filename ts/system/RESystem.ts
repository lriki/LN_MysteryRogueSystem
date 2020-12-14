import { DSkill, DSkillDataId } from "ts/data/DSkill";
import { DStateId } from "ts/data/DState";
import { ParameterDataId, REData } from "ts/data/REData";
import { LSkillBehavior } from "../objects/skills/SkillBehavior";
import { LStateBehavior } from "../objects/states/LStateBehavior";
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

export interface BasicStates {
    dead: DStateId,         // 戦闘不能
    /*
    speedDown: DStateId,    // 鈍足
    speedUp: DStateId,      // 倍速
    confusion: DStateId,    // 混乱
    sleep: DStateId,        // 睡眠
    blind: DStateId,        // 目つぶし
    paralysis: DStateId,    // かなしばり
    sealed: DStateId,       // 封印
    substitute: DStateId,   // 身代わり
    transparent: DStateId,  // 透明
    sightThrough: DStateId, // 透視
    sharpEar: DStateId,     // 地獄耳
    clairvoyant: DStateId,  // 千里眼
    deception: DStateId,    // まどわし
    mouthClosed: DStateId,  // くちなし
    */
    debug_MoveRight: DStateId,
}




export class RESystem {
    static propertyData:EntityProperty[] = [
        { id: 0, defaultValue: undefined },
        { id: 1, defaultValue: BlockLayerKind.Ground },  // homeLayer
        { id: 2, defaultValue: 0 },  // itemId
    ];

    static properties: EntityProperties = {
        homeLayer: 1,
        itemId: 2,
    }

    // Database
    static parameters: BasicParameters;
    static attributes: BasicAttributes;
    static behaviors: BasicBehaviors;
    static states: BasicStates;
    static sequels: BasicSequels;
    static skills: BasicSkills;
    static items: BasicItems;
    
    

    static skillBehaviors: LSkillBehavior[];
    static stateBehaviors: LStateBehavior[];



    static createAttribute(dataId: number) {
        const i = REData._attributeFactories[dataId]();
        i.dataId = dataId;
        return i;
    }

    static createBehavior(dataId: number) {
        const i = REData._behaviorFactories[dataId]();
        i.dataId = dataId;
        return i;
    }
}




//declare var $RE_system : RESystem;
