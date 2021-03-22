import { assert } from "ts/Common"
import { LRoom } from "ts/objects/LRoom";
import { LWorld } from "ts/objects/LWorld";
import { REBlockLayer, REGame_Block } from "ts/objects/REGame_Block";
import { REGame_Map } from "ts/objects/REGame_Map";
import { LStructure } from "ts/objects/structures/LStructure";
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
            return Object.create(REGame_Map.prototype);
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

