import { Vector2 } from "ts/re/math/Vector2";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";

/*
論理位置とMotion再生の順序について
----------
今の移動処理もそうなっているが、論理位置→Motion再生の方がよいだろう。
というか、移動に関してはそうしないと、Motion再生時にどこからどこへ向かえばよいのかがわからない。
Motionの引数として移動後の位置を渡す必要が出てきて、ちょっと余計な情報が増える。

コアスクリプトもそうだし、他のアクション系のゲームの実装もそうだが、
論理座標へ向かって物理座標を移動させる方が自然な気がする。
なにより余計な引数が増えない分、Motion再生後の矛盾が発生しづらくなる。




*/

export class VJumpSequel extends REVisualSequel {
    private _moveSpeed: number = 4;
    private _jumpPeak: number = 0;
    private _jumpCount: number = 0;

    private _realX: number = 0;
    private _realY: number = 0;

    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        const frameCount = context.frameCount();
        const event = visual.rmmzEvent();
        const entity = visual.entity();
        //context.unlockCamera();

        if (frameCount == 0) {
            this.jump(entity.mx - context.startPosition().x, entity.my - context.startPosition().y);
            this._realX = context.startPosition().x;
            this._realY = context.startPosition().y;
        }

        this._jumpCount--;
        
        this._realX = (this._realX * this._jumpCount + entity.mx) / (this._jumpCount + 1.0);
        this._realY = (this._realY * this._jumpCount + entity.my) / (this._jumpCount + 1.0);

        visual.setX(this._realX);
        visual.setY(this._realY - this.jumpHeight() / 40);
        
        if (this._jumpCount <= 0) {
            // end したフレームは、最後に $gamePlayer へ座標を同期する。
            // resetPosition() によってワープ先に Visual を移動させておかないと、
            // ワープで昇っていったすごく上にいる状態の Visual に $gamePlayer が同期してしまう。
            visual.resetPosition();
            console.log(visual.x(), visual.y());

            context.end();
        }
    }

    private jump(xPlus: number, yPlus: number): void {
        // if (Math.abs(xPlus) > Math.abs(yPlus)) {
        //     if (xPlus !== 0) {
        //         this.setDirection(xPlus < 0 ? 4 : 6);
        //     }
        // } else {
        //     if (yPlus !== 0) {
        //         this.setDirection(yPlus < 0 ? 8 : 2);
        //     }
        // }
        // this._x += xPlus;
        // this._y += yPlus;
        const distance = Math.round(Math.sqrt(xPlus * xPlus + yPlus * yPlus));
        this._jumpPeak = 10 + distance - this._moveSpeed;
        this._jumpCount = this._jumpPeak * 2;
        // this.resetStopCount();
        // this.straighten();
    };

    private jumpHeight() {
        return (
            (this._jumpPeak * this._jumpPeak - Math.pow(Math.abs(this._jumpCount - this._jumpPeak), 2)) / 2
        );
    };
}


