import { REVisual_Entity } from "../visual/REVisual_Entity";
import { REVisual_Manager } from "./REVisual_Manager";
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
        this.update();
        
        console.log("setup", this._activeSequelSet);
    }

    update() {
        if (this._activeSequelSet) {
            const runs = this._activeSequelSet.runs();
            if (this._currentSequelRun >= runs.length && this.isLogicalCompleted()) {
                // すべてのアニメーションが終了した
                this._runningVisuals.splice(0);
                this._activeSequelSet = undefined;
            }
            else {
                let next = -1;
                if (this._currentSequelRun < 0) {
                    // initial
                    next= 0;
                }
                else if (this.isLogicalCompleted()) {
                    // 再生中のものがすべて完了していれば次へ
                    next = this._currentSequelRun + 1;
                }
    
                // 毎フレームは実行しないようにしたい。
                // initial か、this.isLogicalCompleted()=true のときだけ実行したい。
                if (next >= 0) {
                    this._currentSequelRun = next;
                    if (this._currentSequelRun < runs.length) {
                        // 次の Run を開始する
                        const run = runs[this._currentSequelRun];
                        run.clips().forEach(x => {
                            const visual = this._manager.findEntityVisualByEntity(x.entity());
                            if (visual) {
                                visual.sequelContext()._start(x);
                                this._runningVisuals.push(visual);
                            }
                        });
                    }
                }
            }
        }
    }

    isRunning(): boolean {
        return this._activeSequelSet != undefined;
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

