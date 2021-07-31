import './objects/Extensions'

export function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
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
