import { Vector2 } from "ts/mr/math/Vector2";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";

/**
 * 吹き飛ばされ移動。
 * 矢を撃つのとは別なので注意。
 */
export class VBlowMoveSequel extends REVisualSequel {
    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        // 移動は直線距離ではなく X Y 個別に計算する。
        // 斜め移動時に速度が上がる問題であるが、複数の Entity が同時に移動するとき、
        // 軸平行・斜め問わず完了までの時間が合うようにしないと、一方の動きが遅延してしまう。
    
        const entity = visual.entity();
        const moveSpeed = 6;    // RMMZ の基本移動速度
        const speed = Math.pow(2, moveSpeed) / 256;
        //const frameCount = 1.0 / speed; // 水平1Tile移動に何Frame必要？

        const velocity = Vector2.mul(Vector2.sub(new Vector2(entity.mx, entity.my), context.startPosition()), speed);

        const d = Vector2.sub(new Vector2(entity.mx, entity.my), visual.position());

        if ((Math.abs(d.x) <= speed && Math.abs(d.y) <= speed) ||
            context.frameCount() > 30) {    // 速度に何か異常があっても、時間経過で必ず終了させる
            visual.resetPosition();
            context.end();
        }
        else {
            //const v = Vector2.mul(Vector2.sign(d), speed);
            visual.setPosition(Vector2.add(visual.position(), velocity));
        }
    }
}


