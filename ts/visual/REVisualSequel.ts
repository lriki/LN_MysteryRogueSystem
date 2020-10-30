import { REVisualSequelContext } from "./REVisualSequelContext";
import { REVisual_Entity } from "./REVisual_Entity";



export abstract class REVisualSequel {
    abstract onUpdate(entity: REVisual_Entity, context: REVisualSequelContext): void;
}


/**
 * 倍速移動など、1ターンに複数ブロックを移動する場合、その数だけ Sequel が生成される。
 * そうしないと、途中で立ち寄ったブロックを補完するようなアニメーションが表現できない。
 */
export class REVisualSequel_Move extends REVisualSequel {
    onUpdate(entity: REVisual_Entity, context: REVisualSequelContext): void {

        console.log("onUpdate", context.frameCount());

        if (context.frameCount() > 60) {
            entity.resetPosition();
            context.end();
        }
    }
}

