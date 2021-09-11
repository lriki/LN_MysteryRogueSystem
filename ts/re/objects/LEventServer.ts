import { assert } from "ts/re/Common";
import { DEventId } from "ts/re/data/predefineds/DBasicEvents";
import { RESystem } from "ts/re/system/RESystem";
import { LBehavior } from "./behaviors/LBehavior";
import { LBehaviorId } from "./LObject";
import { REGame } from "./REGame";

export type EventHandler = (args: any) => void;

// serialize 対象
interface EventSubscriber {
    eventId: DEventId,
    behaviorId: LBehaviorId,
}

export enum LEventResult {
    Pass,
    Handled,
}


/*

[2020/12/30] Command と Event を一緒にしてしまう？
----------
やめたほうがよさそう。

例えば倉庫からアイテムを取り出した時の「アイテムが Inventory に入った」といったイベントを考えると、
倉庫から取り出す～プレイヤーのInventoryに入れるまではアトミックな操作でありたい。
※もしこの2つを Command にしたとき、1つ目は成功したけど2つ目は何らかの理由で失敗したとき、取り出した Item Entity が行方不明になる。
ちなみに移動でBlock間を移動するのも結局 Command 分けられずアトミックな操作とした経緯がある。

イベント送信のタイミングについても、仮に2つのCommandそれぞれをフックしたとして、そのハンドラの中でまた何かが起こる可能性が生まれる。
そうするとアトミック性が失われるため危険度が上がる。

基本は次のようになりそう？
- test** で事前検証
- 状態変更を行う (非Command)
- イベント通知

*/

/**
 * 
 * Command との違い
 * ----------
 * - Command: 特定の Entity や攻撃対象など、行いたい動作に対して関係者が決まっているメソッドとして使う。
 * - Event: Commandの前後のタイミングを他に通知して、未知の割り込み動作を許可するタイミングとして使う。
 */
export class LEventServer {
    private _entries: EventSubscriber[] = [];
    
    public subscribe(eventId: DEventId, behavior: LBehavior) {
        assert(behavior.hasId());
        this._entries.push({
            eventId: eventId,
            behaviorId: behavior.id(),
        });
    }

    public unsubscribe(eventId: DEventId, behavior: LBehavior) {
        const id = behavior.id();
        const index = this._entries.findIndex(e => e.eventId == eventId && e.behaviorId == id);
        if (index >= 0) {
            this._entries.splice(index, 1);
        }
    }

    public publish(eventId: DEventId, args: any): boolean {
        for (const e of this._entries) {
            if (e.eventId == eventId) {
                const b = REGame.world.behavior(e.behaviorId);
                const r = b.onEvent(eventId, args);
                if (r != LEventResult.Pass) {
                    RESystem.integration.onEventPublished(eventId, args, true);
                    return false;
                }
            }
        }
        RESystem.integration.onEventPublished(eventId, args, false);
        return true;
    }
}
