import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";


export class VEarthquake2Sequel extends REVisualSequel {

    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        const frameCount = context.frameCount();
        
        if (frameCount == 0) {
            $gameScreen.startShake(9, 9, 120);
        }
        
        if (frameCount > 120) {
            visual.resetPosition();
            context.end();
        }
    }
}


