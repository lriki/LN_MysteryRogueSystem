
export function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
}

export class Log
{
    static d(text: string) {
        console.log("%c" + text, "color: blue; font-weight: bold");
    }

    static postCommand(text: string) {
        console.log(`%c[Post: ${text}]`, "color: maroon");
    }

    static doCommand(text: string) {
        console.log(`%c[Do: ${text}]`, "color: fuchsia");
    }
}
