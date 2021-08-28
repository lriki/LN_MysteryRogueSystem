import { tr2 } from "ts/Common";
import { DIdentifiedTiming } from "ts/data/DIdentifyer";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { SCommandContext } from "ts/system/SCommandContext";
import { UName } from "./UName";

export class UIdentify {
    public static identifyByTiming(context: SCommandContext, actor: LEntity , target: LEntity, timing: DIdentifiedTiming, withMessage: boolean = true): void {
        if (REGame.camera.focusedEntity() != actor) return;

        const data = target.data();
        if (data.identifiedTiming.includes(timing)) {
            this.identify(context, target, withMessage);
        }
    }

    public static identify(context: SCommandContext, target: LEntity, withMessage: boolean): void {

        if (REGame.identifyer.checkGlobalIdentified(target)) {
            // 既に名前識別済みであれば個体識別するだけでOK
            target.setIndividualIdentified(true);
        }
        else {
            // 名前未識別であればメッセージも表示する
            const name1 = UName.makeNameAsItem(target);
            target.setIndividualIdentified(true);
            REGame.identifyer.identifyGlobal(target.dataId());
            const name2 = UName.makeNameAsItem(target);
            if (withMessage) {
                context.postMessage(tr2("%1は%2だった。").format(name1, name2));
            }
        }
    } 
}

