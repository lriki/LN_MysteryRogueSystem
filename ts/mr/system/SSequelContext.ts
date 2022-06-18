import { Log } from "ts/mr/Common";
import { REGame } from "ts/mr/objects/REGame";
import { SSequelUnit, SSequelSet, SMotionSequel } from "ts/mr/system/SSequel";
import { MRBasics } from "../data/MRBasics";
import { RESystem } from "./RESystem";

export class SSequelContext {
    private _sequelSet: SSequelSet = new SSequelSet();

    public trapPerforming = false;

    public clear(): void {
        this._sequelSet = new SSequelSet();
    }

    public isEmptySequelSet(): boolean {
        return this._sequelSet.isEmpty();
    }

    public isMoveOnly(): boolean {
        for (const run of this._sequelSet.runs()) {
            for (const clip of run.clips()) {
                for (const s of clip.sequels()) {
                    if (s instanceof SMotionSequel && s.sequelId() == MRBasics.sequels.MoveSequel) {
                        
                    }
                    else {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public attemptFlush(force: boolean): void {
        // 攻撃などのメジャーアクションで同期的　Sequel が post されていれば flush.
        // もし歩行など並列のみであればあとでまとめて実行したので不要。
        if (!this._sequelSet.isAllParallel() || force) {
            this.flushSequelSet(false);
        }
    }
    
    public addSequel(sequel: SSequelUnit) {
        this._sequelSet.addSequel(sequel);
    }

    public flushSequelSet(waitForAll: boolean) {
        Log.d("[FlushSequel]");

        if (!this.isEmptySequelSet()) {
            if (REGame.signalFlushSequelSet) {
                REGame.signalFlushSequelSet(this._sequelSet);
            }
            if (waitForAll) {
                this._sequelSet.waitForAll();
            }
            
            RESystem.integration.flushSequelSet(this._sequelSet);

            this._sequelSet = new SSequelSet();
        }
    }

}
