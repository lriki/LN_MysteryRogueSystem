import { assert } from "ts/Common"
import { LAbility } from "ts/objects/abilities/LAbility";
import { LCamera } from "ts/objects/LCamera";
import { LEffectResult, LParamEffectResult } from "ts/objects/LEffectResult";
import { LEntity } from "ts/objects/LEntity";
import { LEntityId } from "ts/objects/LObject";
import { LRandom } from "ts/objects/LRandom";
import { LRoom } from "ts/objects/LRoom";
import { LScheduler } from "ts/objects/LScheduler";
import { LSystem } from "ts/objects/LSystem";
import { LWorld } from "ts/objects/LWorld";
import { LBlock } from "ts/objects/LBlock";
import { LMap } from "ts/objects/LMap";
import { LState } from "ts/objects/states/LState";
import { LStructure } from "ts/objects/structures/LStructure";
import { SBehaviorFactory } from "ts/system/SBehaviorFactory";
/**
 * セーブデータをロードするとき、JsonEx._decode の window[value["@"]] では
 * クラス名を指定して prototype をとることができなかった。
 * 
 * window に直接手を入れていいものか判断付かないため、
 * JsonEx._decode をオーバーライドしてインスタンスを作成できるようにしている。
 */

import { LFloorId } from "ts/objects/LFloorId";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { LEaterBehavior } from "ts/objects/behaviors/actors/LEaterBehavior";
import { LLand } from "ts/objects/LLand";
import { LParty } from "ts/objects/LParty";
import { LCharacterAI } from "ts/objects/LCharacterAI";
import { LParamInstance } from "ts/objects/behaviors/LBattlerBehavior";
import { LSurvivorBehavior } from "ts/objects/behaviors/LSurvivorBehavior";
import { LEquipmentBehavior } from "ts/objects/behaviors/LEquipmentBehavior";
import { LItemBehavior_Grass1 } from "ts/objects/behaviors/items/LItemBehavior_Grass1";
import { Game_REPrefabEvent } from "./Game_REPrefabEvent";
import { REBlockLayer } from "ts/objects/LBlockLayer";


function createInstance(name: string): any {
    switch (name) {
        case "Game_REPrefabEvent":
            return Object.create(Game_REPrefabEvent.prototype);
        case "REGame_Map":
            return Object.create(LMap.prototype);
        case "REGame_Block":
            return Object.create(LBlock.prototype);
        case "REBlockLayer":
            return Object.create(REBlockLayer.prototype);
        case "LRoom":
            return Object.create(LRoom.prototype);
        case "LStructure":
            return Object.create(LStructure.prototype);
        case "LWorld":
            return Object.create(LWorld.prototype);
        case "LEntity":
            return Object.create(LEntity.prototype);
        case "LEffectResult":
            return Object.create(LEffectResult.prototype);
        case "LParamEffectResult":
            return Object.create(LParamEffectResult.prototype);
        case "LState":
            return Object.create(LState.prototype);
        case "LAbility":
            return Object.create(LAbility.prototype);
        case "LRandom":
            return Object.create(LRandom.prototype);
        case "LCamera":
            return Object.create(LCamera.prototype);
        case "LSystem":
            return Object.create(LSystem.prototype);
        case "LEntityId":
            return Object.create(LEntityId.prototype);
        case "LScheduler":
            return Object.create(LScheduler.prototype);
        case "LMap":
            return Object.create(LMap.prototype);
        case "LFloorId":
            return Object.create(LFloorId.prototype);
        case "LProjectableBehavior":
            return Object.create(LProjectableBehavior.prototype);
        case "LEaterBehavior":
            return Object.create(LEaterBehavior.prototype);
        case "LLand":
            return Object.create(LLand.prototype);
        case "LParty":
            return Object.create(LParty.prototype);
        case "LBlock":
            return Object.create(LBlock.prototype);
        case "LCharacterAI":
            return Object.create(LCharacterAI.prototype);
        case "LParamInstance":
            return Object.create(LParamInstance.prototype);
        case "LSurvivorBehavior":
            return Object.create(LSurvivorBehavior.prototype);
        case "LEquipmentBehavior":
            return Object.create(LEquipmentBehavior.prototype);
        case "LItemBehavior_Grass1":
            return Object.create(LItemBehavior_Grass1.prototype);

            
            
    }

    if (name.endsWith("Behavior")) {
        const i = SBehaviorFactory.createBehaviorInstance(name);
        if (i) return i;
    }

    console.log(`Type not found. "${name}"`);
    throw new Error(`Type not found. "${name}"`);
}


const _JsonEx__decode = JsonEx._decode;
JsonEx._decode = function(value: any) {
    const type = Object.prototype.toString.call(value);
    if (type === "[object Object]" || type === "[object Array]") {
        if (value["@"]) {
            const constructor = (window as any)[value["@"]];
            if (constructor) {
                Object.setPrototypeOf(value, constructor.prototype);
            }
            else {
                const i = createInstance(value["@"]);
                Object.assign(i, value);
                value = i;
            }
        }
        for (const key of Object.keys(value)) {
            value[key] = this._decode(value[key]);
        }
    }
    return value;
}

