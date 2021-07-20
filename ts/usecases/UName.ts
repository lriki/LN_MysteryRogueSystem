import { assert } from "ts/Common";
import { LEntity } from "ts/objects/LEntity";
import { DescriptionHighlightLevel, LEntityDescription } from "ts/objects/LIdentifyer";
import { REGame } from "ts/objects/REGame";

export class UName {

    /**
     * [focus] から見た [entity] のユニット名。アイコンを伴わない。
     */
     public static makeUnitNameByFocused(entity: LEntity): string {
        const watcher = REGame.camera.focusedEntity();
        assert(watcher);
        return this.makeUnitName(watcher, entity);
    }

    /**
     * [focus] から見た [entity] のユニット名。アイコンを伴わない。
     */
    public static makeUnitName(watcher: LEntity, entity: LEntity): string {
        const targetName = LEntityDescription.makeDisplayText(this.makeTargetName(entity), DescriptionHighlightLevel.UnitName);
        return targetName;
    }
    
    private static makeTargetName(/*subject: REGame_Entity, */target: LEntity): string {
        
        const name = target.getDisplayName().name;

        // TODO: player(watcher) が暗闇状態等の時は、ここで "なにものか" に名前を変えたりする

        return name;
    }

    public static makeNameAsItem(entity: LEntity): string {
        return REGame.identifyer.makeDisplayText(entity);
    }
    
}
