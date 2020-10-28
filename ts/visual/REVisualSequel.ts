import { REVisualSequelContext } from "./REVisualSequelContext";



export abstract class REVisualSequel {
    abstract onUpdate(context: REVisualSequelContext): void;
}


/**
 * 倍速移動など、1ターンに複数ブロックを移動する場合、その数だけ Sequel が生成される。
 * そうしないと、途中で立ち寄ったブロックを補完するようなアニメーションが表現できない。
 */
export class REVisualSequel_Move extends REVisualSequel {
    onUpdate(context: REVisualSequelContext): void {

    }
}

