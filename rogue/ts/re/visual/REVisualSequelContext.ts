import { assert } from "ts/re/Common";
import { Vector2 } from "ts/re/math/Vector2";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SSequelUnit, SSequelClip, SMotionSequel, SAnumationSequel, SWaitSequel, SBalloonSequel } from "ts/re/system/SSequel";
import { DSequelId } from "../data/DSequel";

import { REVisual } from "../visual/REVisual";
import { REVisualSequel } from "./REVisualSequel";
import { REVisual_Entity } from "./REVisual_Entity";

export class REVisualSequelContext {
    private _entityVisual: REVisual_Entity;
    private _clip: SSequelClip | undefined;
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
    private _balloonWaiting = false;
    private _waitFrameCount: number = 0;

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
        const behavior = entty.findEntityBehavior(LUnitBehavior);
        if (!behavior) return false;
        return behavior._straightDashing || behavior._fastforwarding;
    }

    /** Sequel 開始時の Visual の position */
    startPosition(): Vector2 {
        return this._startPosition;
    }
    
    finished(): boolean {
        if (this._clip) {
            const rmmzAnimationWainting = (this._animationWaiting) ? this._entityVisual.rmmzEvent().isAnimationPlaying() : false;
            const rmmzBalloonWainting = (this._balloonWaiting) ? this._entityVisual.rmmzEvent().isBalloonPlaying() : false;
            return !rmmzAnimationWainting && !rmmzBalloonWainting && this._cuurentFinished && this._currentClip >= this._clip.sequels().length;
        }
        else {
            return true;
        }
    }

    isCancellationLocked(): boolean {
        return this._cancellationLocked;
    }

    isAnimationWaintng(): boolean {
        if (this._animationWaiting && this._entityVisual.rmmzEvent().isAnimationPlaying()) {
            return true;
        }
        if (this._balloonWaiting && this._entityVisual.rmmzEvent().isBalloonPlaying()) {
            return true;
        }
        return false;
    }

    isFrameWaiting(): boolean {
        return this._waitFrameCount > 0;
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

    public startAnimation(rmmzAnimationId: number) {
        $gameTemp.requestAnimation([this._entityVisual.rmmzEvent()], rmmzAnimationId, false);
    }

    end() {
        this.unlockCancellation();
        this._cuurentFinished = true;
    }

    _start(clip: SSequelClip) {
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
            this._balloonWaiting = false;

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
                else if (unit instanceof SBalloonSequel) {
                    this._startBalloon(unit);
                    if (this._balloonWaiting) {
                        break;
                    }
                }
                else if (unit instanceof SWaitSequel) {
                    this._startWaitSequel(unit);
                    break;
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

    private _startSequel(sequel: SMotionSequel) {
        if (!REVisual.manager) throw new Error();

        this._currentSequel = sequel;
        this._currentVisualSequel = REVisual.manager.createVisualSequel(sequel.sequelId());
        this._frameCount = 0;
        this._cancellationLocked = false;
        this._cuurentFinished = false;
        if (sequel.hasStartPosition()) {
            this._startPosition.x = sequel.startX();
            this._startPosition.y = sequel.startY();
            this._entityVisual.setPosition(new Vector2(this._startPosition.x, this._startPosition.y));
        }
        else {
            this._startPosition = Vector2.clone(this._entityVisual.position());
        }
    }

    private _startAnimation(unit: SAnumationSequel) {
        $gameTemp.requestAnimation([this._entityVisual.rmmzEvent()], unit.anumationlId(), false);
        if (unit.isWait()) {
            this._animationWaiting = true;
        }
    }

    private _startBalloon(unit: SBalloonSequel) {
        $gameTemp.requestBalloon(this._entityVisual.rmmzEvent(), unit.balloonId());
        if (unit.isWait()) {
            this._balloonWaiting = true;
        }
    }

    private _startWaitSequel(sequel: SWaitSequel): void {
        this._waitFrameCount = sequel.waitCount();
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

        if (this._waitFrameCount > 0) {
            this._waitFrameCount--;
        }
        
        let idleRequested = false;
        if (this._clip) {
            const rmmzAnimationWainting = (this._animationWaiting) ? this._entityVisual.rmmzEvent().isAnimationPlaying() : false;
            const rmmzBalloonWainting = (this._balloonWaiting) ? this._entityVisual.rmmzEvent().isBalloonPlaying() : false;

            // MotionSequel を持っていなければ Idle モーションを再生したい。 (AnimationSequel のみのとき)
            idleRequested = !this._clip.hasMotionSeque();

            // current の Sequel は完了しているが、全体としては未完了の場合は次の Sequel に進む
            if (!rmmzAnimationWainting && !rmmzBalloonWainting && this._cuurentFinished && this._currentClip < this._clip.sequels().length) {
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
