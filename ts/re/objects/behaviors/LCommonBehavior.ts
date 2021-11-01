import { DActionId } from "ts/re/data/DAction";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LBehavior } from "./LBehavior";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SActivityContext } from "ts/re/system/SActivityContext";
import { SCommandResponse } from "ts/re/system/RECommand";
import { REBasics } from "ts/re/data/REBasics";
import { USearch } from "ts/re/usecases/USearch";




/**
 * 全 Entity に共通するもの。
 * 
 * ひとまず、一般的ではないかもしれないけど、検証用途や一時的にここに機能を置くこともある。
 * というか現状何が本当に必要なのか不透明な状態なので、あるていど機能のまとまりが見えてきたら派生クラス作って分離していく。
 */
export class LCommonBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LCommonBehavior);
        return b
    }

    onQueryActions(actions: DActionId[]): DActionId[] {
        return actions;
        //.concat([
        //    DBasics.actions.PickActionId,
        //]);
    }
    
    onActivity(self: LEntity, context: SCommandContext, actx: SActivityContext): SCommandResponse {
        const activity = actx.activity();
        
        if (activity.actionId() == REBasics.actions.FallActionId) {
            const target = USearch.getFirstUnderFootEntity(self);
            if (target) {
                actx.postHandleActivity(context, target);
                return SCommandResponse.Handled;
            }
        }
        return SCommandResponse.Handled;
    }
}

