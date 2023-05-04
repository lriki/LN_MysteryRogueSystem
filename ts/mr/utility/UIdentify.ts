import { tr2 } from "ts/mr/Common";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { MRLively } from "ts/mr/lively/MRLively";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { DActionId } from "../data/DCommon";
import { UName } from "./UName";

export class UIdentify {
    public static identifyByTiming(cctx: SCommandContext, actor: LEntity , target: LEntity, actionId: DActionId, withMessage: boolean = true): void {
        if (MRLively.mapView.focusedEntity() != actor) return;

        const data = target.data;
        if (data.identificationReaction > 0 && data.identificationReaction == actionId) {
            this.identify(cctx, target, withMessage);
        }
    }

    /**
     * 指定した Entity を識別する。
     */
    public static identify(cctx: SCommandContext, target: LEntity, withMessage: boolean): void {

        if (MRLively.getCurrentIdentifyer().checkGlobalIdentified(target)) {
            // 既に名前識別済みであれば個体識別するだけでOK
            target.setIndividualIdentified(true);
        }
        else {
            // 名前未識別であればメッセージも表示する
            const name1 = UName.makeNameAsItem(target);
            target.setIndividualIdentified(true);
            MRLively.getCurrentIdentifyer().identifyGlobal(target.dataId);
            const name2 = UName.makeNameAsItem(target);
            if (withMessage) {
                cctx.postMessage(tr2("%1は%2だった。").format(name1, name2));
            }
        }
    }
}

