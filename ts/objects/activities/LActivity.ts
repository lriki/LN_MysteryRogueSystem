import { LEntity } from "../LEntity";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";

/**
 * 主に GUI 上から選択できる各種行動
 * 
 * Command のように利用できるが、Activity は必ず Dialog から post される。
 * 大方針として、プレイヤー操作などコマンドチェーンの外側から実行される Command を表すものであり、
 * 行動履歴として記録される。シリアライズされ、ファイルに保存される。
 */
export class LActivity {
    private _subject: LEntityId;    // Command 送信対象 (主語)
    private _object: LEntityId;     // (目的語)

    public constructor() {
        this._subject = LEntityId.makeEmpty();
        this._object = LEntityId.makeEmpty();
    }

    public _setup(subject: LEntity, object: LEntity): void {
        this._subject = subject.entityId();
        this._object = object.entityId();
    }

    public subject(): LEntity {
        return REGame.world.entity(this._subject);
    }

    public object(): LEntity {
        return REGame.world.entity(this._object);
    }
}

