import { tr2 } from "ts/mr/Common";
import { DIdentifiedTiming } from "ts/mr/data/DIdentifyer";
import { LEntity } from "ts/mr/lively/LEntity";
import { REGame } from "ts/mr/lively/REGame";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UName } from "./UName";

export class UIdentify {
    public static identifyByTiming(cctx: SCommandContext, actor: LEntity , target: LEntity, timing: DIdentifiedTiming, withMessage: boolean = true): void {
        if (REGame.camera.focusedEntity() != actor) return;

        const data = target.data;
        if (data.identifiedTiming.includes(timing)) {
            this.identify(cctx, target, withMessage);
        }
    }

    /**
     * 指定した Entity を識別する。
     */
    public static identify(cctx: SCommandContext, target: LEntity, withMessage: boolean): void {

        if (REGame.identifyer.checkGlobalIdentified(target)) {
            // 既に名前識別済みであれば個体識別するだけでOK
            target.setIndividualIdentified(true);
        }
        else {
            // 名前未識別であればメッセージも表示する
            const name1 = UName.makeNameAsItem(target);
            target.setIndividualIdentified(true);
            REGame.identifyer.identifyGlobal(target.dataId);
            const name2 = UName.makeNameAsItem(target);
            if (withMessage) {
                cctx.postMessage(tr2("%1は%2だった。").format(name1, name2));
            }
        }
    }
}

