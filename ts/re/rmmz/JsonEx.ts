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

import { TypeStore } from "../Common";


function createInstance(name: string): any {
    
    if (name.endsWith("Behavior")) {
        const i = SBehaviorFactory.createBehaviorInstance(name);
        if (i) return i;
    }
    

    return TypeStore.createInstance(name);

    //console.log(`Type not found. "${name}"`);
    //throw new Error(`Type not found. "${name}"`);
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

