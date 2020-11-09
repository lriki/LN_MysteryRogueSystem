
export function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
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
