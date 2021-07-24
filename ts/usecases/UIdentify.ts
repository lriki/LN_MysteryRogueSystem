import { tr2 } from "ts/Common";
import { DIdentifiedTiming } from "ts/data/DIdentifyer";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { SCommandContext } from "ts/system/SCommandContext";

export class UIdentify {
    public static identifyByTiming(context: SCommandContext, actor: LEntity , target: LEntity, timing: DIdentifiedTiming, withMessage: boolean = true): void {
        if (REGame.camera.focusedEntity() != actor) return;

        const data = target.data();
        if (data.identifiedTiming.includes(timing)) {
            this.identify(context, target, withMessage);
        }
    }

    public static identify(context: SCommandContext, target: LEntity, withMessage: boolean): void {
        const name1 = REGame.identifyer.makeDisplayText(target);
        target.setIndividualIdentified(true);
        REGame.identifyer.identifyGlobal(target.dataId());
        const name2 = REGame.identifyer.makeDisplayText(target);

        if (withMessage) {
            context.postMessage(tr2("%1は%2だった。").format(name1, name2));
        }
    } 
}

