import { Log } from "ts/re/Common";
import { REGame } from "ts/re/objects/REGame";
import { SSequelUnit, SSequelSet } from "ts/re/system/SSequel";
import { RESystem } from "./RESystem";

export class SSequelContext {
    private _sequelSet: SSequelSet = new SSequelSet();

    public clear(): void {
        this._sequelSet = new SSequelSet();
    }

    public isEmptySequelSet(): boolean {
        return this._sequelSet.isEmpty();
    }

    public attemptFlush(force: boolean): void {
        // 攻撃などのメジャーアクションで同期的　Sequel が post されていれば flush.
        // もし歩行など並列のみであればあとでまとめて実行したので不要。
        if (!this._sequelSet.isAllParallel() || force) {
            this.flushSequelSet();
        }
    }
    
    public addSequel(sequel: SSequelUnit) {
        this._sequelSet.addSequel(sequel);
    }

    public flushSequelSet() {
        Log.d("[FlushSequel]");

        if (!this.isEmptySequelSet()) {
            if (REGame.signalFlushSequelSet) {
                REGame.signalFlushSequelSet(this._sequelSet);
            }
            RESystem.integration.flushSequelSet(this._sequelSet);

            this._sequelSet = new SSequelSet();
        }
    }

}
