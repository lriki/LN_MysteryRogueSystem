import { Vector2 } from "ts/mr/math/Vector2";
import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";

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

export class VWarpSequel extends VSequel {
    onUpdate(visual: VEntity, context: VSequelContext): void {

        const frameCount = context.frameCount();
        //context.unlockCamera();

        visual.setPosition(
            new Vector2(
                context.startPosition().x,
                context.startPosition().y - (frameCount * 0.5)));
        
        if (frameCount > 60) {
            // end したフレームは、最後に $gamePlayer へ座標を同期する。
            // resetPosition() によってワープ先に Visual を移動させておかないと、
            // ワープで昇っていったすごく上にいる状態の Visual に $gamePlayer が同期してしまう。
            visual.resetPosition();

            context.end();
        }
    }
}


