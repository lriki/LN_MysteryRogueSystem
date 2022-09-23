
import { REVisual_Entity } from "../REVisual_Entity";

export class VSequelHelper {
    /*
    public static updateCharacterImage(visual: REVisual_Entity): void {
        const entity = visual.entity();
        const event = visual.rmmzEvent();
        const visibility = visual.visibility();

        const charactorImage = visual.getCharacterImage(entity, visibility);
        if (charactorImage) {
            event.setImage(charactorImage.characterName, charactorImage.characterIndex);

            if (event.isDirectionFixed() != charactorImage.directionFix) {
                event.setDirection(charactorImage.direction);
                event.setDirectionFix(charactorImage.directionFix);
            }

            event.setStepAnime(charactorImage.stepAnime);
            event.setWalkAnime(charactorImage.walkAnime);
            if (!charactorImage.stepAnime && !charactorImage.walkAnime) {
                event.setPattern(charactorImage.pattern);
            }
        }

        if (entity._needVisualRefresh) {
            entity._needVisualRefresh = false;
            event.refresh();
        }

        event.setDirection(entity.dir);
    }
    */

    public static updateStepAnimPattern(visual: REVisual_Entity): void {
        const event = visual.rmmzEvent();
        if (event && event.hasStepAnime()) {

            // Game_CharacterBase.updateAnimationCount
            event._animationCount++;
    
            // Game_CharacterBase.updateAnimation
            if (event._animationCount >= event.animationWait()) {

                // Game_CharacterBase.updatePattern
                event._pattern = (event._pattern + 1) % event.maxPattern();

                event._animationCount = 0;
            }
        }

    }
}


