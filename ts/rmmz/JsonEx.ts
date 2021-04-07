import { assert } from "ts/Common"
import { LAbility } from "ts/objects/abilities/LAbility";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { LCamera } from "ts/objects/LCamera";
import { LEffectResult, LParamEffectResult } from "ts/objects/LEffectResult";
import { LEntity } from "ts/objects/LEntity";
import { LEntityId } from "ts/objects/LObject";
import { LRandom } from "ts/objects/LRandom";
import { LRoom } from "ts/objects/LRoom";
import { LScheduler } from "ts/objects/LScheduler";
import { LSystem } from "ts/objects/LSystem";
import { LWorld } from "ts/objects/LWorld";
import { REBlockLayer, REGame_Block } from "ts/objects/REGame_Block";
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

import { Game_REPrefabEvent } from "./PrefabEvent";


function createInstance(name: string): any {
    switch (name) {
        case "Game_REPrefabEvent":
            return Object.create(Game_REPrefabEvent.prototype);
        case "REGame_Map":
            return Object.create(LMap.prototype);
        case "REGame_Block":
            return Object.create(REGame_Block.prototype);
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
        case "LUnitAttribute":
            return Object.create(LUnitAttribute.prototype);
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

