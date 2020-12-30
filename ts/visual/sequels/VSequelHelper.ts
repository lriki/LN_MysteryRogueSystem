
import { REVisual_Entity } from "../REVisual_Entity";

export class VSequelHelper {

    static updateWaitAnimPattern(visual: REVisual_Entity): void {
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


