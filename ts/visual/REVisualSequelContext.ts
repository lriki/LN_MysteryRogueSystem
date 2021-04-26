import { assert } from "ts/Common";
import { DSequel, DSequelId } from "ts/data/DSequel";
import { Vector2 } from "ts/math/Vector2";
import { REUnitBehavior } from "ts/objects/behaviors/REUnitBehavior";
import { REGame } from "ts/objects/REGame";
import { SSequelUnit, RESequelClip, SMotionSequel, SAnumationSequel, RESequelRun } from "ts/objects/REGame_Sequel";
import { RESystem } from "ts/system/RESystem";
import { updateDecorator } from "typescript";
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
    private _currentSequel: SSequelUnit | undefined;
    private _currentVisualSequel: REVisualSequel | undefined;
    private _startPosition: Vector2 = new Vector2(0, 0);
    private _currentIdleSequelId: DSequelId = 0;
    private _animationWaiting = false;

    constructor(entityVisual: REVisual_Entity) {
        this._entityVisual = entityVisual;
    }

    public sequel(): SSequelUnit {
        assert(this._currentSequel);
        return this._currentSequel;
    }
    
    public frameCount(): number {
        return this._frameCount;
    }
    
    public timeScale(): number {
        return this._timeScale;
    }
    
    public isDashing(): boolean {
        const entty = REGame.camera.focusedEntity();
        if (!entty) return false;
        const behavior = entty.findBehavior(REUnitBehavior);
        if (!behavior) return false;
        return behavior._straightDashing;
    }

    /** Sequel 開始時の Visual の position */
    startPosition(): Vector2 {
        return this._startPosition;
    }
    
    finished(): boolean {
        if (this._clip) {
            const rmmzAnimationWainting = (this._animationWaiting) ? this._entityVisual.rmmzEvent().isAnimationPlaying() : false;
            return !rmmzAnimationWainting && this._cuurentFinished && this._currentClip >= this._clip.sequels().length;
        }
        else {
            return true;
        }
    }

    isCancellationLocked(): boolean {
        return this._cancellationLocked;
    }

    isAnimationWaintng(): boolean {
        return (this._animationWaiting) ? this._entityVisual.rmmzEvent().isAnimationPlaying() : false;
    }

    public lockCamera() {
        REVisual._syncCamera = false;
    }

    public unlockCamera() {
        REVisual._syncCamera = true;
    }

    public unlockCancellation() {
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
        this._cuurentFinished = false;
        this._currentIdleSequelId = 0;
        this._next();
    }

    _next() {
        while (this._clip) {
            this._currentClip++;
            this._animationWaiting = false;

            if (this._currentClip < this._clip.sequels().length) {
                const unit = this._clip.sequels()[this._currentClip];
                if (unit instanceof SMotionSequel) {
                    this._startSequel(unit);
                    this._cancellationLocked = true;    // end() 必須にする
                    break;
                }
                else if (unit instanceof SAnumationSequel) {
                    this._startAnimation(unit);
                    if (this._animationWaiting) {
                        break;
                    }
                }
                else {
                    assert(0);
                }
            }
            else {
                this._clip = undefined;
                break;
            }
        }
    }

    _startSequel(sequel: SMotionSequel) {
        if (!REVisual.manager) throw new Error();

        this._currentSequel = sequel;
        this._currentVisualSequel = REVisual.manager.createVisualSequel(sequel.sequelId());
        this._frameCount = 0;
        this._cancellationLocked = false;
        this._cuurentFinished = false;
        this._startPosition = Vector2.clone(this._entityVisual.position());
    }

    private _startAnimation(unit: SAnumationSequel) {
        $gameTemp.requestAnimation([this._entityVisual.rmmzEvent()], unit.anumationlId(), false);
        if (unit.isWait()) {
            this._animationWaiting = true;
        }
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
        
        let idleRequested = false;
        if (this._clip) {
            const rmmzAnimationWainting = (this._animationWaiting) ? this._entityVisual.rmmzEvent().isAnimationPlaying() : false;

            // MotionSequel を持っていなければ Idle モーションを再生したい。 (AnimationSequel のみのとき)
            idleRequested = !this._clip.hasMotionSeque();

            // current の Sequel は完了しているが、全体としては未完了の場合は次の Sequel に進む
            if (!rmmzAnimationWainting && this._cuurentFinished && this._currentClip < this._clip.sequels().length) {
                this._next();
            }
        }
        else {
            idleRequested = true;
        }



        if (idleRequested) {
            const id = this._entityVisual.getIdleSequelId();
            
            if (this._currentIdleSequelId != id) {
                this._currentIdleSequelId = id;
                if (this._currentIdleSequelId != 0) {
                    this._startSequel(new SMotionSequel(this._entityVisual.entity(), id, undefined));
                }
            }
        }
    }
}
