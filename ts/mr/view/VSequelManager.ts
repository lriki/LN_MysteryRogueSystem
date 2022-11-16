import { VEntity } from "./VEntity";
import { SSequelSet } from "../system/SSequel";
import { VEntityManager } from "./VEntityManager";
import { MRView } from "./MRView";

export class VSequelManager {
    private _entityVisualSet: VEntityManager;
    private _activeSequelSet: SSequelSet | undefined;
    private _currentSequelRun: number = -1;
    private _runningVisuals: VEntity[] = [];

    constructor(entityVisualSet: VEntityManager) {
        this._entityVisualSet = entityVisualSet;
    }

    public setup(sequelSet: SSequelSet) {
        this._activeSequelSet = sequelSet;
        this._currentSequelRun = -1;
        this._runningVisuals.splice(0);
        this.update();
    }

    public get isRunning(): boolean {
        return this._activeSequelSet != undefined;
    }

    public update() {
        if (this._activeSequelSet) {
            const runs = this._activeSequelSet.runs();
            if (this._currentSequelRun >= runs.length && this.isLogicalCompleted()) {
                // すべてのアニメーションが終了した
                this.onFinishedAllSequels();
            }
            else {
                let next = -1;
                if (this._currentSequelRun < 0) {
                    // initial
                    next = 0;
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
                            const visual = this._entityVisualSet.findEntityVisualByEntity(x.entity());
                            if (visual) {
                                MRView._syncCamera = false;
                                visual.sequelContext()._start(x);
                                this._runningVisuals.push(visual);
                            }
                        });
                    }
                }
            }
        }
    }

    public postUpdate() {
        if (this._activeSequelSet) {
            const runs = this._activeSequelSet.runs();
            if (this._currentSequelRun >= (runs.length - 1) && this.isLogicalCompleted()) {
                // すべてのアニメーションが終了した
                this.onFinishedAllSequels();
            }
        }
    }

    // 再生中の途中削除など
    public removeVisual(visual: VEntity) {
        const index = this._runningVisuals.indexOf(visual);
        if (index >= 0) {
            this._runningVisuals.splice(index, 1);
        }
    }

    private onFinishedAllSequels(): void {
        this._runningVisuals.splice(0);
        this._activeSequelSet = undefined;
        MRView._syncCamera = true;
    }

    // 現在実行中の Run に含まれる Visual (_runningVisuals) の Sequel が、
    // unlock されるまで実行されているか。
    private isLogicalCompleted(): boolean {
        const waitForAll = (this._activeSequelSet) ? this._activeSequelSet.isWaitForAll() : false;

        for (let i = 0; i < this._runningVisuals.length; i++) {
            const c = this._runningVisuals[i].sequelContext();
            if (!c.isLogicalCompleted(waitForAll)) {
                return false;
            }
        }
        return true;
    }
}

