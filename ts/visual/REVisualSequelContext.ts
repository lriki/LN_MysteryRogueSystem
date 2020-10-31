import { Vector2 } from "ts/math/Vector2";
import { REGame_Sequel, RESequelClip } from "ts/RE/REGame_Sequel";
import { REVisual } from "../visual/REVisual";
import { REVisualSequel } from "./REVisualSequel";
import { REVisual_Entity } from "./REVisual_Entity";

export class REVisualSequelContext {
    private _entityVisual: REVisual_Entity;
    private _clip: RESequelClip | undefined;
    private _currentClip: number = 0;
    private _frameCount: number = 0;
    private _timeScale: number = 0;
    private _cuurentFinished: boolean = false;
    private _cancellationLocked : boolean = false;
    private _currentVisualSequel: REVisualSequel | undefined;
    private _startPosition: Vector2 = new Vector2(0, 0);

    constructor(entityVisual: REVisual_Entity) {
        this._entityVisual = entityVisual;
    }
    
    frameCount(): number {
        return this._frameCount;
    }
    
    timeScale(): number {
        return this._timeScale;
    }

    /** Sequel 開始時の Visual の position */
    startPosition(): Vector2 {
        return this._startPosition;
    }
    
    finished(): boolean {
        if (this._clip) {
            return this._cuurentFinished && this._currentClip < this._clip.sequels().length;
        }
        else {
            return true;
        }
    }

    isCancellationLocked(): boolean {
        return this._cancellationLocked;
    }

    unlockCancellation() {
        this._cancellationLocked = false;
    }

    end() {
        this.unlockCancellation();
        this._cuurentFinished = true;
    }

    _start(clip: RESequelClip) {
        this._clip = clip;
        this._currentClip = -1;
        this._timeScale = clip.sequels().length;
        this._cuurentFinished = true;
        this._next();
    }

    _next() {
        if (this._clip) {
            this._currentClip++;

            if (this._currentClip < this._clip.sequels().length) {
                this._startSequel(this._clip.sequels()[this._currentClip]);
            }
        }
    }

    _startSequel(sequel: REGame_Sequel) {
        this._currentVisualSequel = REVisual.manager.createVisualSequel(sequel);
        this._frameCount = 0;
        this._cancellationLocked = true;
        this._cuurentFinished = false;
        this._startPosition = Vector2.clone(this._entityVisual.position());

        
        console.log("_startSequel");
    }

    _update() {
        if (this._currentVisualSequel) {
            this._currentVisualSequel.onUpdate(this._entityVisual, this);
            this._frameCount += 1;
            
            if (this._cuurentFinished) {
                // onUpdate() 実行によりアニメーションが終了した
                this._currentVisualSequel = undefined;
            }
        }
        
        // current の Sequel は完了しているが、全体としては未完了の場合は次の Sequel に進む
        if (this._cuurentFinished && !this.finished()) {
            this._next();
        }
    }
}
