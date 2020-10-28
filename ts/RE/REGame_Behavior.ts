
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

import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { REGame_Entity } from "./REGame_Entity";

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
    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse { return REResponse.Pass; }

    onPreAction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onPreReaction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onAction(cmd: RECommand): REResponse { return REResponse.Pass; }
    onReaction(cmd: RECommand): REResponse { return REResponse.Pass; }
}
