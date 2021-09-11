import { DActionId } from "ts/re/data/DAction";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LBehavior } from "./LBehavior";




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
}

