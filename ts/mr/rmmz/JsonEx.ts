import { LAbility } from "ts/mr/lively/abilities/LAbility";
import { LMapView } from "ts/mr/lively/LMapView";
import { LEffectResult, LParamEffectResult } from "ts/mr/lively/LEffectResult";
import { LEntity } from "ts/mr/lively/LEntity";
import { LEntityId } from "ts/mr/lively/LObject";
import { LRandom } from "ts/mr/lively/LRandom";
import { LRoom } from "ts/mr/lively/LRoom";
import { LSystem } from "ts/mr/lively/LSystem";
import { LWorld } from "ts/mr/lively/LWorld";
import { LBlock } from "ts/mr/lively/LBlock";
import { LMap } from "ts/mr/lively/LMap";
import { LState } from "ts/mr/lively/states/LState";
import { LStructure } from "ts/mr/lively/structures/LStructure";
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

