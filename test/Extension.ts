
import "ts/re/objects/Extensions";

export {};

declare global {
    interface String {
        format(...args: any[]): string;
    }
}

String.prototype.format = function(...args: any[]): string {
    return this.replace(/%([0-9]+)/g, (s, n) => arguments[Number(n) - 1]);
}
