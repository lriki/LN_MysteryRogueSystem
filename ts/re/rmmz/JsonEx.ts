import { LAbility } from "ts/re/objects/abilities/LAbility";
import { LCamera } from "ts/re/objects/LCamera";
import { LEffectResult, LParamEffectResult } from "ts/re/objects/LEffectResult";
import { LEntity } from "ts/re/objects/LEntity";
import { LEntityId } from "ts/re/objects/LObject";
import { LRandom } from "ts/re/objects/LRandom";
import { LRoom } from "ts/re/objects/LRoom";
import { LScheduler } from "ts/re/objects/LScheduler";
import { LSystem } from "ts/re/objects/LSystem";
import { LWorld } from "ts/re/objects/LWorld";
import { LBlock } from "ts/re/objects/LBlock";
import { LMap } from "ts/re/objects/LMap";
import { LState } from "ts/re/objects/states/LState";
import { LStructure } from "ts/re/objects/structures/LStructure";
import { SBehaviorFactory } from "ts/re/system/SBehaviorFactory";
/**
 * セーブデータをロードするとき、JsonEx._decode の window[value["@"]] では
 * クラス名を指定して prototype をとることができなかった。
 * 
 * window に直接手を入れていいものか判断付かないため、
 * JsonEx._decode をオーバーライドしてインスタンスを作成できるようにしている。
 */

import { LFloorId } from "ts/re/objects/LFloorId";
import { LProjectableBehavior } from "ts/re/objects/behaviors/activities/LProjectableBehavior";
import { LEaterBehavior } from "ts/re/objects/behaviors/actors/LEaterBehavior";
import { LLand } from "ts/re/objects/LLand";
import { LParty } from "ts/re/objects/LParty";
import { LSurvivorBehavior } from "ts/re/objects/behaviors/LSurvivorBehavior";
import { LEquipmentBehavior } from "ts/re/objects/behaviors/LEquipmentBehavior";
import { LItemBehavior_Grass1 } from "ts/re/objects/behaviors/items/LItemBehavior_Grass1";
import { Game_REPrefabEvent } from "./Game_REPrefabEvent";
import { REBlockLayer } from "ts/re/objects/LBlockLayer";
import { LParam, LParamSet } from "ts/re/objects/LParam";
import { LDecisionBehavior } from "ts/re/objects/behaviors/LDecisionBehavior";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { LExitPointBehavior } from "ts/re/objects/behaviors/LExitPointBehavior";
import { LTrapBehavior } from "ts/re/objects/behaviors/LTrapBehavior";
import { LSanctuaryBehavior } from "ts/re/objects/behaviors/LSanctuaryBehavior";
import { LClingFloorBehavior } from "ts/re/objects/behaviors/LClingFloorBehavior";
import { LFlockBehavior } from "ts/re/objects/behaviors/LFlockBehavior";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LMonsterHouseStructure } from "ts/re/objects/structures/LMonsterHouseStructure";
import { LCharacterAI_Normal } from "ts/re/objects/ai/LStandardAI";


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
            return Object.create(LCharacterAI_Normal.prototype);
        case "LParam":
            return Object.create(LParam.prototype);
        case "LSurvivorBehavior":
            return Object.create(LSurvivorBehavior.prototype);
        case "LEquipmentBehavior":
            return Object.create(LEquipmentBehavior.prototype);
        case "LItemBehavior_Grass1":
            return Object.create(LItemBehavior_Grass1.prototype);
        case "LParamSet":
            return Object.create(LParamSet.prototype);
        case "LDecisionBehavior":
            return Object.create(LDecisionBehavior.prototype);
        case "LUnitBehavior":
            return Object.create(LUnitBehavior.prototype);
        case "LExitPointBehavior":
            return Object.create(LExitPointBehavior.prototype);
        case "LTrapBehavior":
            return Object.create(LTrapBehavior.prototype);
        case "LSanctuaryBehavior":
            return Object.create(LSanctuaryBehavior.prototype);
        case "LClingFloorBehavior":
            return Object.create(LClingFloorBehavior.prototype);
        case "LFlockBehavior":
            return Object.create(LFlockBehavior.prototype);
        case "LActivity":
            return Object.create(LActivity.prototype);
        case "LMonsterHouseStructure":
            return Object.create(LMonsterHouseStructure.prototype);

            
            
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

