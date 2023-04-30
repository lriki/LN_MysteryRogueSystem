import { TypeStore } from "ts/mr/Common";
import { SBehaviorManager } from "ts/mr/system/SBehaviorFactory";

export class TestJsonEx {
    public static maxDepth = 100;

    public static stringify(object: any): string {
        return JSON.stringify(this._encode(object, 0));
    }

    public static parse(json: string) {
        return this._decode(JSON.parse(json));
    }

    private static _encode(value: any, depth: number): any {
        // [Note] The handling code for circular references in certain versions of
        //   MV has been removed because it was too complicated and expensive.
        if (depth >= this.maxDepth) {
            throw new Error("Object too deep");
        }
        const type = Object.prototype.toString.call(value);
        if (type === "[object Object]" || type === "[object Array]") {
            const constructorName = value.constructor.name;
            if (constructorName !== "Object" && constructorName !== "Array") {
                value["@"] = constructorName;
            }
            for (const key of Object.keys(value)) {
                value[key] = this._encode(value[key], depth + 1);
            }
        }
        return value;
    }
    
    private static _decode(value: any): any {
        const type = Object.prototype.toString.call(value);
        if (type === "[object Object]" || type === "[object Array]") {
            if (value["@"]) {
                const constructor = (typeof window !== "undefined") ? (window[value["@"]] as any) : undefined;
                if (constructor) {
                    Object.setPrototypeOf(value, constructor.prototype);
                }
                else {
                    const i = this._createInstance(value["@"]);
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

    private static _createInstance(name: string): any {
        if (name.endsWith("Behavior")) {
            const i = SBehaviorManager.createBehaviorInstance(name);
            if (i) return i;
        }
        return TypeStore.createInstance(name);
    }
}


