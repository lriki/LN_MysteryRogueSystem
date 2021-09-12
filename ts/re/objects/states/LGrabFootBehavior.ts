import { tr2 } from "ts/re/Common";
import { REResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UName } from "ts/re/usecases/UName";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onGrounded, testPickOutItem } from "../behaviors/LBehavior";
import { UMovement } from "ts/re/usecases/UMovement";
import { BlockLayerKind } from "../LBlockLayer";
import { LEntityId } from "../LObject";
import { DBasics } from "ts/re/data/DBasics";
import { DEventId, RoomEventArgs, WalkEventArgs } from "ts/re/data/predefineds/DBasicEvents";
import { LEventResult } from "../LEventServer";

/**
 * 足つかみ。
 * 
 * 
 */
export class LGrabFootBehavior extends LBehavior {

    /*
    影縫い状態とは違うのか？
    ----------
    SFCトルネコのマドハンドのように、掴まれている状態で移動しようとしたら
    相手にモーション取らせるようなケースでは、ステート扱いしないほうが良い。
    - Entity に対して同一種類のステートを複数アタッチすることはできないため。
    - 「掴まれ」ステートの原因はどのエネミーか？を覚えておくのに手間がかかる。
    - 解除のタイミングは「隣接しなくなったら」であるため、通常のステート解除の枠組みではない。
    
    頑張ればどれもステート側で対応できるが、代替手段として Event がある。
    Event を使う場合は単に Activity を reject すればよいだけ。
    ステートの仕組み自体にに手を入れるよりは Event で対応したほうが、後々メンテも楽だろう。
    */

    private _targetId: LEntityId;

    public constructor() {
        super();
        this._targetId = LEntityId.makeEmpty();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LGrabFootBehavior);
        return b;
    }
    
    onAttached(self: LEntity): void {
        console.log("LGrabFootBehavior");
        const target = UMovement.getFrontBlock(self).getFirstEntity(BlockLayerKind.Unit);
        if (target) {
            this._targetId  = target.entityId();
        }
        
        REGame.eventServer.subscribe(DBasics.events.preWalk, this);
    }

    onDetached(self: LEntity): void {
        REGame.eventServer.unsubscribe(DBasics.events.preWalk, this);
    }

    onEvent(eventId: DEventId, args: any): LEventResult {
        if (eventId == DBasics.events.preWalk) {
            console.log("args", args);
            const e = (args as WalkEventArgs);
            if (e.walker.entityId().equals(this._targetId)) {
                console.log("つかまれている");
                return LEventResult.Pass;
            }
        }
        return LEventResult.Pass;
    }
}
