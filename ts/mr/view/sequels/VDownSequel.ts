import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";

export class VDownSequel extends VSequel {
    onUpdate(visual: VEntity, context: VSequelContext): void {
        const prefab = visual.entity().data.prefab();
        const event = visual.rmmzEvent();
        const image = prefab.downImage;
        if (image) {
            if (image.characterName !== undefined && image.characterIndex !== undefined) {
                event.setImage(image.characterName, image.characterIndex);
            }
            if (image.direction !== undefined) event.setDirection(image.direction);
            if (image.pattern !== undefined) event.setPattern(image.pattern);
            if (image.directionFix !== undefined) event.setDirectionFix(image.directionFix);
            if (image.stepAnime !== undefined) event.setStepAnime(image.stepAnime);
            if (image.walkAnime !== undefined) event.setWalkAnime(image.walkAnime);
        }
    }
}


