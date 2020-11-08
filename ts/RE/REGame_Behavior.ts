
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

import { ActionId } from "ts/data/REData";
import { REEffectContext } from "ts/system/REEffectContext";
import { RECommand, REResponse } from "../system/RECommand";
import { RECommandContext } from "../system/RECommandContext";
import { REGame_Entity } from "./REGame_Entity";

export enum DecisionPhase {
    Manual,
    AIMinor,
    AIMajor,
}

// see: 実装FAQ-Command-Behavior.md
export class REGame_Behavior {
    dataId: number = 0;

    // Attach されている Behavior や Attribute の状態に依存して変化する情報を取得する。
    // propertyId: see EntityProperties
    // undefined を返した場合は後続の Behavior の onQueryProperty() を呼び出し続ける。
    onQueryProperty(propertyId: number): any { return undefined; }

    // この Behavior が Attach されている Entity に対して送信できる Action を取得する。
    onQueryActions(): ActionId[] { return []; }
    onQueryReactions(): ActionId[] { return []; }

    // 従来ver は Command 扱いだった。
    // 行動決定に関係する通知は Scheduler から同期的に送られるが、
    // できればこれを RECommandContext.sendCommand みたいに公開したくないので個別定義にしている。
    // また実行内容も onAction などとは少し毛色が違うので、あえて分離してみる。
    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse { return REResponse.Pass; }

    onPreAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onPreReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }


    onApplyEffect(context: REEffectContext): REResponse { return REResponse.Pass; }
}

/*
例：聖域の巻物を拾うとき
----------
### player.onPreAction
Player に Attach されている Behavior の onPreAction.
自分の状態を元に行動の可否を決める。
もし Player が手封じ状態であれば実行不能。メッセージを表示して Cancel。ターンを消費。

### item.onPreReaction
Item に Attach されている Behavior の onPreReaction.
もし床に張り付いている状態であれば実行不能。メッセージを表示して Cancel。ターンを消費。
拾うときにアイテムをモンスター化したいとかもここ。

### player.onAction
ItemEntity を Map から取り除き、インベントリに追加する。
持ち物が一杯だった場合はメッセージを表示して Cancel。ターンを消費。




*/
