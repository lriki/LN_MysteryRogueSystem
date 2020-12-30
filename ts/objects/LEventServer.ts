import { RECommandContext } from "ts/system/RECommandContext";
import { LBehavior } from "./behaviors/LBehavior";

export type EventHandler = (symbol: Symbol, args: any) => void;

// serialize 対象
interface EventSubscriber {
    symbol: Symbol,
    behavior: LBehavior,
    handler: EventHandler,
}

export class LEventServer {
    private _entries: EventSubscriber[] = [];
    
    public subscribe(symbol: Symbol, behavior: LBehavior, handler: EventHandler) {
        this._entries.push({
            symbol: symbol,
            behavior: behavior,
            handler: handler,
        });
    }

    public unsubscribe(symbol: Symbol, behavior: LBehavior) {
        const index = this._entries.findIndex(e => e.symbol == symbol && e.behavior == behavior);
        if (index >= 0) {
            this._entries.splice(index, 1);
        }
    }

    _hook(): void {

    }
}
