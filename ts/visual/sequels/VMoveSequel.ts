import { Vector2 } from "ts/math/Vector2";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";
import { VSequelHelper } from "./VSequelHelper";

/**
 * 倍速移動など、1ターンに複数ブロックを移動する場合、その数だけ Sequel が生成される。
 * そうしないと、途中で立ち寄ったブロックを補完するようなアニメーションが表現できない。
 */
export class REVisualSequel_Move extends REVisualSequel {
    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {
        if (context.isDashing()) {
            // ダッシュ中は座標をそろえて即終了
            context.unlockCamera();
            visual.resetPosition();
            context.end();
        }
        else {

            context.unlockCamera();
            VSequelHelper.updateStepAnimPattern(visual);
    
            // 移動は直線距離ではなく X Y 個別に計算する。
            // 斜め移動時に速度が上がる問題であるが、複数の Entity が同時に移動するとき、
            // 軸平行・斜め問わず完了までの時間が合うようにしないと、一方の動きが遅延してしまう。
        
            const entity = visual.entity();
            const moveSpeed = 4;    // RMMZ の基本移動速度
            //const moveSpeed = 6;    // 
            const speed = Math.pow(2, moveSpeed) / 256;
            //const frameCount = 1.0 / speed; // 水平1Tile移動に何Frame必要？
    
            const velocity = Vector2.mul(Vector2.sub(new Vector2(entity.x, entity.y), context.startPosition()), speed);
    
            const d = Vector2.sub(new Vector2(entity.x, entity.y), visual.position());
    
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
}


