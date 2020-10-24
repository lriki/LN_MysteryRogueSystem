
/**
 * 
 * [2020/9/29] Behavior の代用
 * レンサのワナ、吸収の壺、あくまだんしゃく系
 * 
 * 
 * @note Attribute と Behavior を分ける必要はあるのか？
 * やはり移動がイメージしやすいかな。
 * Player, Enemy 共に Position は持つが、それをキー入力で更新するのか、AI で更新するのかは異なる。
 */

import { RECommand, REResponse } from "./RECommand";

// see: 実装FAQ-Command-Behavior.md
export class RE_Game_Behavior
{
    onPreAction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onPreReaction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onAction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onRection(cmd: RECommand): REResponse { return REResponse.Pass; }
}
