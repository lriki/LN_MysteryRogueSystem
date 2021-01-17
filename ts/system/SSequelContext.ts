import { Log } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { SSequelUnit, RESequelSet } from "ts/objects/REGame_Sequel";

export class SSequelContext {
    private _sequelSet: RESequelSet = new RESequelSet();

    public clear(): void {
        this._sequelSet = new RESequelSet();
    }

    public attemptFlush(): void {
        // 攻撃などのメジャーアクションで同期的　Sequel が post されていれば flush.
        // もし歩行など並列のみであればあとでまとめて実行したので不要。
        if (!this._sequelSet.isAllParallel()) {
            this.flushSequelSet();
        }
    }
    
    public addSequel(sequel: SSequelUnit) {
        this._sequelSet.addSequel(sequel);
    }

    public flushSequelSet() {
        Log.d("[FlushSequel]");

        if (!this._sequelSet.isEmpty()) {
            if (REGame.signalFlushSequelSet) {
                REGame.signalFlushSequelSet(this._sequelSet);
            }
            REGame.integration.onFlushSequelSet(this._sequelSet);

            this._sequelSet = new RESequelSet();
        }
    }

}
