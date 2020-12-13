
/**
 * 
 * [2020/11/30] シンボル関数名 vs Id(number)
 * ----------
 * 少なくとも、シンボルを関数名として使うのはやめた方がよさそう。
 * post 側は、相手側の関数名を知る必要は無くしたい。
 * 
 * post では ActionId(Symbol or Number) を渡し、フレームワークによって
 * 従来の onPreReaction, onReaction を呼んでもらう。
 * 
 * ### 相手側の関数名を知っていたいときもある
 * 
 * 相手…というより、自分自身に post したいとき。向き変更や歩行が代表的かな。
 * これらは Action-Reaction のフレームワークがマッチしなかった者たち。
 * 
 * 
 * 
 * 
 * [2020/9/29] Behavior の代用
 * レンサのワナ、吸収の壺、あくまだんしゃく系
 * 
 * 
 * @note Attribute と Behavior を分ける必要はあるのか？
 * やはり移動がイメージしやすいかな。
 * Player, Enemy 共に Position は持つが、それをキー入力で更新するのか、AI で更新するのかは異なる。
 */

import { assert } from "ts/Common";
import { ActionId } from "ts/data/REData";
import { EntityId } from "ts/system/EntityId";
import { REEffectContext, SEffectorFact } from "ts/system/REEffectContext";
import { RECommand, REResponse } from "../../system/RECommand";
import { RECommandContext } from "../../system/RECommandContext";
import { REGame } from "..//REGame";
import { REGame_Entity } from "../REGame_Entity";

export enum DecisionPhase {
    Manual,
    AIMinor,
    AIMajor,
}

export interface CommandArgs {
    self: REGame_Entity,
    sender: REGame_Entity,
    args: any,
};

export const onPrePickUpReaction = Symbol("onPicking");
export const onPrePutReaction = Symbol("onPrePutReaction");
export const onPreThrowReaction = Symbol("onPreThrowReaction");
export const onThrowReaction = Symbol("onThrowReaction");
export const onMoveAsProjectile = Symbol("onMoveAsProjectile");

// see: 実装FAQ-Command-Behavior.md
export class LBehavior {
    dataId: number = 0;
    _ownerEntityId: EntityId = { index: 0, key: 0 };
    
    ownerEntity(): REGame_Entity {
        assert(this._ownerEntityId.index > 0);
        return REGame.world.entity(this._ownerEntityId);
    }

    onRemoveEntityFromWhereabouts(context: RECommandContext, entity: REGame_Entity): REResponse { return REResponse.Pass; }

    [onPrePickUpReaction](args: CommandArgs, context: RECommandContext): REResponse {
        return REResponse.Pass;
    }

    // Attach されている Behavior や Attribute の状態に依存して変化する情報を取得する。
    // propertyId: see EntityProperties
    // undefined を返した場合は後続の Behavior の onQueryProperty() を呼び出し続ける。
    onQueryProperty(propertyId: number): any { return undefined; }

    // この Behavior が Attach されている Entity に対して送信できる Action を取得する。
    // 主に UI 表示で使用するもので、Action を実行したときに "成功" するかどうかは気にしない。
    onQueryActions(actions: ActionId[]): ActionId[] { return actions; }
    onQueryReactions(actions: ActionId[]): ActionId[] { return actions; }

    // 従来ver は Command 扱いだった。
    // 行動決定に関係する通知は Scheduler から同期的に送られるが、
    // できればこれを RECommandContext.sendCommand みたいに公開したくないので個別定義にしている。
    // また実行内容も onAction などとは少し毛色が違うので、あえて分離してみる。
    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse { return REResponse.Pass; }

    onPreAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onPreReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }




    onCollectEffector(owner: REGame_Entity, data: SEffectorFact): void {}
    onApplyEffect(context: REEffectContext): REResponse { return REResponse.Pass; }

    /** 1行動消費単位の終了時点 */
    onTurnEnd(context: RECommandContext): REResponse { return REResponse.Pass; }
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
