import { assert } from "ts/Common";
import { LEntity } from "ts/objects/LEntity";
import { DescriptionHighlightLevel, LEntityDescription } from "ts/objects/LIdentifyer";
import { REGame } from "ts/objects/REGame";
import { SView } from "ts/system/SView";

export class UName {

    /**
     * [focus] から見た [entity] のユニット名。アイコンを伴わない。
     */
    public static makeUnitName(entity: LEntity, viewSubject?: LEntity): string {
        if (!viewSubject) viewSubject = REGame.camera.focusedEntity();
        assert(viewSubject);
        const nameView = SView.getLookNames(viewSubject, entity);
        const targetName = LEntityDescription.makeDisplayText(nameView.name, DescriptionHighlightLevel.UnitName);
        return targetName;
    }

    /**
     * アイコンを伴う。識別状態によってテキストの色が変わる。
     */
    public static makeNameAsItem(entity: LEntity, viewSubject?: LEntity): string {
        if (!viewSubject) viewSubject = REGame.camera.focusedEntity();
        assert(viewSubject);
        return REGame.identifyer.makeDisplayText(viewSubject, entity);
    }
    
}
