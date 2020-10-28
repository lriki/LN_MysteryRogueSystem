import { REVisual_Entity } from "ts/RE/REVisual_Entity";
import { REVisual_Manager } from "ts/RE/REVisual_Manager";
import { RESequelSet } from "../RE/REGame_Sequel";


/**
 * 同時に並列実行する VisualSequel の集合
 */
export interface REVisualSequelRun {
    
}


export class REVisualSequelManager {
    private _manager: REVisual_Manager;
    private _activeSequelSet: RESequelSet | undefined;
    private _currentSequelRun: number = -1;
    private _runningVisuals: REVisual_Entity[] = [];

    constructor(manager: REVisual_Manager) {
        this._manager = manager;
    }

    setup(sequelSet: RESequelSet) {
        this._activeSequelSet = sequelSet;
        this._currentSequelRun = -1;
        this._runningVisuals.splice(0);
    }

    update() {
        this.attemptStartAnimation();
    }

    private attemptStartAnimation() {
        if (this._activeSequelSet) {
            if (this._currentSequelRun < 0) {
                // initial
                this._currentSequelRun = 0;
            }
            else if (this.isLogicalCompleted()) {
                // 再生中のものがすべて完了していれば次へ
                this._currentSequelRun += 1;
            }

            const runs = this._activeSequelSet.runs();
            if (this._currentSequelRun < runs.length) {
                // 次の Run を開始する
                const run = runs[this._currentSequelRun];
                run.clips().forEach(x => {
                    const visual = this._manager.findEntityVisualByEntity(x.entity());
                    if (visual) {
                        visual.sequelContext()._start(x);
                    }
                });
            }
            else {
                // すべてのアニメーションが終了した
                this._runningVisuals.splice(0);
                this._activeSequelSet = undefined;
            }
        }
    }

    // 現在実行中の Run に含まれる Visual (_runningVisuals) の Sequel が、
    // unlock されるまで実行されているか。
    private isLogicalCompleted(): boolean {
        for (let i = 0; i < this._runningVisuals.length; i++) {
            if (this._runningVisuals[i].sequelContext().isCancellationLocked()) {
                return false;
            }
        }
        return true;
    }
}

