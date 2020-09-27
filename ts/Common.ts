
export function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
}

export class Log
{
    static d(text: string) {
        console.log(text);
    }
}
