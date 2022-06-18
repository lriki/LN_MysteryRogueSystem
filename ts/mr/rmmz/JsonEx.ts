import { LAbility } from "ts/mr/objects/abilities/LAbility";
import { LCamera } from "ts/mr/objects/LCamera";
import { LEffectResult, LParamEffectResult } from "ts/mr/objects/LEffectResult";
import { LEntity } from "ts/mr/objects/LEntity";
import { LEntityId } from "ts/mr/objects/LObject";
import { LRandom } from "ts/mr/objects/LRandom";
import { LRoom } from "ts/mr/objects/LRoom";
import { LSystem } from "ts/mr/objects/LSystem";
import { LWorld } from "ts/mr/objects/LWorld";
import { LBlock } from "ts/mr/objects/LBlock";
import { LMap } from "ts/mr/objects/LMap";
import { LState } from "ts/mr/objects/states/LState";
import { LStructure } from "ts/mr/objects/structures/LStructure";
import { SBehaviorFactory } from "ts/mr/system/SBehaviorFactory";
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

