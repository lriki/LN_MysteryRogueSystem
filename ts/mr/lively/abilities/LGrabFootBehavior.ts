import { MRSerializable, tr2 } from "ts/mr/Common";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UName } from "ts/mr/utility/UName";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBehavior } from "../behaviors/LBehavior";
import { UMovement } from "ts/mr/utility/UMovement";
import { LEntityId } from "../LObject";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DEventId, WalkEventArgs } from "ts/mr/data/predefineds/DBasicEvents";
import { LEventResult } from "../LEventServer";
import { Helpers } from "ts/mr/system/Helpers";

/**
 * 足つかみ。
 * 
 * 
 */
 @MRSerializable
export class LGrabFootBehavior extends LBehavior {

    /*
    影縫い状態とは違うの？「掴まれる側」のステートは無し？
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
        // const target = UMovement.getFrontBlock(self).getFirstEntity(BlockLayerKind.Unit);
        // if (target) {
        //     this._targetId  = target.entityId();
        // }
        
        REGame.eventServer.subscribe(MRBasics.events.preWalk, this);
    }

    onDetached(self: LEntity): void {
        REGame.eventServer.unsubscribe(MRBasics.events.preWalk, this);
    }

    onEvent(cctx: SCommandContext, eventId: DEventId, args: any): LEventResult {
        const self = this.ownerEntity();

        if (eventId == MRBasics.events.preWalk) {
            const e = (args as WalkEventArgs);

            if (this._targetId.isEmpty()) {
                if (UMovement.checkDirectlyAdjacentEntity(self, e.walker) && Helpers.isHostile(self, e.walker)) {
                    // 新たなターゲットを見つけた
                    this._targetId = e.walker.entityId();
                }
            }
            else {
                if (!UMovement.checkDirectlyAdjacentEntity(self, e.walker)) {
                    // これまで掴んでいたターゲットが強制移動等で離れた
                    this._targetId = LEntityId.makeEmpty();
                }
            }


            if (e.walker.entityId().equals(this._targetId)) {
                self.dir = UMovement.getLookAtDir(self, e.walker);
                cctx.postSequel(self, MRBasics.sequels.attack);
                cctx.postMessage(tr2("%1は身動きが取れない！").format(UName.makeUnitName(e.walker)));
                return LEventResult.Handled;
            }
        }
        return LEventResult.Pass;
    }
}
