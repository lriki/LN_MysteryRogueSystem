import './lively/Extensions'

export function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        console.error("assert: " + msg);
        throw new Error(msg);
    }
}

export function tr(text: string, ...keys: any[]): string {
    
    var result = text;
    for (var i = 0; i < keys.length; i++) { 
        var pattern = "\\{" + i + "\\}"; 
        var re = new RegExp(pattern, "g"); 
        result = result.replace(re, keys[i]);
    }
    return result; 
}

export function tr2(text: string): string {
    return text;
}


export class Log
{
    static _enabled: boolean = false;

    static d(text: string) {
        if (this._enabled) {
            console.log("%c" + text, "color: blue; font-weight: bold");
        }
    }

    static postCommand(text: string) {
        if (this._enabled) {
            console.log(`%c[Post: ${text}]`, "color: maroon");
        }
    }

    static doCommand(text: string) {
        if (this._enabled) {
            console.log(`%c[Do: ${text}]`, "color: fuchsia");
        }
    }
}


export class TypeStore {
    static typeInfos: { fullName: string, friendlyName: string, function: Function }[] = [];

    public static register(constructor: Function): void {
        let friendlyName = constructor.name;
        this.typeInfos.push({
            fullName: constructor.name,
            friendlyName: friendlyName,
            function: constructor,
        })
    }
    
    public static createInstance(name: string): any {
        const t = this.typeInfos.find(x => x.fullName == name || x.friendlyName == name);
        if (!t) {
            const message = tr2("%1が登録されていません。@MRSerializable でクラスを装飾してください。").format(name);
            console.error(message);
            throw new Error(message);
        }
        return Object.create(t.function.prototype);
    }
}

export function MRSerializable(constructor: Function) {
    TypeStore.register(constructor);
}
