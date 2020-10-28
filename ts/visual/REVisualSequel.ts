



export abstract class REVisualSequel {
    abstract onUpdate(context: REVisualSequelContext): void;
}


/**
 * 倍速移動など、1ターンに複数ブロックを移動する場合、その数だけ Sequel が生成される。
 * そうしないと、途中で立ち寄ったブロックを補完するようなアニメーションが表現できない。
 */
export abstract class REVisualSequel_Move {
    onUpdate(context: REVisualSequelContext): void {

    }
}

