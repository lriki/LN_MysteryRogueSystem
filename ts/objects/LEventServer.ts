import { assert } from "ts/Common";
import { DEventId } from "ts/data/predefineds/DBasicEvents";
import { RECommandContext } from "ts/system/RECommandContext";
import { LBehavior, LBehaviorId } from "./behaviors/LBehavior";
import { REGame } from "./REGame";

export type EventHandler = (args: any) => void;

// serialize 対象
interface EventSubscriber {
    eventId: DEventId,
    behaviorId: LBehaviorId,
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

export class LEventServer {
    private _entries: EventSubscriber[] = [];
    
    public subscribe(eventId: DEventId, behavior: LBehavior) {
        assert(behavior.isValid());
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

    send(eventId: DEventId, args: any): void {
        this._entries.forEach(e => {
            if (e.eventId == eventId) {
                const b = REGame.world.behavior(e.behaviorId);
                b.onEvent(eventId, args);
            }
        });
    }
}
