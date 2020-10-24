
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
import { RECommandContext } from "./RECommandContext";

export enum DecisionPhase {
    Manual,
    AIMinor,
    AIMajor,
}

// see: 実装FAQ-Command-Behavior.md
export class REGame_Behavior
{
    // 従来ver は Command 扱いだった。
    // 行動決定に関係する通知は Scheduler から同期的に送られるが、
    // できればこれを RECommandContext.sendCommand みたいに公開したくないので個別定義にしている。
    // また実行内容も onAction などとは少し毛色が違うので、あえて分離してみる。
    onDecisionPhase(context: RECommandContext, phase: DecisionPhase): REResponse { return REResponse.Pass; }

    onPreAction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onPreReaction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onAction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onRection(cmd: RECommand): REResponse { return REResponse.Pass; }
}
